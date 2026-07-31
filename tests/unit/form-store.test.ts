import { describe, it, expect, beforeEach } from 'vitest';
import { createInitialDraft, saveDraft, loadDraft, clearDraft, validateDraft, mergeDraftData, DEMO_DATA } from '@/lib/forms';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(global, 'localStorage', { value: localStorageMock });

describe('createInitialDraft', () => {
  it('creates a draft with version 1', () => {
    const draft = createInitialDraft();
    expect(draft.version).toBe(1);
  });

  it('creates a draft at step 0', () => {
    const draft = createInitialDraft();
    expect(draft.currentStep).toBe(0);
  });

  it('contains complete demo data', () => {
    const draft = createInitialDraft();
    expect(draft.data.documentType).toBe('CC');
    expect(draft.data.documentNumber).toBe('***4567');
    expect(draft.data.policyReference).toBe('DEMO-2026-001');
    expect(draft.data.fullName).toBe('Cliente Demo');
  });

  it('has a savedAt timestamp', () => {
    const draft = createInitialDraft();
    expect(draft.savedAt).toBeTruthy();
    expect(new Date(draft.savedAt).getTime()).not.toBeNaN();
  });
});

describe('saveDraft / loadDraft', () => {
  beforeEach(() => localStorageMock.clear());

  it('saves and loads a draft correctly', () => {
    const draft = createInitialDraft();
    saveDraft(draft);
    const loaded = loadDraft();
    expect(loaded).not.toBeNull();
    expect(loaded!.data.documentType).toBe('CC');
  });

  it('returns null when no draft exists', () => {
    expect(loadDraft()).toBeNull();
  });
});

describe('clearDraft', () => {
  beforeEach(() => localStorageMock.clear());

  it('removes the draft from storage', () => {
    saveDraft(createInitialDraft());
    clearDraft();
    expect(loadDraft()).toBeNull();
  });
});

describe('validateDraft', () => {
  it('returns valid:false for incomplete data', () => {
    const draft = createInitialDraft();
    // Empty required fields
    const result = validateDraft(draft);
    expect(result.valid).toBe(false);
  });

  it('returns valid:true for complete valid data', () => {
    const draft = createInitialDraft();
    draft.data = {
      ...DEMO_DATA,
      newEmail: 'nuevo@ejemplo.com',
      confirmEmail: 'nuevo@ejemplo.com',
      newPhone: '3109876543',
      city: 'bogota',
      contactPreference: 'email',
    };
    const result = validateDraft(draft);
    expect(result.valid).toBe(true);
  });
});

describe('mergeDraftData', () => {
  it('merges partial updates into current data', () => {
    const current = DEMO_DATA;
    const merged = mergeDraftData(current, { newEmail: 'test@ejemplo.com' });
    expect(merged.newEmail).toBe('test@ejemplo.com');
    expect(merged.documentType).toBe('CC'); // preserved
  });
});
