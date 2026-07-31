import { NextResponse } from 'next/server';
import { createRequestSchema } from '@/lib/validation';
import { handleApiError } from '@/lib/errors';
import { fileRequest } from '@/lib/services/request.service';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = createRequestSchema.parse(body);

    const result = await fileRequest(validated.sessionId, validated.formData);

    return NextResponse.json(
      {
        requestId: result.id,
        trackingCode: result.trackingCode,
        status: result.status,
        filedAt: result.filedAt,
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
