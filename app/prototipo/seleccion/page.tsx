'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { tracker } from '@/lib/analytics';
import { Card, Badge } from '@/components/ui';
import { Toast } from '@/components/ui';

interface ProcessOption {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  active: boolean;
  badge: string;
}

const processOptions: ProcessOption[] = [
  {
    id: 'actualizacion-datos',
    title: 'Actualización de datos de contacto',
    description:
      'Actualiza tu teléfono o correo electrónico asociados a tu póliza.',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-8 w-8"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
        />
      </svg>
    ),
    active: true,
    badge: 'MVP',
  },
  {
    id: 'certificado-poliza',
    title: 'Solicitud de certificado de póliza',
    description: 'Solicita un certificado actualizado de tu póliza vigente.',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-8 w-8"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
        />
      </svg>
    ),
    active: false,
    badge: 'Siguiente ola',
  },
  {
    id: 'modificacion-poliza',
    title: 'Modificación de información de póliza',
    description: 'Modifica datos generales o beneficiarios de tu póliza.',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-8 w-8"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
        />
      </svg>
    ),
    active: false,
    badge: 'Siguiente ola',
  },
];

export default function SeleccionPage() {
  const router = useRouter();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  async function handleSelect(option: ProcessOption) {
    if (!option.active) {
      setToastMessage(
        'Este proceso estará disponible en futuras iteraciones.'
      );
      await tracker.track('future_feature_viewed', 'seleccion', { feature: option.id });
      return;
    }

    await tracker.track('process_selected', 'seleccion');
    router.push('/prototipo/requisitos');
  }

  return (
    <main className="min-h-screen bg-alfa-surface flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-alfa-navy">
            ¿Qué necesitas hacer?
          </h1>
          <p className="text-gray-600">
            Selecciona el trámite que deseas realizar.
          </p>
        </div>

        <div className="grid gap-4">
          {processOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => handleSelect(option)}
              aria-disabled={!option.active}
              className={[
                'w-full text-left transition-all',
                option.active
                  ? 'cursor-pointer hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-alfa-green focus-visible:ring-offset-2'
                  : 'cursor-not-allowed opacity-60',
              ].join(' ')}
            >
              <Card
                variant="bordered"
                className={[
                  'flex items-start gap-4',
                  option.active
                    ? 'border-alfa-green border-2'
                    : 'border-gray-200 bg-gray-50',
                ].join(' ')}
              >
                <div
                  className={[
                    'flex-shrink-0 p-2 rounded-lg',
                    option.active
                      ? 'text-alfa-green bg-alfa-green/10'
                      : 'text-gray-400 bg-gray-100',
                  ].join(' ')}
                >
                  {option.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2
                      className={[
                        'font-semibold',
                        option.active ? 'text-alfa-navy' : 'text-gray-500',
                      ].join(' ')}
                    >
                      {option.title}
                    </h2>
                    <Badge variant={option.active ? 'status' : 'warning'}>
                      {option.badge}
                    </Badge>
                  </div>
                  <p
                    className={[
                      'text-sm mt-1',
                      option.active ? 'text-gray-600' : 'text-gray-400',
                    ].join(' ')}
                  >
                    {option.description}
                  </p>
                </div>
                {option.active && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-alfa-green flex-shrink-0 mt-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                )}
              </Card>
            </button>
          ))}
        </div>

        {toastMessage && (
          <Toast
            variant="info"
            message={toastMessage}
            onClose={() => setToastMessage(null)}
          />
        )}
      </div>
    </main>
  );
}
