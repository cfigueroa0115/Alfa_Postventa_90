import { NextResponse } from 'next/server';
import { db } from '@/db';
import { sql } from 'drizzle-orm';

export async function GET() {
  const timestamp = new Date().toISOString();

  try {
    // Verify database connectivity with a simple query
    await db.execute(sql`SELECT 1`);

    return NextResponse.json({
      status: 'ok',
      app: 'alfa-postventa-90',
      database: 'connected',
      timestamp,
      version: '1.0.0',
    });
  } catch {
    return NextResponse.json(
      {
        status: 'degraded',
        app: 'alfa-postventa-90',
        database: 'disconnected',
        timestamp,
        version: '1.0.0',
      },
      { status: 503 }
    );
  }
}
