'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button, Card, Badge, Skeleton } from '@/components/ui';
import { STATUS_LABELS, REQUEST_STATUSES, type RequestStatus } from '@/lib/services/state-machine';

interface TimelineEntry {
  status: string;
  description: string;
  changedAt: string;
}

interface RequestData {
  requestId: number;
  trackingCode: string;
  status: RequestStatus;
  filedAt: string;
  timeline: TimelineEntry[];
}

type PageState = 'loading' | 'success' | 'not-found' | 'error';

export default function SeguimientoDetalPage() {
  const params = useParams();
  const radicado = params.radicado as string;

  const [pageState, setPageState] = useState<PageState>('loading');
  const [data, setData] = useState<RequestData | null>(null);
  const [simulating, setSimulating] = useState(false);

  const fetchRequest = useCallback(async () => {
    setPageState('loading');
    try {
      const res = await fetch(`/api/requests/${encodeURIComponent(radicado)}`);
      if (res.status === 404) {
        setPageState('not-found');
        return;
      }
      if (!res.ok) {
        setPageState('error');
        return;
      }
      const json: RequestData = await res.json();
      setData(json);
      setPageState('success');
    } catch {
      setPageState('error');
    }
  }, [radicado]);

  useEffect(() => {
    fetchRequest();
  }, [fetchRequest]);

  async function handleSimulate() {
    setSimulating(true);
    try {
      const res = await fetch(`/api/requests/${encodeURIComponent(radicado)}/simulate-status`, {
        method: 'POST',
      });
      if (res.ok) {
        await fetchRequest();
      }
    } finally {
      setSimulating(false);
    }
  }

  if (pageState === 'loading') {
    return (
      <main className="min-h-screen bg-alfa-surface flex items-center justify-center p-4">
        <div className="max-w-2xl w-full space-y-6">
          <Skeleton height="2rem" width="60%" />
          <Card variant="bordered" className="space-y-4">
            <Skeleton height="1.5rem" width="40%" />
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} height="3rem" />
              ))}
            </div>
          </Card>
        </div>
      </main>
    );
  }

  if (pageState === 'not-found') {
    return (
      <main className="min-h-screen bg-alfa-surface flex items-center justify-center p-4">
        <Card variant="bordered" className="max-w-md w-full text-center space-y-4">
          <div className="text-4xl">🔍</div>
          <h1 className="text-xl font-bold text-alfa-navy">No se encontró la solicitud</h1>
          <p className="text-gray-600">
            El código <span className="font-mono font-medium">{radicado}</span> no corresponde a
            ninguna solicitud registrada.
          </p>
          <Link href="/seguimiento">
            <Button variant="outline">Volver a consultar</Button>
          </Link>
        </Card>
      </main>
    );
  }

  if (pageState === 'error') {
    return (
      <main className="min-h-screen bg-alfa-surface flex items-center justify-center p-4">
        <Card variant="bordered" className="max-w-md w-full text-center space-y-4">
          <div className="text-4xl">⚠️</div>
          <h1 className="text-xl font-bold text-alfa-navy">Error al consultar</h1>
          <p className="text-gray-600">
            Ocurrió un error al consultar el estado de tu solicitud. Intenta nuevamente.
          </p>
          <Button onClick={fetchRequest}>Reintentar</Button>
        </Card>
      </main>
    );
  }

  // Success state
  const isFinal = data!.status === 'finalizado';

  return (
    <main className="min-h-screen bg-alfa-surface p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-1">
          <Link
            href="/seguimiento"
            className="text-sm text-alfa-green hover:underline inline-flex items-center gap-1"
          >
            ← Volver a seguimiento
          </Link>
          <h1 className="text-2xl font-bold text-alfa-navy">Estado de la solicitud</h1>
          <p className="text-gray-600 font-mono text-sm">{data!.trackingCode}</p>
        </div>

        {/* Timeline */}
        <Card variant="bordered" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-alfa-navy">Línea de tiempo</h2>
            <Badge variant={isFinal ? 'status' : 'warning'}>
              {STATUS_LABELS[data!.status]}
            </Badge>
          </div>

          <StatusTimeline
            currentStatus={data!.status}
            timeline={data!.timeline}
          />

          {!isFinal && (
            <Button
              onClick={handleSimulate}
              loading={simulating}
              variant="outline"
              size="sm"
            >
              Simular avance
            </Button>
          )}
        </Card>
      </div>
    </main>
  );
}

/* ---------- StatusTimeline Component ---------- */

interface StatusTimelineProps {
  currentStatus: RequestStatus;
  timeline: TimelineEntry[];
}

function StatusTimeline({ currentStatus, timeline }: StatusTimelineProps) {
  const currentIndex = REQUEST_STATUSES.indexOf(currentStatus);

  return (
    <ol className="relative border-l-2 border-gray-200 ml-4 space-y-6" aria-label="Timeline de estados">
      {REQUEST_STATUSES.map((status, index) => {
        const isCompleted = index <= currentIndex;
        const isCurrent = index === currentIndex;
        const timelineEntry = timeline.find((t) => t.status === status);

        return (
          <li key={status} className="ml-6">
            {/* Dot */}
            <span
              className={[
                'absolute -left-[13px] flex h-6 w-6 items-center justify-center rounded-full ring-4 ring-alfa-surface',
                isCompleted
                  ? 'bg-alfa-green text-white'
                  : 'bg-gray-200 text-gray-400',
                isCurrent ? 'ring-alfa-green/20' : '',
              ].join(' ')}
              aria-hidden="true"
            >
              {isCompleted ? (
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <span className="w-2 h-2 rounded-full bg-current" />
              )}
            </span>

            {/* Content */}
            <div className={isCompleted ? 'text-alfa-navy' : 'text-gray-400'}>
              <h3 className={['text-sm font-semibold', isCurrent ? 'text-alfa-green' : ''].join(' ')}>
                {STATUS_LABELS[status]}
              </h3>
              {timelineEntry && (
                <time className="block text-xs text-gray-500 mt-0.5">
                  {new Date(timelineEntry.changedAt).toLocaleString('es-CO', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </time>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
