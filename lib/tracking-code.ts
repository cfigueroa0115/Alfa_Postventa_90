/**
 * Utilidades para generación de códigos de radicado.
 * Formato: DEMO-ALFA-YYYYMMDD-XXXX
 * donde XXXX es un consecutivo de 4 dígitos rellenado con ceros (RN-001)
 */

/**
 * Genera un código de radicado con el formato DEMO-ALFA-YYYYMMDD-XXXX.
 * @param date - Fecha para el código (por defecto: fecha actual)
 * @param sequence - Número consecutivo del día (1-9999)
 * @returns Código de radicado formateado
 */
export function generateTrackingCode(date: Date = new Date(), sequence: number): string {
  if (sequence < 1 || sequence > 9999) {
    throw new Error('El consecutivo debe estar entre 1 y 9999');
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const seq = String(sequence).padStart(4, '0');

  return `DEMO-ALFA-${year}${month}${day}-${seq}`;
}

/**
 * Valida si un string cumple con el formato de código de radicado.
 * @param code - Código a validar
 * @returns true si el formato es válido
 */
export function isValidTrackingCode(code: string): boolean {
  return /^DEMO-ALFA-\d{8}-\d{4}$/.test(code);
}

/**
 * Extrae la fecha de un código de radicado válido.
 * @param code - Código de radicado
 * @returns Date o null si el formato es inválido
 */
export function extractDateFromTrackingCode(code: string): Date | null {
  if (!isValidTrackingCode(code)) return null;

  const dateStr = code.slice(10, 18); // YYYYMMDD
  const year = parseInt(dateStr.slice(0, 4), 10);
  const month = parseInt(dateStr.slice(4, 6), 10) - 1;
  const day = parseInt(dateStr.slice(6, 8), 10);

  return new Date(year, month, day);
}

/**
 * Extrae el consecutivo de un código de radicado válido.
 * @param code - Código de radicado
 * @returns Número de consecutivo o null si el formato es inválido
 */
export function extractSequenceFromTrackingCode(code: string): number | null {
  if (!isValidTrackingCode(code)) return null;

  return parseInt(code.slice(19), 10);
}
