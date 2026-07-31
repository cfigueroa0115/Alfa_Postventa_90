'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { z } from 'zod';
import { tracker } from '@/lib/analytics';
import { emailSchema, colombianPhoneSchema } from '@/lib/validation/schemas';
import type { UpdateContactFormData } from '@/lib/validation';
import {
  createInitialDraft,
  saveDraft,
  loadDraft,
  DEMO_DATA,
  type UpdateContactDraft,
} from '@/lib/forms';
import { Button, Input, Card } from '@/components/ui';
import { DemoControls } from '@/components/journey';

// ─── Constants ───────────────────────────────────────────────────────────────
const DEBOUNCE_MS = 500;

const STEP_LABELS = ['Identificación', 'Datos actuales', 'Datos nuevos'];

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

// ─── Step-level Zod schema for step 3 ────────────────────────────────────────
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

// ─── Inner component that uses useSearchParams ───────────────────────────────
function FormularioContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Parse query params for step navigation and returnTo
  const initialStep = searchParams.get('step')
    ? Math.min(Math.max(parseInt(searchParams.get('step')!) - 1, 0), 2)
    : undefined;
  const returnTo = searchParams.get('returnTo');

  const [currentStep, setCurrentStep] = useState(initialStep ?? 0);
  const [draft, setDraft] = useState<UpdateContactDraft | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [hasTrackedStart, setHasTrackedStart] = useState(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─── Track form_started on mount ──────────────────────────────────────────
  useEffect(() => {
    if (!hasTrackedStart) {
      tracker.track('form_started', 'formulario');
      setHasTrackedStart(true);
    }
  }, [hasTrackedStart]);

  // ─── Load draft on mount ──────────────────────────────────────────────────
  useEffect(() => {
    const existing = loadDraft();
    if (existing) {
      // If coming from revision (has step param), just load the draft directly
      if (initialStep !== undefined) {
        setDraft(existing);
      } else {
        // Normal entry: ask to restore
        setShowRestoreDialog(true);
        setDraft(existing);
      }
    } else {
      // No existing draft, create a new one
      const newDraft = createInitialDraft();
      setDraft(newDraft);
      saveDraft(newDraft);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Restore draft ────────────────────────────────────────────────────────
  function handleRestore() {
    // Draft is already loaded in state
    if (draft && initialStep === undefined) {
      setCurrentStep(draft.currentStep);
    }
    setShowRestoreDialog(false);
  }

  function handleDiscardDraft() {
    const newDraft = createInitialDraft();
    setDraft(newDraft);
    setCurrentStep(0);
    saveDraft(newDraft);
    setShowRestoreDialog(false);
  }

  // ─── Persist draft (debounced) ────────────────────────────────────────────
  const persistDraft = useCallback(
    (updatedDraft: UpdateContactDraft) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        saveDraft(updatedDraft);
      }, DEBOUNCE_MS);
    },
    []
  );

  // ─── Handle field changes for step 3 ─────────────────────────────────────
  function handleFieldChange(field: keyof UpdateContactFormData, value: string) {
    if (!draft) return;
    const updatedData = { ...draft.data, [field]: value };
    const updatedDraft: UpdateContactDraft = {
      ...draft,
      data: updatedData,
      savedAt: new Date().toISOString(),
    };
    setDraft(updatedDraft);

    // Clear error for the field being edited
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }

    persistDraft(updatedDraft);
  }

  // ─── Validate current step ────────────────────────────────────────────────
  function validateCurrentStep(): boolean {
    // Steps 0 and 1 are read-only, always valid
    if (currentStep < 2) return true;

    if (!draft) return false;

    // Step 2 (index 2) is the editable step
    const result = step3Schema.safeParse({
      newEmail: draft.data.newEmail,
      confirmEmail: draft.data.confirmEmail,
      newPhone: draft.data.newPhone,
      city: draft.data.city,
      contactPreference: draft.data.contactPreference,
    });

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

  // ─── Navigation ──────────────────────────────────────────────────────────
  function handleContinue() {
    if (!validateCurrentStep()) return;
    if (!draft) return;

    // If returnTo=revision, navigate back to revision after completing this step
    if (returnTo === 'revision') {
      const finalDraft: UpdateContactDraft = {
        ...draft,
        currentStep,
        savedAt: new Date().toISOString(),
      };
      saveDraft(finalDraft);
      router.push('/prototipo/revision');
      return;
    }

    if (currentStep < 2) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);

      // Update draft step
      const updatedDraft: UpdateContactDraft = {
        ...draft,
        currentStep: nextStep,
        savedAt: new Date().toISOString(),
      };
      setDraft(updatedDraft);
      saveDraft(updatedDraft);

      tracker.track('form_step_changed', `paso_${nextStep + 1}`, {
        fromStep: currentStep + 1,
        toStep: nextStep + 1,
      });
    } else {
      // Last step — save final draft and navigate to revision
      const finalDraft: UpdateContactDraft = {
        ...draft,
        currentStep,
        savedAt: new Date().toISOString(),
      };
      saveDraft(finalDraft);
      router.push('/prototipo/revision');
    }
  }

  function handleBack() {
    if (!draft) return;
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);

      const updatedDraft: UpdateContactDraft = {
        ...draft,
        currentStep: prevStep,
        savedAt: new Date().toISOString(),
      };
      setDraft(updatedDraft);
      saveDraft(updatedDraft);

      tracker.track('form_step_changed', `paso_${prevStep + 1}`, {
        fromStep: currentStep + 1,
        toStep: prevStep + 1,
      });
    }
  }

  // ─── Progress indicator ───────────────────────────────────────────────────
  function renderProgressIndicator() {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>
            Paso {currentStep + 1} de {STEP_LABELS.length}
          </span>
          <span>{Math.round(((currentStep + 1) / STEP_LABELS.length) * 100)}%</span>
        </div>
        <div
          className="w-full bg-gray-200 rounded-full h-2"
          role="progressbar"
          aria-valuenow={currentStep + 1}
          aria-valuemin={1}
          aria-valuemax={STEP_LABELS.length}
          aria-label={`Paso ${currentStep + 1} de ${STEP_LABELS.length}: ${STEP_LABELS[currentStep]}`}
        >
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

  // ─── Step 1: Identificación ───────────────────────────────────────────────
  function renderStep1() {
    const data = draft?.data ?? DEMO_DATA;
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-alfa-navy">Datos de identificación</h2>
        <p className="text-sm text-gray-600">
          Estos datos están pre-cargados para la demostración.
        </p>
        <Input label="Tipo de documento" value={data.documentType} readOnly disabled />
        <Input label="Número de documento" value={data.documentNumber} readOnly disabled />
        <Input label="Referencia de póliza" value={data.policyReference} readOnly disabled />
      </div>
    );
  }

  // ─── Step 2: Datos actuales ───────────────────────────────────────────────
  function renderStep2() {
    const data = draft?.data ?? DEMO_DATA;
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-alfa-navy">Datos de contacto actuales</h2>
        <p className="text-sm text-gray-600">
          Estos son los datos registrados actualmente en el sistema.
        </p>
        <Input label="Nombre completo" value={data.fullName} readOnly disabled />
        <Input
          label="Correo electrónico actual"
          type="email"
          value={data.currentEmail ?? ''}
          readOnly
          disabled
        />
        <Input
          label="Teléfono actual"
          type="tel"
          value={data.currentPhone ?? ''}
          readOnly
          disabled
        />
      </div>
    );
  }

  // ─── Step 3: Datos nuevos ─────────────────────────────────────────────────
  function renderStep3() {
    const data = draft?.data ?? DEMO_DATA;
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-alfa-navy">Nuevos datos de contacto</h2>
        <p className="text-sm text-gray-600">Ingresa los datos que deseas actualizar.</p>
        <Input
          label="Correo electrónico nuevo"
          type="email"
          required
          value={data.newEmail}
          onChange={(e) => handleFieldChange('newEmail', (e.target as HTMLInputElement).value)}
          error={errors.newEmail}
          placeholder="nuevo@correo.com"
        />
        <Input
          label="Confirmar correo electrónico"
          type="email"
          required
          value={data.confirmEmail}
          onChange={(e) => handleFieldChange('confirmEmail', (e.target as HTMLInputElement).value)}
          error={errors.confirmEmail}
          placeholder="nuevo@correo.com"
        />
        <Input
          label="Teléfono nuevo"
          type="tel"
          required
          value={data.newPhone}
          onChange={(e) => handleFieldChange('newPhone', (e.target as HTMLInputElement).value)}
          error={errors.newPhone}
          placeholder="3001234567"
        />
        <Input
          label="Ciudad"
          type="select"
          required
          value={data.city}
          onChange={(e) => handleFieldChange('city', (e.target as HTMLSelectElement).value)}
          error={errors.city}
          options={COLOMBIAN_CITIES}
        />
        <Input
          label="Preferencia de contacto"
          type="select"
          required
          value={data.contactPreference}
          onChange={(e) =>
            handleFieldChange('contactPreference', (e.target as HTMLSelectElement).value)
          }
          error={errors.contactPreference}
          options={CONTACT_PREFERENCES}
        />
      </div>
    );
  }

  // ─── Loading state ────────────────────────────────────────────────────────
  if (!draft) {
    return (
      <main className="min-h-screen bg-alfa-surface flex items-center justify-center p-4">
        <p className="text-gray-500">Cargando formulario...</p>
      </main>
    );
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-alfa-surface flex items-center justify-center p-4">
      <div className="max-w-lg w-full space-y-6">
        {/* Restore dialog */}
        {showRestoreDialog && initialStep === undefined && (
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

        <DemoControls onLoadDemoData={() => {
          if (!draft) return;
          const updatedDraft: UpdateContactDraft = {
            ...draft,
            data: {
              ...draft.data,
              newEmail: 'nuevo.cliente@ejemplo.com',
              confirmEmail: 'nuevo.cliente@ejemplo.com',
              newPhone: '3001234567',
              city: 'bogota',
              contactPreference: 'email',
            },
            currentStep: 2,
            savedAt: new Date().toISOString(),
          };
          setDraft(updatedDraft);
          setCurrentStep(2);
          saveDraft(updatedDraft);
          setErrors({});
        }} />

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
              {currentStep > 0 && !returnTo ? (
                <Button variant="ghost" onClick={handleBack}>
                  ← Atrás
                </Button>
              ) : (
                <div />
              )}
              <Button onClick={handleContinue}>
                {returnTo === 'revision' ? 'Guardar y volver' : 'Continuar →'}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}

// ─── Page component with Suspense boundary for useSearchParams ──────────────
export default function FormularioPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-alfa-surface flex items-center justify-center p-4">
          <p className="text-gray-500">Cargando formulario...</p>
        </main>
      }
    >
      <FormularioContent />
    </Suspense>
  );
}
