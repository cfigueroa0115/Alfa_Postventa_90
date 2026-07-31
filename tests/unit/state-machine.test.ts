import { describe, it, expect } from 'vitest';
import { getNextStatus, isValidTransition, isFinalStatus, isRequestStatus, REQUEST_STATUSES } from '@/lib/services/state-machine';

describe('getNextStatus', () => {
  it('advances radicado to en_validacion', () => {
    expect(getNextStatus('radicado')).toBe('en_validacion');
  });

  it('advances en_validacion to procesado', () => {
    expect(getNextStatus('en_validacion')).toBe('procesado');
  });

  it('advances procesado to finalizado', () => {
    expect(getNextStatus('procesado')).toBe('finalizado');
  });

  it('throws when advancing from finalizado', () => {
    expect(() => getNextStatus('finalizado')).toThrow('estado finalizado');
  });
});

describe('isValidTransition', () => {
  it('accepts valid sequential transitions', () => {
    expect(isValidTransition('radicado', 'en_validacion')).toBe(true);
    expect(isValidTransition('en_validacion', 'procesado')).toBe(true);
    expect(isValidTransition('procesado', 'finalizado')).toBe(true);
  });

  it('rejects backward transitions', () => {
    expect(isValidTransition('en_validacion', 'radicado')).toBe(false);
    expect(isValidTransition('finalizado', 'procesado')).toBe(false);
  });

  it('rejects skipping transitions', () => {
    expect(isValidTransition('radicado', 'procesado')).toBe(false);
    expect(isValidTransition('radicado', 'finalizado')).toBe(false);
  });
});

describe('isFinalStatus', () => {
  it('returns true for finalizado', () => {
    expect(isFinalStatus('finalizado')).toBe(true);
  });

  it('returns false for other statuses', () => {
    expect(isFinalStatus('radicado')).toBe(false);
    expect(isFinalStatus('procesado')).toBe(false);
  });
});

describe('isRequestStatus', () => {
  it('returns true for valid statuses', () => {
    REQUEST_STATUSES.forEach(status => {
      expect(isRequestStatus(status)).toBe(true);
    });
  });

  it('returns false for invalid strings', () => {
    expect(isRequestStatus('invalid')).toBe(false);
    expect(isRequestStatus('')).toBe(false);
  });
});
