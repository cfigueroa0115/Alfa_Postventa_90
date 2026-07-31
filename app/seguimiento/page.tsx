'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { tracker } from '@/lib/analytics';
import { Button, Card, Input } from '@/components/ui';

const TRACKING_CODE_REGEX = /^DEMO-ALFA-\d{8}-\d{4}$/;

export default function SeguimientoPage() {
  const router = useRouter();
  const [trackingCode, setTrackingCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setTrackingCode(e.target.value.toUpperCase());
    if (error) setError(null);
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();

    const trimmed = trackingCode.trim();

    if (!trimmed) {
      setError('Ingresa un código de radicado para consultar.');
      return;
    }

    if (!TRACKING_CODE_REGEX.test(trimmed)) {
      setError('Formato inválido. El código debe ser: DEMO-ALFA-XXXXXXXX-XXXX');
      return;
    }

    await tracker.track('tracking_consulted', 'seguimiento', { trackingCode: trimmed });
    router.push(`/seguimiento/${trimmed}`);
  }

  return (
    <main className="min-h-screen bg-alfa-surface flex items-center justify-center p-4">
      <div className="max-w-lg w-full space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-alfa-navy">
            Consulta el estado de tu solicitud
          </h1>
          <p className="text-gray-600">
            Ingresa el código de radicado que recibiste al enviar tu solicitud.
          </p>
        </div>

        <Card variant="bordered" className="space-y-4">
          <form onSubmit={handleSearch} className="space-y-4">
            <Input
              label="Código de radicado"
              type="text"
              value={trackingCode}
              onChange={handleChange}
              placeholder="DEMO-ALFA-20260715-0001"
              error={error || undefined}
              required
              aria-describedby="tracking-format-hint"
            />
            <p id="tracking-format-hint" className="text-xs text-gray-400">
              Formato: DEMO-ALFA-YYYYMMDD-XXXX
            </p>

            <Button
              type="submit"
              size="lg"
              className="w-full"
            >
              Buscar
            </Button>
          </form>
        </Card>
      </div>
    </main>
  );
}
