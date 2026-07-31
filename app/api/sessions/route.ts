import { NextResponse } from 'next/server';
import { createSessionSchema } from '@/lib/validation';
import { handleApiError } from '@/lib/errors';
import * as sessionsRepo from '@/lib/repositories/sessions.repo';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = createSessionSchema.parse(body);

    const session = await sessionsRepo.createSession({
      userAgent: validated.userAgent,
      viewport: validated.viewport,
      referrer: validated.referrer,
    });

    return NextResponse.json(
      { sessionId: session.id, startedAt: session.startedAt },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
