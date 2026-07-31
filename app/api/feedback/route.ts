import { NextResponse } from 'next/server';
import { feedbackSchema } from '@/lib/validation';
import { handleApiError, AppError } from '@/lib/errors';
import * as feedbackRepo from '@/lib/repositories/feedback.repo';
import * as requestsRepo from '@/lib/repositories/requests.repo';
import * as eventsRepo from '@/lib/repositories/events.repo';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = feedbackSchema.parse(body);

    // Verify tracking code exists
    const existingRequest = await requestsRepo.getRequestByTrackingCode(validated.trackingCode);
    if (!existingRequest) {
      throw AppError.notFound('No se encontró una solicitud con el código proporcionado');
    }

    const feedback = await feedbackRepo.createFeedback({
      requestId: existingRequest.id,
      trackingCode: validated.trackingCode,
      cesScore: validated.cesScore,
      comment: validated.comment,
    });

    // Record tracking event (silently)
    try {
      await eventsRepo.createEvent({
        sessionId: existingRequest.sessionId,
        eventType: 'feedback_submitted',
        step: 'confirmacion',
        metadata: { cesScore: validated.cesScore },
      });
    } catch {
      // Don't fail the feedback submission if event tracking fails
    }

    return NextResponse.json(
      { feedbackId: feedback.id, createdAt: feedback.createdAt },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
