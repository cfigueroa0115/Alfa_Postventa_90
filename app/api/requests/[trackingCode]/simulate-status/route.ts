import { NextResponse } from 'next/server';
import { handleApiError, AppError } from '@/lib/errors';
import { simulateStatusAdvance } from '@/lib/services/request.service';
import { isValidTrackingCode } from '@/lib/tracking-code';

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ trackingCode: string }> }
) {
  try {
    const { trackingCode } = await params;

    if (!isValidTrackingCode(trackingCode)) {
      throw AppError.validation('Formato de código de radicado inválido');
    }

    const result = await simulateStatusAdvance(trackingCode);

    return NextResponse.json(result);
  } catch (error) {
    // Map state machine errors to AppError
    if (error instanceof Error && error.message.includes('estado finalizado')) {
      return handleApiError(AppError.stateTransition(error.message));
    }
    return handleApiError(error);
  }
}
