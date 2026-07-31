import { db } from '@/db';
import { statusHistory, type StatusHistoryEntry } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';

export async function createStatusEntry(data: {
  requestId: string;
  status: string;
  description?: string;
}): Promise<StatusHistoryEntry> {
  const [entry] = await db
    .insert(statusHistory)
    .values({
      requestId: data.requestId,
      status: data.status,
      description: data.description,
    })
    .returning();

  return entry;
}

export async function getHistoryByRequestId(requestId: string): Promise<StatusHistoryEntry[]> {
  return db
    .select()
    .from(statusHistory)
    .where(eq(statusHistory.requestId, requestId))
    .orderBy(asc(statusHistory.changedAt));
}
