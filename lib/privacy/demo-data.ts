/**
 * Módulo de privacidad para datos demo.
 * Controla qué datos son permitidos en el prototipo público.
 */

const ALLOWED_EMAIL_DOMAINS = ['ejemplo.com', 'demo.local'];

const ALLOWED_PHONE_PREFIXES = ['300', '301', '310', '311', '320', '321'];

export function isAllowedDemoEmail(email: string): boolean {
  if (!email) return false;
  const domain = email.split('@')[1]?.toLowerCase();
  return ALLOWED_EMAIL_DOMAINS.includes(domain ?? '');
}

export function isAllowedDemoPhone(phone: string): boolean {
  if (!phone || phone.length !== 10) return false;
  const prefix = phone.slice(0, 3);
  return phone.startsWith('3') && ALLOWED_PHONE_PREFIXES.includes(prefix);
}

export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return '***@***';
  const [local, domain] = email.split('@');
  if (local.length <= 2) return `${local[0]}***@${domain}`;
  return `${local.slice(0, 2)}***@${domain}`;
}

export function maskPhone(phone: string): string {
  if (!phone || phone.length < 4) return '*** *** ****';
  return `${phone.slice(0, 3)} *** ${phone.slice(-4)}`;
}

export function sanitizeDemoRequest(formData: Record<string, unknown>): Record<string, unknown> {
  const sanitized = { ...formData };
  // Remove confirmEmail - never persist
  delete sanitized.confirmEmail;
  // Mask sensitive fields
  if (typeof sanitized.newEmail === 'string') {
    sanitized.newEmailMasked = maskEmail(sanitized.newEmail as string);
    delete sanitized.newEmail;
  }
  if (typeof sanitized.newPhone === 'string') {
    sanitized.newPhoneMasked = maskPhone(sanitized.newPhone as string);
    delete sanitized.newPhone;
  }
  if (typeof sanitized.currentEmail === 'string') {
    sanitized.oldEmailMasked = maskEmail(sanitized.currentEmail as string);
    delete sanitized.currentEmail;
  }
  if (typeof sanitized.currentPhone === 'string') {
    sanitized.oldPhoneMasked = maskPhone(sanitized.currentPhone as string);
    delete sanitized.currentPhone;
  }
  // Remove full document number
  if (typeof sanitized.documentNumber === 'string') {
    sanitized.documentMasked = sanitized.documentNumber; // already masked (***4567)
    delete sanitized.documentNumber;
  }
  // Remove full name from persistence (keep only for display during session)
  delete sanitized.fullName;
  return sanitized;
}

export function calculateExpiryDate(hoursFromNow: number = 48): Date {
  return new Date(Date.now() + hoursFromNow * 60 * 60 * 1000);
}
