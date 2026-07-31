import { describe, it, expect } from 'vitest';
import { generateTrackingCode, isValidTrackingCode, normalizeTrackingCode, extractDateFromTrackingCode } from '@/lib/tracking-code';

describe('generateTrackingCode', () => {
  it('generates a code with correct format DEMO-ALFA-YYYYMMDD-XXXXXX', () => {
    const code = generateTrackingCode();
    expect(isValidTrackingCode(code)).toBe(true);
  });

  it('uses the provided date for the date portion', () => {
    const date = new Date(2026, 6, 15); // July 15, 2026
    const code = generateTrackingCode(date);
    expect(code).toMatch(/^DEMO-ALFA-20260715-[A-Z2-9]{6}$/);
  });

  it('generates unique codes on successive calls', () => {
    const codes = new Set<string>();
    for (let i = 0; i < 100; i++) {
      codes.add(generateTrackingCode());
    }
    expect(codes.size).toBe(100);
  });

  it('uses only non-ambiguous characters (no 0, O, 1, I)', () => {
    for (let i = 0; i < 50; i++) {
      const code = generateTrackingCode();
      const random = code.slice(19);
      expect(random).not.toMatch(/[01OI]/);
    }
  });
});

describe('isValidTrackingCode', () => {
  it('accepts valid codes', () => {
    expect(isValidTrackingCode('DEMO-ALFA-20260715-K7P4X9')).toBe(true);
    expect(isValidTrackingCode('DEMO-ALFA-20261231-ABCDEF')).toBe(true);
  });

  it('rejects invalid formats', () => {
    expect(isValidTrackingCode('')).toBe(false);
    expect(isValidTrackingCode('DEMO-ALFA-20260715-0001')).toBe(false); // old format
    expect(isValidTrackingCode('DEMO-ALFA-2026071-K7P4X9')).toBe(false); // short date
    expect(isValidTrackingCode('demo-alfa-20260715-K7P4X9')).toBe(false); // lowercase
    expect(isValidTrackingCode('DEMO-ALFA-20260715-K7P4X')).toBe(false); // too short
  });
});

describe('normalizeTrackingCode', () => {
  it('trims and uppercases input', () => {
    expect(normalizeTrackingCode('  demo-alfa-20260715-k7p4x9  ')).toBe('DEMO-ALFA-20260715-K7P4X9');
  });
});

describe('extractDateFromTrackingCode', () => {
  it('extracts the date from a valid code', () => {
    const date = extractDateFromTrackingCode('DEMO-ALFA-20260715-K7P4X9');
    expect(date).not.toBeNull();
    expect(date!.getFullYear()).toBe(2026);
    expect(date!.getMonth()).toBe(6); // July (0-indexed)
    expect(date!.getDate()).toBe(15);
  });

  it('returns null for invalid codes', () => {
    expect(extractDateFromTrackingCode('invalid')).toBeNull();
  });
});
