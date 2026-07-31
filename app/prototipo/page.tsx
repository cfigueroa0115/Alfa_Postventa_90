'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { tracker } from '@/lib/analytics';
import { Button } from '@/components/ui';

const steps = [
  { number: 1, label: 'Seleccionar trámite' },
  { number: 2, label: 'Preparar requisitos' },
  { number: 3, label: 'Llenar formulario' },
  { number: 4, label: 'Revisar y enviar' },
  { number: 5, label: 'Recibir confirmación' },
];

export default function PrototipoInicioPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleComenzar() {
    setLoading(true);
    setError(null);

    try {
      await tracker.initialize();
      await tracker.track('journey_started', 'inicio');
      router.push('/prototipo/seleccion');
    } catch {
      setError('No se pudo iniciar la sesión. Por favor, intenta de nuevo.');
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-alfa-surface flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-xl shadow-md p-8 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-alfa-navy">
            Bienvenido al proceso de autogestión
          </h1>
          <p className="text-gray-600">
            A continuación realizarás tu trámite postventa de forma digital,
            guiada y segura. No necesitas descargar formatos ni enviar correos.
          </p>
        </div>

        <div className="bg-alfa-surface rounded-lg p-4 text-center">
          <p className="text-sm text-gray-500">Tiempo estimado</p>
          <p className="text-lg font-semibold text-alfa-navy">3 a 5 minutos</p>
        </div>

        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Pasos del proceso
          </h2>
          <ol className="space-y-2">
            {steps.map((step) => (
              <li
                key={step.number}
                className="flex items-center gap-3 text-sm text-gray-700"
              >
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-alfa-green/10 text-alfa-green text-xs font-bold flex items-center justify-center">
                  {step.number}
                </span>
                {step.label}
              </li>
            ))}
          </ol>
        </div>

        {error && (
          <div
            role="alert"
            className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm"
          >
            {error}
          </div>
        )}

        <Button
          onClick={handleComenzar}
          loading={loading}
          size="lg"
          className="w-full"
        >
          Comenzar
        </Button>
      </div>
    </main>
  );
}
