import { describe, it, expect } from 'vitest';
import {
  isAllowedDemoEmail,
  isAllowedDemoPhone,
  maskEmail,
  maskPhone,
  sanitizeDemoRequest,
  calculateExpiryDate,
} from '@/lib/privacy';

describe('isAllowedDemoEmail', () => {
  it('accepts @ejemplo.com emails', () => {
    expect(isAllowedDemoEmail('user@ejemplo.com')).toBe(true);
  });

  it('accepts @demo.local emails', () => {
    expect(isAllowedDemoEmail('test@demo.local')).toBe(true);
  });

  it('rejects other domains', () => {
    expect(isAllowedDemoEmail('user@gmail.com')).toBe(false);
    expect(isAllowedDemoEmail('user@hotmail.com')).toBe(false);
  });

  it('rejects empty/invalid', () => {
    expect(isAllowedDemoEmail('')).toBe(false);
    expect(isAllowedDemoEmail('notanemail')).toBe(false);
  });
});

describe('isAllowedDemoPhone', () => {
  it('accepts valid demo phones starting with 300-321', () => {
    expect(isAllowedDemoPhone('3001234567')).toBe(true);
    expect(isAllowedDemoPhone('3109876543')).toBe(true);
    expect(isAllowedDemoPhone('3211234567')).toBe(true);
  });

  it('rejects phones with wrong prefix', () => {
    expect(isAllowedDemoPhone('3501234567')).toBe(false);
  });

  it('rejects wrong length', () => {
    expect(isAllowedDemoPhone('300123456')).toBe(false);
    expect(isAllowedDemoPhone('30012345678')).toBe(false);
  });
});

describe('maskEmail', () => {
  it('masks the local part', () => {
    expect(maskEmail('usuario@ejemplo.com')).toBe('us***@ejemplo.com');
  });

  it('handles short local parts', () => {
    expect(maskEmail('a@ejemplo.com')).toBe('a***@ejemplo.com');
  });

  it('handles empty/invalid', () => {
    expect(maskEmail('')).toBe('***@***');
    expect(maskEmail('noemail')).toBe('***@***');
  });
});

describe('maskPhone', () => {
  it('masks the middle digits', () => {
    expect(maskPhone('3001234567')).toBe('300 *** 4567');
  });

  it('handles short strings', () => {
    expect(maskPhone('12')).toBe('*** *** ****');
  });
});

describe('sanitizeDemoRequest', () => {
  it('removes confirmEmail', () => {
    const result = sanitizeDemoRequest({ confirmEmail: 'test@ejemplo.com' });
    expect(result.confirmEmail).toBeUndefined();
  });

  it('masks email and phone fields', () => {
    const result = sanitizeDemoRequest({
      newEmail: 'nuevo@ejemplo.com',
      newPhone: '3001234567',
      currentEmail: 'old@ejemplo.com',
      currentPhone: '3109876543',
    });
    expect(result.newEmail).toBeUndefined();
    expect(result.newEmailMasked).toBe('nu***@ejemplo.com');
    expect(result.newPhone).toBeUndefined();
    expect(result.newPhoneMasked).toBe('300 *** 4567');
    expect(result.currentEmail).toBeUndefined();
    expect(result.oldEmailMasked).toBe('ol***@ejemplo.com');
  });

  it('removes fullName', () => {
    const result = sanitizeDemoRequest({ fullName: 'Carlos Demo' });
    expect(result.fullName).toBeUndefined();
  });

  it('preserves non-sensitive fields', () => {
    const result = sanitizeDemoRequest({ city: 'bogota', contactPreference: 'email' });
    expect(result.city).toBe('bogota');
    expect(result.contactPreference).toBe('email');
  });
});

describe('calculateExpiryDate', () => {
  it('returns a date 48 hours from now by default', () => {
    const expiry = calculateExpiryDate();
    const expectedMs = Date.now() + 48 * 60 * 60 * 1000;
    expect(Math.abs(expiry.getTime() - expectedMs)).toBeLessThan(1000);
  });

  it('accepts custom hours', () => {
    const expiry = calculateExpiryDate(24);
    const expectedMs = Date.now() + 24 * 60 * 60 * 1000;
    expect(Math.abs(expiry.getTime() - expectedMs)).toBeLessThan(1000);
  });
});
