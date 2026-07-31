import { db } from '@/db';
import { demoSessions, type DemoSession } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function createSession(data: {
  userAgent?: string;
  viewport?: string;
  referrer?: string;
}): Promise<DemoSession> {
  const [session] = await db
    .insert(demoSessions)
    .values({
      userAgent: data.userAgent,
      viewport: data.viewport,
      referrer: data.referrer,
    })
    .returning();

  return session;
}

export async function getSessionById(id: string): Promise<DemoSession | null> {
  const [session] = await db
    .select()
    .from(demoSessions)
    .where(eq(demoSessions.id, id))
    .limit(1);

  return session ?? null;
}
