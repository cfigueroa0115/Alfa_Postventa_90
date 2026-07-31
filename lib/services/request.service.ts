import { requestsRepo, statusHistoryRepo, eventsRepo } from '@/lib/repositories';
import { generateTrackingCode } from '@/lib/tracking-code';
import { getNextStatus, STATUS_DESCRIPTIONS, type RequestStatus } from './state-machine';
import { AppError } from '@/lib/errors';
import { sanitizeFormData } from '@/lib/validation';
import { sanitizeDemoRequest } from '@/lib/privacy';
import type { UpdateContactFormData } from '@/lib/validation';

export async function fileRequest(sessionId: string, formData: UpdateContactFormData) {
  // Sanitize form data
  const sanitized = sanitizeFormData(formData as unknown as Record<string, unknown>);

  // Mask sensitive data before persisting
  const maskedFormData = sanitizeDemoRequest(sanitized);

  // Generate tracking code
  const today = new Date();
  const trackingCode = generateTrackingCode(today);

  // Create request
  const request = await requestsRepo.createRequest({
    sessionId,
    trackingCode,
    formData: maskedFormData,
    status: 'radicado',
  });

  if (!request) {
    throw AppError.database('No se pudo crear la solicitud');
  }

  // Create initial status history entry
  await statusHistoryRepo.createStatusEntry({
    requestId: request.id,
    status: 'radicado',
    description: STATUS_DESCRIPTIONS.radicado,
  });

  // Record event
  await eventsRepo.createEvent({
    sessionId,
    eventType: 'request_filed',
    step: 'confirmacion',
    metadata: { trackingCode },
  });

  return request;
}

export async function getRequestWithTimeline(trackingCode: string) {
  const request = await requestsRepo.getRequestByTrackingCode(trackingCode);
  if (!request) {
    throw AppError.notFound('No se encontró una solicitud con el código proporcionado');
  }
  // Timeline will be fetched separately
  return request;
}

export async function simulateStatusAdvance(trackingCode: string) {
  const request = await requestsRepo.getRequestByTrackingCode(trackingCode);
  if (!request) {
    throw AppError.notFound('No se encontró una solicitud con el código proporcionado');
  }

  const currentStatus = request.status as RequestStatus;
  const newStatus = getNextStatus(currentStatus); // throws if finalizado

  // Update request status
  await requestsRepo.updateRequestStatus(request.id, newStatus);

  // Create status history entry
  await statusHistoryRepo.createStatusEntry({
    requestId: request.id,
    status: newStatus,
    description: STATUS_DESCRIPTIONS[newStatus],
  });

  return {
    trackingCode,
    previousStatus: currentStatus,
    newStatus,
    changedAt: new Date().toISOString(),
  };
}
