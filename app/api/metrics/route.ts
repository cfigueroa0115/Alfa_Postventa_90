import { NextResponse } from 'next/server';
import { handleApiError } from '@/lib/errors';
import { getMetrics } from '@/lib/services/metrics.service';

export async function GET() {
  try {
    const metrics = await getMetrics();
    return NextResponse.json(metrics);
  } catch (error) {
    return handleApiError(error);
  }
}
