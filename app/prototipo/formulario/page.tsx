'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { tracker } from '@/lib/analytics';
import { emailSchema, colombianPhoneSchema } from '@/lib/validation/schemas';
import { Button, Input, Card } from '@/components/ui';

// ─── Constants ───────────────────────────────────────────────────────────────
const STORAGE_KEY = 'alfa_postventa_draft';
const DEBOUNCE_MS = 500;

const STEP_LABELS = [
  'Identificación',
  'Datos actuales',
  'Datos nuevos',
];

const COLOMBIAN_CITIES = [
  { value: 'bogota', label: 'Bogotá' },
  { value: 'medellin', label: 'Medellín' },
  { value: 'cali', label: 'Cali' },
  { value: 'barranquilla', label: 'Barranquilla' },
  { value: 'cartagena', label: 'Cartagena' },
  { value: 'bucaramanga', label: 'Bucaramanga' },
  { value: 'pereira', label: 'Pereira' },
  { value: 'manizales', label: 'Manizales' },
  { value: 'santa_marta', label: 'Santa Marta' },
  { value: 'cucuta', label: 'Cúcuta' },
  { value: 'ibague', label: 'Ibagué' },
  { value: 'villavicencio', label: 'Villavicencio' },
];

const CONTACT_PREFERENCES = [
  { value: 'email', label: 'Correo electrónico' },
  { value: 'telefono', label: 'Teléfono' },
  { value: 'ambos', label: 'Ambos' },
];

// ─── Demo pre-loaded data ────────────────────────────────────────────────────
const DEMO_IDENTIFICATION = {
  documentType: 'CC' as const,
  documentNumber: '***4567',
  policyReference: 'DEMO-2026-001',
};

const DEMO_CURRENT_DATA = {
  fullName: 'Cliente Demo',
  currentEmail: 'cliente.demo@ejemplo.com',
  currentPhone: '300 *** 0000',
};

// ─── Step-level Zod schemas ──────────────────────────────────────────────────
const step3Schema = z
  .object({
    newEmail: emailSchema,
    confirmEmail: emailSchema,
    newPhone: colombianPhoneSchema,
    city: z.string().min(1, 'La ciudad es obligatoria'),
    contactPreference: z.enum(['email', 'telefono', 'ambos'], {
      errorMap: () => ({ message: 'Seleccione una preferencia de contacto válida' }),
    }),
  })
  .refine(
    (data) => data.newEmail.toLowerCase() === data.confirmEmail.toLowerCase(),
    {
      message: 'Los correos electrónicos no coinciden',
      path: ['confirmEmail'],
    }
  );

// ─── Types ───────────────────────────────────────────────────────────────────
interface Step3Data {
  newEmail: string;
  confirmEmail: string;
  newPhone: string;
  city: string;
  contactPreference: string;
}

interface FormDraft {
  step: number;
  step3: Step3Data;
  timestamp: number;
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function FormularioPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [step3Data, setStep3Data] = useState<Step3Data>({
    newEmail: '',
    confirmEmail: '',
    newPhone: '',
    city: '',
    contactPreference: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [hasTrackedStart, setHasTrackedStart] = useState(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─── Track form_started on mount ────────────────────────────────────────────
  useEffect(() => {
    if (!hasTrackedStart) {
      tracker.track('form_started', 'formulario');
      setHasTrackedStart(true);
    }
  }, [hasTrackedStart]);

  // ─── Check localStorage for existing draft on mount ─────────────────────────
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const draft: FormDraft = JSON.parse(stored);
        if (draft.step3 && draft.timestamp) {
          setShowRestoreDialog(true);
        }
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  // ─── Restore draft from localStorage ────────────────────────────────────────
  function handleRestore() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const draft: FormDraft = JSON.parse(stored);
        if (draft.step3) {
          setStep3Data(draft.step3);
          setCurrentStep(draft.step);
        }
      }
    } catch {
      // Ignore errors
    }
    setShowRestoreDialog(false);
  }

  function handleDiscardDraft() {
    localStorage.removeItem(STORAGE_KEY);
    setShowRestoreDialog(false);
  }

  // ─── Save to localStorage (debounced) ───────────────────────────────────────
  const saveDraft = useCallback(
    (data: Step3Data, step: number) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        try {
          const draft: FormDraft = {
            step,
            step3: data,
            timestamp: Date.now(),
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
        } catch {
          // Ignore storage errors
        }
      }, DEBOUNCE_MS);
    },
    []
  );

  // ─── Handle field changes for step 3 ───────────────────────────────────────
  function handleStep3Change(field: keyof Step3Data, value: string) {
    const updated = { ...step3Data, [field]: value };
    setStep3Data(updated);
    // Clear error for the field being edited
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
    saveDraft(updated, currentStep);
  }

  // ─── Validate current step ─────────────────────────────────────────────────
  function validateCurrentStep(): boolean {
    // Steps 0 and 1 are read-only, always valid
    if (currentStep < 2) return true;

    // Step 2 (index 2) is the editable step (Step 3 in display)
    const result = step3Schema.safeParse(step3Data);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        const path = err.path.join('.');
        if (!fieldErrors[path]) {
          fieldErrors[path] = err.message;
        }
      });
      setErrors(fieldErrors);
      return false;
    }

    setErrors({});
    return true;
  }

  // ─── Navigation ─────────────────────────────────────────────────────────────
  function handleContinue() {
    if (!validateCurrentStep()) return;

    if (currentStep < 2) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      tracker.track('form_step_changed', `paso_${nextStep + 1}`, {
        fromStep: currentStep + 1,
        toStep: nextStep + 1,
      });
    } else {
      // Last step — save final draft and navigate to revision
      try {
        const draft: FormDraft = {
          step: currentStep,
          step3: step3Data,
          timestamp: Date.now(),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
      } catch {
        // Ignore storage errors
      }
      router.push('/prototipo/revision');
    }
  }

  function handleBack() {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      tracker.track('form_step_changed', `paso_${prevStep + 1}`, {
        fromStep: currentStep + 1,
        toStep: prevStep + 1,
      });
    }
  }

  // ─── Progress indicator ─────────────────────────────────────────────────────
  function renderProgressIndicator() {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Paso {currentStep + 1} de {STEP_LABELS.length}</span>
          <span>{Math.round(((currentStep + 1) / STEP_LABELS.length) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2" role="progressbar" aria-valuenow={currentStep + 1} aria-valuemin={1} aria-valuemax={STEP_LABELS.length} aria-label={`Paso ${currentStep + 1} de ${STEP_LABELS.length}: ${STEP_LABELS[currentStep]}`}>
          <div
            className="bg-alfa-green h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / STEP_LABELS.length) * 100}%` }}
          />
        </div>
        <div className="flex justify-between">
          {STEP_LABELS.map((label, idx) => (
            <span
              key={label}
              className={[
                'text-xs font-medium',
                idx <= currentStep ? 'text-alfa-green' : 'text-gray-400',
              ].join(' ')}
            >
              {label}
            </span>
          ))}
        </div>
      </div>
    );
  }

  // ─── Step 1: Identificación ─────────────────────────────────────────────────
  function renderStep1() {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-alfa-navy">
          Datos de identificación
        </h2>
        <p className="text-sm text-gray-600">
          Estos datos están pre-cargados para la demostración.
        </p>
        <Input
          label="Tipo de documento"
          value={DEMO_IDENTIFICATION.documentType}
          readOnly
          disabled
        />
        <Input
          label="Número de documento"
          value={DEMO_IDENTIFICATION.documentNumber}
          readOnly
          disabled
        />
        <Input
          label="Referencia de póliza"
          value={DEMO_IDENTIFICATION.policyReference}
          readOnly
          disabled
        />
      </div>
    );
  }

  // ─── Step 2: Datos actuales ─────────────────────────────────────────────────
  function renderStep2() {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-alfa-navy">
          Datos de contacto actuales
        </h2>
        <p className="text-sm text-gray-600">
          Estos son los datos registrados actualmente en el sistema.
        </p>
        <Input
          label="Nombre completo"
          value={DEMO_CURRENT_DATA.fullName}
          readOnly
          disabled
        />
        <Input
          label="Correo electrónico actual"
          type="email"
          value={DEMO_CURRENT_DATA.currentEmail}
          readOnly
          disabled
        />
        <Input
          label="Teléfono actual"
          type="tel"
          value={DEMO_CURRENT_DATA.currentPhone}
          readOnly
          disabled
        />
      </div>
    );
  }

  // ─── Step 3: Datos nuevos ───────────────────────────────────────────────────
  function renderStep3() {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-alfa-navy">
          Nuevos datos de contacto
        </h2>
        <p className="text-sm text-gray-600">
          Ingresa los datos que deseas actualizar.
        </p>
        <Input
          label="Correo electrónico nuevo"
          type="email"
          required
          value={step3Data.newEmail}
          onChange={(e) => handleStep3Change('newEmail', (e.target as HTMLInputElement).value)}
          error={errors.newEmail}
          placeholder="nuevo@correo.com"
        />
        <Input
          label="Confirmar correo electrónico"
          type="email"
          required
          value={step3Data.confirmEmail}
          onChange={(e) => handleStep3Change('confirmEmail', (e.target as HTMLInputElement).value)}
          error={errors.confirmEmail}
          placeholder="nuevo@correo.com"
        />
        <Input
          label="Teléfono nuevo"
          type="tel"
          required
          value={step3Data.newPhone}
          onChange={(e) => handleStep3Change('newPhone', (e.target as HTMLInputElement).value)}
          error={errors.newPhone}
          placeholder="3001234567"
        />
        <Input
          label="Ciudad"
          type="select"
          required
          value={step3Data.city}
          onChange={(e) => handleStep3Change('city', (e.target as HTMLSelectElement).value)}
          error={errors.city}
          options={COLOMBIAN_CITIES}
        />
        <Input
          label="Preferencia de contacto"
          type="select"
          required
          value={step3Data.contactPreference}
          onChange={(e) => handleStep3Change('contactPreference', (e.target as HTMLSelectElement).value)}
          error={errors.contactPreference}
          options={CONTACT_PREFERENCES}
        />
      </div>
    );
  }

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-alfa-surface flex items-center justify-center p-4">
      <div className="max-w-lg w-full space-y-6">
        {/* Restore dialog */}
        {showRestoreDialog && (
          <Card variant="bordered" className="border-alfa-gold bg-amber-50">
            <div className="space-y-3">
              <p className="text-sm font-medium text-alfa-navy">
                Se encontraron datos guardados de una sesión anterior.
              </p>
              <p className="text-xs text-gray-600">
                ¿Deseas restaurar los datos donde los dejaste?
              </p>
              <div className="flex gap-3">
                <Button size="sm" onClick={handleRestore}>
                  Restaurar
                </Button>
                <Button size="sm" variant="outline" onClick={handleDiscardDraft}>
                  Empezar de nuevo
                </Button>
              </div>
            </div>
          </Card>
        )}

        <Card variant="elevated" className="bg-white">
          <div className="space-y-6">
            {/* Progress */}
            {renderProgressIndicator()}

            {/* Step content */}
            <div aria-live="polite">
              {currentStep === 0 && renderStep1()}
              {currentStep === 1 && renderStep2()}
              {currentStep === 2 && renderStep3()}
            </div>

            {/* Navigation buttons */}
            <div className="flex justify-between pt-4 border-t border-gray-100">
              {currentStep > 0 ? (
                <Button variant="ghost" onClick={handleBack}>
                  ← Atrás
                </Button>
              ) : (
                <div />
              )}
              <Button onClick={handleContinue}>
                Continuar →
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}
