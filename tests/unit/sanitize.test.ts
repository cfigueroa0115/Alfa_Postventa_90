import { describe, it, expect } from 'vitest';
import { sanitizeInput, sanitizeMetadata, sanitizeFormData } from '@/lib/validation/sanitize';

describe('sanitizeInput', () => {
  it('returns empty string for null/undefined/empty', () => {
    expect(sanitizeInput('')).toBe('');
    expect(sanitizeInput(null as unknown as string)).toBe('');
    expect(sanitizeInput(undefined as unknown as string)).toBe('');
  });

  it('removes script tags', () => {
    expect(sanitizeInput('<script>alert("xss")</script>')).toBe('');
    expect(sanitizeInput('hello<script>bad</script>world')).toBe('helloworld');
  });

  it('removes event handlers', () => {
    expect(sanitizeInput('<img onerror="alert(1)">')).toBe('');
    expect(sanitizeInput('<div onclick="steal()">')).toBe('');
  });

  it('removes javascript: URIs', () => {
    expect(sanitizeInput('javascript:alert(1)')).toBe('alert(1)');
  });

  it('removes iframe tags', () => {
    expect(sanitizeInput('<iframe src="evil.com"></iframe>')).toBe('');
  });

  it('preserves normal text', () => {
    expect(sanitizeInput('Carlos Figueroa')).toBe('Carlos Figueroa');
    expect(sanitizeInput('correo@ejemplo.com')).toBe('correo@ejemplo.com');
    expect(sanitizeInput('3001234567')).toBe('3001234567');
  });

  it('trims whitespace', () => {
    expect(sanitizeInput('  hello  ')).toBe('hello');
  });
});

describe('sanitizeMetadata', () => {
  it('returns undefined for null/non-object input', () => {
    expect(sanitizeMetadata(null)).toBeUndefined();
    expect(sanitizeMetadata('string')).toBeUndefined();
    expect(sanitizeMetadata(123)).toBeUndefined();
  });

  it('sanitizes string values in the object', () => {
    const result = sanitizeMetadata({ key: '<script>xss</script>' });
    expect(result?.key).toBe('');
  });

  it('preserves non-string values', () => {
    const result = sanitizeMetadata({ count: 5, active: true });
    expect(result?.count).toBe(5);
    expect(result?.active).toBe(true);
  });

  it('truncates metadata larger than 1024 chars', () => {
    const large = { data: 'x'.repeat(2000) };
    const result = sanitizeMetadata(large);
    expect(result?._truncated).toBe(true);
  });
});

describe('sanitizeFormData', () => {
  it('sanitizes all string fields', () => {
    const data = {
      name: '<script>alert(1)</script>Carlos',
      phone: '3001234567',
      count: 42,
    };
    const result = sanitizeFormData(data);
    expect(result.name).toBe('Carlos');
    expect(result.phone).toBe('3001234567');
    expect(result.count).toBe(42);
  });
});
