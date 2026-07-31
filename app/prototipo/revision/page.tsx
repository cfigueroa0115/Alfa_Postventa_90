'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { tracker } from '@/lib/analytics';
import { loadDraft, clearDraft } from '@/lib/forms';
import { Button, Card } from '@/components/ui';
import type { UpdateContactFormData } from '@/lib/validation';

const fieldLabels: Record<keyof UpdateContactFormData, string> = {
  documentType: 'Tipo de documento',
  documentNumber: 'Número de documento',
  policyReference: 'Referencia de póliza',
  fullName: 'Nombre completo',
  currentEmail: 'Correo actual',
  currentPhone: 'Teléfono actual',
  newEmail: 'Nuevo correo electrónico',
  confirmEmail: 'Confirmar correo electrónico',
  newPhone: 'Nuevo teléfono',
  city: 'Ciudad',
  contactPreference: 'Preferencia de contacto',
};

const documentTypeLabels: Record<string, string> = {
  CC: 'Cédula de ciudadanía',
  CE: 'Cédula de extranjería',
  NIT: 'NIT',
  PP: 'Pasaporte',
};

const contactPreferenceLabels: Record<string, string> = {
  email: 'Correo electrónico',
  telefono: 'Teléfono',
  ambos: 'Ambos',
};

interface ApiErrorDetail {
  field?: string;
  message: string;
}

export default function RevisionPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<UpdateContactFormData | null>(null);
  const [consentChecked, setConsentChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<ApiErrorDetail[]>([]);
  const idempotencyKeyRef = useRef<string>(crypto.randomUUID());

  useEffect(() => {
    const draft = loadDraft();
    if (draft && draft.data) {
      setFormData(draft.data);
    } else {
      router.push('/prototipo/formulario');
    }
  }, [router]);

  async function handleSubmit() {
    if (!consentChecked || !formData) return;

    setLoading(true);
    setErrors([]);

    try {
      await tracker.track('consent_given', 'revision');

      const sessionId = sessionStorage.getItem('demo_session_id');
      if (!sessionId) {
        setErrors([
          { message: 'No se encontró la sesión activa. Por favor, reinicia el proceso.' },
        ]);
        setLoading(false);
        return;
      }

      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-idempotency-key': idempotencyKeyRef.current,
        },
        body: JSON.stringify({ sessionId, formData }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.details && Array.isArray(errorData.details)) {
          setErrors(errorData.details);
        } else {
          setErrors([
            { message: errorData.error || 'Error al radicar la solicitud. Intenta de nuevo.' },
          ]);
        }
        setLoading(false);
        return;
      }

      const data = await response.json();

      // Clear draft on successful submission
      clearDraft();

      router.push(`/prototipo/confirmacion/${data.trackingCode}`);
    } catch {
      setErrors([
        { message: 'Error de conexión. Verifica tu conexión a internet e intenta de nuevo.' },
      ]);
      setLoading(false);
    }
  }

  function formatValue(key: keyof UpdateContactFormData, value: unknown): string {
    if (value === undefined || value === null || value === '') return '—';
    if (key === 'documentType') return documentTypeLabels[value as string] || (value as string);
    if (key === 'contactPreference')
      return contactPreferenceLabels[value as string] || (value as string);
    return String(value);
  }

  if (!formData) {
    return (
      <main className="min-h-screen bg-alfa-surface flex items-center justify-center p-4">
        <p className="text-gray-500">Cargando datos del formulario...</p>
      </main>
    );
  }

  // Group fields for display
  const sections = [
    {
      title: 'Datos de identificación',
      step: 1,
      fields: ['documentType', 'documentNumber', 'policyReference', 'fullName'] as (keyof UpdateContactFormData)[],
    },
    {
      title: 'Datos actuales',
      step: 2,
      fields: ['currentEmail', 'currentPhone'] as (keyof UpdateContactFormData)[],
    },
    {
      title: 'Nuevos datos de contacto',
      step: 3,
      fields: [
        'newEmail',
        'confirmEmail',
        'newPhone',
        'city',
        'contactPreference',
      ] as (keyof UpdateContactFormData)[],
    },
  ];

  return (
    <main className="min-h-screen bg-alfa-surface flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-alfa-navy">Revisa tu solicitud</h1>
          <p className="text-gray-600">
            Verifica que la información sea correcta antes de enviar.
          </p>
        </div>

        {sections.map((section) => (
          <Card key={section.title} variant="bordered" className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-alfa-navy">{section.title}</h2>
              <a
                href={`/prototipo/formulario?step=${section.step}&returnTo=revision`}
                className="text-sm text-alfa-green hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-alfa-green rounded"
              >
                Editar
              </a>
            </div>
            <dl className="grid gap-2">
              {section.fields.map((field) => (
                <div key={field} className="grid grid-cols-2 gap-2 text-sm">
                  <dt className="text-gray-500">{fieldLabels[field]}</dt>
                  <dd className="text-alfa-navy font-medium">
                    {formatValue(field, formData[field])}
                  </dd>
                </div>
              ))}
            </dl>
          </Card>
        ))}

        {/* Consent section */}
        <Card variant="bordered" className="space-y-4">
          <label className="flex items-start gap-3 cursor-pointer" htmlFor="consent-checkbox">
            <input
              id="consent-checkbox"
              type="checkbox"
              checked={consentChecked}
              onChange={(e) => setConsentChecked(e.target.checked)}
              className="mt-0.5 h-5 w-5 rounded border-gray-300 text-alfa-green focus:ring-alfa-green accent-alfa-green flex-shrink-0"
              aria-required="true"
            />
            <span className="text-sm text-alfa-navy">
              Autorizo el tratamiento de los datos proporcionados en este formulario de
              demostración
            </span>
          </label>
        </Card>

        {/* Error messages */}
        {errors.length > 0 && (
          <div
            role="alert"
            aria-live="assertive"
            className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 space-y-1"
          >
            {errors.map((err, idx) => (
              <p key={idx} className="text-sm">
                {err.field
                  ? `${fieldLabels[err.field as keyof UpdateContactFormData] || err.field}: `
                  : ''}
                {err.message}
              </p>
            ))}
          </div>
        )}

        <Button
          onClick={handleSubmit}
          disabled={!consentChecked}
          loading={loading}
          size="lg"
          className="w-full"
        >
          Enviar solicitud
        </Button>
      </div>
    </main>
  );
}
