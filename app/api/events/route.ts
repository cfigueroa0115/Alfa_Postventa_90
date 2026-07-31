import { NextResponse } from 'next/server';
import { trackingEventSchema } from '@/lib/validation';
import { sanitizeMetadata } from '@/lib/validation/sanitize';
import { handleApiError, AppError } from '@/lib/errors';
import * as eventsRepo from '@/lib/repositories/events.repo';
import * as sessionsRepo from '@/lib/repositories/sessions.repo';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = trackingEventSchema.parse(body);

    // Verify session exists
    const session = await sessionsRepo.getSessionById(validated.sessionId);
    if (!session) {
      throw AppError.validation('ID de sesión inválido — la sesión no existe');
    }

    // Sanitize metadata
    const sanitizedMetadata = validated.metadata
      ? sanitizeMetadata(validated.metadata)
      : undefined;

    const event = await eventsRepo.createEvent({
      sessionId: validated.sessionId,
      eventType: validated.eventType,
      step: validated.step,
      metadata: sanitizedMetadata,
    });

    return NextResponse.json(
      { eventId: event.id, createdAt: event.createdAt },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
