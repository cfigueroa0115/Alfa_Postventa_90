import { NextResponse } from 'next/server';
import { handleApiError, AppError } from '@/lib/errors';
import * as requestsRepo from '@/lib/repositories/requests.repo';
import * as statusHistoryRepo from '@/lib/repositories/status-history.repo';
import { isValidTrackingCode } from '@/lib/tracking-code';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ trackingCode: string }> }
) {
  try {
    const { trackingCode } = await params;

    if (!isValidTrackingCode(trackingCode)) {
      throw AppError.validation('Formato de código de radicado inválido');
    }

    const requestData = await requestsRepo.getRequestByTrackingCode(trackingCode);
    if (!requestData) {
      throw AppError.notFound('No se encontró una solicitud con el código proporcionado');
    }

    const timeline = await statusHistoryRepo.getHistoryByRequestId(requestData.id);

    return NextResponse.json({
      requestId: requestData.id,
      trackingCode: requestData.trackingCode,
      status: requestData.status,
      filedAt: requestData.filedAt,
      timeline: timeline.map((entry) => ({
        status: entry.status,
        description: entry.description,
        changedAt: entry.changedAt,
      })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
