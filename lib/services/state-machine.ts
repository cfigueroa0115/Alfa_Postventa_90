/**
 * Máquina de estados para solicitudes de actualización de datos.
 * Secuencia: radicado → en_validacion → procesado → finalizado (RN-002)
 * No se permite retroceder ni saltar estados.
 */

export const REQUEST_STATUSES = [
  'radicado',
  'en_validacion',
  'procesado',
  'finalizado',
] as const;

export type RequestStatus = (typeof REQUEST_STATUSES)[number];

/** Mapa de descripciones legibles para cada estado */
export const STATUS_DESCRIPTIONS: Record<RequestStatus, string> = {
  radicado: 'Solicitud radicada exitosamente',
  en_validacion: 'Documentos en proceso de validación',
  procesado: 'Solicitud procesada y en actualización',
  finalizado: 'Trámite completado exitosamente',
};

/** Mapa de labels para mostrar en la UI */
export const STATUS_LABELS: Record<RequestStatus, string> = {
  radicado: 'Radicado',
  en_validacion: 'En validación',
  procesado: 'Procesado',
  finalizado: 'Finalizado',
};

/**
 * Obtiene el siguiente estado en la secuencia.
 * @param currentStatus - Estado actual de la solicitud
 * @returns El siguiente estado
 * @throws Error si el estado actual es 'finalizado' (no hay más estados)
 */
export function getNextStatus(currentStatus: RequestStatus): RequestStatus {
  const currentIndex = REQUEST_STATUSES.indexOf(currentStatus);

  if (currentIndex === -1) {
    throw new Error(`Estado desconocido: ${currentStatus}`);
  }

  if (currentIndex === REQUEST_STATUSES.length - 1) {
    throw new Error('La solicitud ya se encuentra en estado finalizado. No hay más estados por avanzar.');
  }

  return REQUEST_STATUSES[currentIndex + 1];
}

/**
 * Verifica si una transición de estado es válida.
 * Solo se permite avanzar al siguiente estado inmediato.
 */
export function isValidTransition(from: RequestStatus, to: RequestStatus): boolean {
  const fromIndex = REQUEST_STATUSES.indexOf(from);
  const toIndex = REQUEST_STATUSES.indexOf(to);

  return toIndex === fromIndex + 1;
}

/**
 * Verifica si un estado es el estado final.
 */
export function isFinalStatus(status: RequestStatus): boolean {
  return status === 'finalizado';
}

/**
 * Verifica si un string es un RequestStatus válido.
 */
export function isRequestStatus(value: string): value is RequestStatus {
  return REQUEST_STATUSES.includes(value as RequestStatus);
}
