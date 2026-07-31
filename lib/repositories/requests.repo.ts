import { db } from '@/db';
import { demoRequests, type DemoRequest } from '@/db/schema';
import { eq, count, and, gte, lt } from 'drizzle-orm';

export async function createRequest(data: {
  sessionId: string;
  trackingCode: string;
  formData: unknown;
  status?: string;
  idempotencyKey?: string;
}): Promise<DemoRequest> {
  const [request] = await db
    .insert(demoRequests)
    .values({
      sessionId: data.sessionId,
      trackingCode: data.trackingCode,
      formData: data.formData,
      status: data.status ?? 'radicado',
      idempotencyKey: data.idempotencyKey,
    })
    .returning();

  return request;
}

export async function getRequestByIdempotencyKey(key: string): Promise<DemoRequest | null> {
  const [request] = await db
    .select()
    .from(demoRequests)
    .where(eq(demoRequests.idempotencyKey, key))
    .limit(1);
  return request ?? null;
}

export async function getRequestByTrackingCode(trackingCode: string): Promise<DemoRequest | null> {
  const [request] = await db
    .select()
    .from(demoRequests)
    .where(eq(demoRequests.trackingCode, trackingCode))
    .limit(1);

  return request ?? null;
}

export async function updateRequestStatus(id: string, status: string): Promise<DemoRequest> {
  const [updated] = await db
    .update(demoRequests)
    .set({
      status,
      updatedAt: new Date(),
    })
    .where(eq(demoRequests.id, id))
    .returning();

  return updated;
}

export async function getNextSequenceForDate(date: Date): Promise<number> {
  const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

  const [result] = await db
    .select({ count: count() })
    .from(demoRequests)
    .where(
      and(
        gte(demoRequests.createdAt, startOfDay),
        lt(demoRequests.createdAt, endOfDay)
      )
    );

  return (Number(result?.count) || 0) + 1;
}

export async function getTotalRequests(): Promise<number> {
  const [result] = await db
    .select({ count: count() })
    .from(demoRequests);

  return Number(result?.count) || 0;
}
