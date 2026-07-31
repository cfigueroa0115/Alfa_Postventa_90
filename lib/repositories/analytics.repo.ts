import { db } from '@/db';
import { sql } from 'drizzle-orm';

export async function countUniqueSessionsByEventType(): Promise<{ eventType: string; count: number }[]> {
  const results = await db.execute(
    sql`SELECT event_type, COUNT(DISTINCT session_id) as count FROM tracking_events GROUP BY event_type`
  );
  return (results.rows as Array<{ event_type: string; count: string }>).map(r => ({
    eventType: r.event_type,
    count: Number(r.count),
  }));
}

export async function getRequestStatusDistribution(): Promise<{ status: string; count: number }[]> {
  const results = await db.execute(
    sql`SELECT status, COUNT(*) as count FROM demo_requests GROUP BY status`
  );
  const rows = (results.rows as Array<{ status: string; count: string }>).map(r => ({
    status: r.status,
    count: Number(r.count),
  }));
  
  // Ensure all statuses are represented
  const allStatuses = ['radicado', 'en_validacion', 'procesado', 'finalizado'];
  return allStatuses.map(s => ({
    status: s,
    count: rows.find(r => r.status === s)?.count ?? 0,
  }));
}

export async function getCESDistribution(): Promise<{ score: number; count: number }[]> {
  const results = await db.execute(
    sql`SELECT ces_score, COUNT(*) as count FROM feedback WHERE ces_score BETWEEN 1 AND 7 GROUP BY ces_score ORDER BY ces_score`
  );
  const rows = (results.rows as Array<{ ces_score: number; count: string }>).map(r => ({
    score: Number(r.ces_score),
    count: Number(r.count),
  }));
  
  // Ensure all scores 1-7 are represented
  return Array.from({ length: 7 }, (_, i) => ({
    score: i + 1,
    count: rows.find(r => r.score === i + 1)?.count ?? 0,
  }));
}

export async function getFilingTimeStatistics(): Promise<{
  sampleSize: number;
  averageSeconds: number | null;
  medianSeconds: number | null;
  p90Seconds: number | null;
}> {
  const results = await db.execute(
    sql`SELECT EXTRACT(EPOCH FROM (r.filed_at - s.started_at)) as duration_seconds
        FROM demo_requests r
        INNER JOIN demo_sessions s ON r.session_id = s.id
        WHERE r.filed_at IS NOT NULL AND s.started_at IS NOT NULL
        AND r.filed_at >= s.started_at
        AND EXTRACT(EPOCH FROM (r.filed_at - s.started_at)) > 0
        AND EXTRACT(EPOCH FROM (r.filed_at - s.started_at)) < 3600
        ORDER BY duration_seconds`
  );
  
  const durations = (results.rows as Array<{ duration_seconds: string }>)
    .map(r => Number(r.duration_seconds))
    .filter(d => d > 0 && d < 3600);
  
  if (durations.length === 0) {
    return { sampleSize: 0, averageSeconds: null, medianSeconds: null, p90Seconds: null };
  }
  
  const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
  const sorted = [...durations].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];
  const p90Index = Math.floor(sorted.length * 0.9);
  const p90 = sorted[p90Index] ?? sorted[sorted.length - 1];
  
  return {
    sampleSize: durations.length,
    averageSeconds: Math.round(avg),
    medianSeconds: Math.round(median),
    p90Seconds: Math.round(p90),
  };
}
