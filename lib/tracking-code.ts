import crypto from 'crypto';

/**
 * Generates a tracking code with format DEMO-ALFA-YYYYMMDD-XXXXXX
 * where XXXXXX is a random 6-char alphanumeric string (uppercase)
 */
export function generateTrackingCode(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid ambiguous chars (0/O, 1/I)
  let random = '';
  const bytes = crypto.randomBytes(6);
  for (let i = 0; i < 6; i++) {
    random += chars[bytes[i] % chars.length];
  }

  return `DEMO-ALFA-${year}${month}${day}-${random}`;
}

export function isValidTrackingCode(code: string): boolean {
  return /^DEMO-ALFA-\d{8}-[A-Z2-9]{6}$/.test(code);
}

export function normalizeTrackingCode(code: string): string {
  return code.trim().toUpperCase();
}

export function extractDateFromTrackingCode(code: string): Date | null {
  if (!isValidTrackingCode(code)) return null;
  const dateStr = code.slice(10, 18);
  const year = parseInt(dateStr.slice(0, 4), 10);
  const month = parseInt(dateStr.slice(4, 6), 10) - 1;
  const day = parseInt(dateStr.slice(6, 8), 10);
  return new Date(year, month, day);
}
