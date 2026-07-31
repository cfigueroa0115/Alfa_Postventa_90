import { describe, it, expect } from 'vitest';
import { colombianPhoneSchema, emailSchema, feedbackSchema, updateContactFormSchema } from '@/lib/validation/schemas';

describe('colombianPhoneSchema', () => {
  it('accepts valid 10-digit numbers starting with 3', () => {
    expect(colombianPhoneSchema.safeParse('3001234567').success).toBe(true);
    expect(colombianPhoneSchema.safeParse('3219876543').success).toBe(true);
  });

  it('rejects numbers not starting with 3', () => {
    expect(colombianPhoneSchema.safeParse('1001234567').success).toBe(false);
  });

  it('rejects numbers with wrong length', () => {
    expect(colombianPhoneSchema.safeParse('300123456').success).toBe(false); // 9 digits
    expect(colombianPhoneSchema.safeParse('30012345678').success).toBe(false); // 11 digits
  });

  it('rejects empty strings', () => {
    expect(colombianPhoneSchema.safeParse('').success).toBe(false);
  });
});

describe('emailSchema', () => {
  it('accepts valid emails', () => {
    expect(emailSchema.safeParse('test@ejemplo.com').success).toBe(true);
  });

  it('rejects invalid formats', () => {
    expect(emailSchema.safeParse('notanemail').success).toBe(false);
    expect(emailSchema.safeParse('').success).toBe(false);
  });
});

describe('feedbackSchema', () => {
  it('accepts CES scores 1-7 with valid tracking code', () => {
    for (let i = 1; i <= 7; i++) {
      const result = feedbackSchema.safeParse({
        trackingCode: 'DEMO-ALFA-20260715-K7P4X9',
        cesScore: i,
      });
      expect(result.success).toBe(true);
    }
  });

  it('rejects CES scores outside 1-7', () => {
    expect(feedbackSchema.safeParse({ trackingCode: 'DEMO-ALFA-20260715-K7P4X9', cesScore: 0 }).success).toBe(false);
    expect(feedbackSchema.safeParse({ trackingCode: 'DEMO-ALFA-20260715-K7P4X9', cesScore: 8 }).success).toBe(false);
  });

  it('rejects invalid tracking codes', () => {
    expect(feedbackSchema.safeParse({ trackingCode: 'invalid', cesScore: 5 }).success).toBe(false);
  });
});

describe('updateContactFormSchema', () => {
  const validData = {
    documentType: 'CC' as const,
    documentNumber: '***4567',
    policyReference: 'DEMO-2026-001',
    fullName: 'Cliente Demo',
    currentEmail: 'old@ejemplo.com',
    currentPhone: '300 *** 0000',
    newEmail: 'nuevo@ejemplo.com',
    confirmEmail: 'nuevo@ejemplo.com',
    newPhone: '3109876543',
    city: 'bogota',
    contactPreference: 'email' as const,
  };

  it('accepts valid complete data', () => {
    expect(updateContactFormSchema.safeParse(validData).success).toBe(true);
  });

  it('rejects when emails do not match', () => {
    const data = { ...validData, confirmEmail: 'different@ejemplo.com' };
    expect(updateContactFormSchema.safeParse(data).success).toBe(false);
  });

  it('rejects invalid phone format', () => {
    const data = { ...validData, newPhone: '1234567890' };
    expect(updateContactFormSchema.safeParse(data).success).toBe(false);
  });

  it('rejects empty required fields', () => {
    const data = { ...validData, city: '' };
    expect(updateContactFormSchema.safeParse(data).success).toBe(false);
  });
});
