'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { tracker } from '@/lib/analytics';
import { Button, Card } from '@/components/ui';

interface RequirementItem {
  id: string;
  label: string;
}

const requirements: RequirementItem[] = [
  {
    id: 'poliza',
    label: 'Tener a mano una referencia ficticia de póliza',
  },
  {
    id: 'correo',
    label: 'Tener acceso al correo de demostración',
  },
  {
    id: 'no-documentos',
    label: 'No cargar documentos reales',
  },
  {
    id: 'verificar-datos',
    label: 'Verificar datos antes de enviar',
  },
  {
    id: 'consentimiento',
    label: 'Consentimiento de tratamiento de datos en modo demostrativo',
  },
];

export default function RequisitosPage() {
  const router = useRouter();
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const allChecked = requirements.every((req) => checked[req.id]);

  function handleToggle(id: string) {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  async function handleConfirm() {
    await tracker.track('requirements_confirmed', 'requisitos');
    router.push('/prototipo/formulario');
  }

  return (
    <main className="min-h-screen bg-alfa-surface flex items-center justify-center p-4">
      <div className="max-w-lg w-full space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-alfa-navy">
            Antes de comenzar
          </h1>
          <p className="text-gray-600">
            Tiempo estimado: <strong>3 a 5 minutos</strong>
          </p>
        </div>

        <Card variant="bordered" className="space-y-4">
          <p className="text-sm text-gray-600">
            Confirma que cumples con los siguientes requisitos para continuar:
          </p>

          <ul className="space-y-3" role="list">
            {requirements.map((req) => (
              <li key={req.id}>
                <label
                  className="flex items-start gap-3 cursor-pointer group"
                  htmlFor={`req-${req.id}`}
                >
                  <input
                    id={`req-${req.id}`}
                    type="checkbox"
                    checked={!!checked[req.id]}
                    onChange={() => handleToggle(req.id)}
                    className="mt-0.5 h-5 w-5 rounded border-gray-300 text-alfa-green focus:ring-alfa-green accent-alfa-green flex-shrink-0"
                  />
                  <span className="text-sm text-alfa-navy group-hover:text-alfa-green transition-colors">
                    {req.label}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </Card>

        <Button
          onClick={handleConfirm}
          disabled={!allChecked}
          className="w-full"
          size="lg"
        >
          Estoy listo para continuar
        </Button>
      </div>
    </main>
  );
}
