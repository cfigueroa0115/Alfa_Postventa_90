import { db } from '@/db';
import { feedback, type Feedback } from '@/db/schema';
import { eq, avg } from 'drizzle-orm';

export async function createFeedback(data: {
  requestId: string;
  trackingCode: string;
  cesScore: number;
  comment?: string;
}): Promise<Feedback> {
  const [entry] = await db
    .insert(feedback)
    .values({
      requestId: data.requestId,
      trackingCode: data.trackingCode,
      cesScore: data.cesScore,
      comment: data.comment,
    })
    .returning();

  return entry;
}

export async function getFeedbackByRequestId(requestId: string): Promise<Feedback | null> {
  const [entry] = await db
    .select()
    .from(feedback)
    .where(eq(feedback.requestId, requestId))
    .limit(1);

  return entry ?? null;
}

export async function getAverageCES(): Promise<number | null> {
  const [result] = await db
    .select({ avg: avg(feedback.cesScore) })
    .from(feedback);

  return result?.avg ? Number(result.avg) : null;
}
