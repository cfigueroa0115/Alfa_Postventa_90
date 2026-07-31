import { updateContactFormSchema, type UpdateContactFormData } from '@/lib/validation';

const STORAGE_KEY = 'alfa_postventa_draft';
const DRAFT_VERSION = 1;

export interface UpdateContactDraft {
  version: number;
  currentStep: number;
  data: UpdateContactFormData;
  savedAt: string;
}

// Demo pre-loaded values
export const DEMO_DATA: UpdateContactFormData = {
  documentType: 'CC',
  documentNumber: '***4567',
  policyReference: 'DEMO-2026-001',
  fullName: 'Cliente Demo',
  currentEmail: 'cliente.demo@ejemplo.com',
  currentPhone: '300 *** 0000',
  newEmail: '',
  confirmEmail: '',
  newPhone: '',
  city: '',
  contactPreference: 'email',
};

export function createInitialDraft(): UpdateContactDraft {
  return {
    version: DRAFT_VERSION,
    currentStep: 0,
    data: { ...DEMO_DATA },
    savedAt: new Date().toISOString(),
  };
}

export function saveDraft(draft: UpdateContactDraft): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  } catch {
    // Storage full or unavailable
  }
}

export function loadDraft(): UpdateContactDraft | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored);

    // Version check
    if (parsed.version !== DRAFT_VERSION) {
      clearDraft();
      return null;
    }

    // Validate structure
    if (!parsed.data || typeof parsed.data !== 'object') {
      clearDraft();
      return null;
    }

    return parsed as UpdateContactDraft;
  } catch {
    clearDraft();
    return null;
  }
}

export function clearDraft(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore
  }
}

export function validateDraft(draft: UpdateContactDraft): { valid: boolean; errors?: string[] } {
  const result = updateContactFormSchema.safeParse(draft.data);
  if (result.success) return { valid: true };

  return {
    valid: false,
    errors: result.error.errors.map((e) => e.message),
  };
}

export function mergeDraftData(
  current: UpdateContactFormData,
  updates: Partial<UpdateContactFormData>
): UpdateContactFormData {
  return { ...current, ...updates };
}
