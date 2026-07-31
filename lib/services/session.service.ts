import { sessionsRepo } from '@/lib/repositories';
import { AppError } from '@/lib/errors';

export async function startSession(data: {
  userAgent?: string;
  viewport?: string;
  referrer?: string;
}) {
  const session = await sessionsRepo.createSession(data);
  if (!session) {
    throw AppError.database('No se pudo crear la sesión de demostración');
  }
  return session;
}

export async function findSession(sessionId: string) {
  const session = await sessionsRepo.getSessionById(sessionId);
  if (!session) {
    throw AppError.notFound('Sesión no encontrada');
  }
  return session;
}
