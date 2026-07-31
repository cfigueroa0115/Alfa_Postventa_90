import { NextResponse } from 'next/server';
import { createRequestSchema } from '@/lib/validation';
import { handleApiError, AppError } from '@/lib/errors';
import { fileRequest } from '@/lib/services/request.service';
import * as requestsRepo from '@/lib/repositories/requests.repo';

export async function POST(request: Request) {
  try {
    const idempotencyKey = request.headers.get('x-idempotency-key');
    
    if (!idempotencyKey || idempotencyKey.length < 10 || idempotencyKey.length > 100) {
      throw AppError.validation('Se requiere un encabezado x-idempotency-key válido (10-100 caracteres)');
    }

    // Check if a request with this idempotency key already exists
    const existing = await requestsRepo.getRequestByIdempotencyKey(idempotencyKey);
    if (existing) {
      return NextResponse.json(
        {
          requestId: existing.id,
          trackingCode: existing.trackingCode,
          status: existing.status,
          filedAt: existing.filedAt,
          idempotentReplay: true,
        },
        { status: 200 }
      );
    }

    const body = await request.json();
    const validated = createRequestSchema.parse(body);

    const result = await fileRequest(validated.sessionId, validated.formData, idempotencyKey);

    return NextResponse.json(
      {
        requestId: result.id,
        trackingCode: result.trackingCode,
        status: result.status,
        filedAt: result.filedAt,
        idempotentReplay: false,
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
