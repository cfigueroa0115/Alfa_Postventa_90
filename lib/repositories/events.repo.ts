import { db } from '@/db';
import { trackingEvents, type TrackingEvent } from '@/db/schema';
import { eq, desc, count } from 'drizzle-orm';

export async function createEvent(data: {
  sessionId: string;
  eventType: string;
  step?: string;
  metadata?: unknown;
}): Promise<TrackingEvent> {
  const [event] = await db
    .insert(trackingEvents)
    .values({
      sessionId: data.sessionId,
      eventType: data.eventType,
      step: data.step,
      metadata: data.metadata,
    })
    .returning();

  return event;
}

export async function getEventsBySession(sessionId: string): Promise<TrackingEvent[]> {
  return db
    .select()
    .from(trackingEvents)
    .where(eq(trackingEvents.sessionId, sessionId))
    .orderBy(desc(trackingEvents.createdAt));
}

export async function countEventsByType(): Promise<{ eventType: string; count: number }[]> {
  const results = await db
    .select({
      eventType: trackingEvents.eventType,
      count: count(),
    })
    .from(trackingEvents)
    .groupBy(trackingEvents.eventType);

  return results.map((r) => ({
    eventType: r.eventType,
    count: Number(r.count),
  }));
}
