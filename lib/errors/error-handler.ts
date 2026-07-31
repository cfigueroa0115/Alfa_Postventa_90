import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { AppError, ErrorCode } from './app-error';

interface ErrorResponse {
  error: string;
  code: ErrorCode;
  details?: Record<string, unknown> | Array<{ field: string; message: string }>;
}

export function handleApiError(error: unknown): NextResponse<ErrorResponse> {
  // Errores de validación Zod
  if (error instanceof ZodError) {
    const fieldErrors = error.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return NextResponse.json(
      {
        error: 'Datos inválidos',
        code: ErrorCode.VALIDATION_ERROR,
        details: fieldErrors,
      },
      { status: 400 }
    );
  }

  // Errores de aplicación
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        details: error.details,
      },
      { status: error.statusCode }
    );
  }

  // Errores inesperados - no exponer stack traces en producción
  console.error('[INTERNAL_ERROR]', error instanceof Error ? error.message : 'Error desconocido');
  return NextResponse.json(
    {
      error: 'Error interno del servidor. Por favor intente de nuevo más tarde.',
      code: ErrorCode.INTERNAL_ERROR,
    },
    { status: 500 }
  );
}
