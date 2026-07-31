'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, Badge, Skeleton, Button } from '@/components/ui';

interface MetricsData {
  kpis: {
    totalSessions: number;
    processesSelected: number;
    requirementsConfirmed: number;
    formsStarted: number;
    requestsFiled: number;
  };
  completionRate: number;
  averageCES: number;
  averageCompletionTimeSeconds: number;
  funnel: Array<{ step: string; count: number; percentage: number }>;
  abandonmentByStep: Array<{ step: string; rate: number }>;
  isSynthetic: boolean;
}

type PageState = 'loading' | 'success' | 'error';

export default function MetricasPage() {
  const [pageState, setPageState] = useState<PageState>('loading');
  const [metrics, setMetrics] = useState<MetricsData | null>(null);

  const fetchMetrics = useCallback(async () => {
    setPageState('loading');
    try {
      const res = await fetch('/api/metrics');
      if (!res.ok) {
        setPageState('error');
        return;
      }
      const json: MetricsData = await res.json();
      setMetrics(json);
      setPageState('success');
    } catch {
      setPageState('error');
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  if (pageState === 'loading') {
    return <LoadingSkeleton />;
  }

  if (pageState === 'error') {
    return (
      <main className="min-h-screen bg-alfa-surface flex items-center justify-center p-4">
        <Card variant="bordered" className="max-w-md w-full text-center space-y-4">
          <div className="text-4xl">⚠️</div>
          <h1 className="text-xl font-bold text-alfa-navy">Error al cargar métricas</h1>
          <p className="text-gray-600">
            No se pudieron obtener las métricas. Intenta nuevamente.
          </p>
          <Button onClick={fetchMetrics}>Reintentar</Button>
        </Card>
      </main>
    );
  }

  const data = metrics!;

  return (
    <main className="min-h-screen bg-alfa-surface p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-alfa-navy">Dashboard de Métricas</h1>
          <p className="text-gray-600 text-sm">
            Indicadores de desempeño del prototipo de autogestión digital
          </p>
          <Badge variant="warning">Datos ilustrativos y de sesiones demo</Badge>
        </div>

        {/* North Star Metric */}
        <Card variant="elevated" className="text-center space-y-2">
          <p className="text-sm text-gray-500 uppercase tracking-wide font-medium">
            North Star Metric — Tasa de finalización
          </p>
          <p className="text-5xl font-bold text-alfa-green">
            {Math.round(data.completionRate * 100)}%
          </p>
          <p className="text-sm text-gray-500">
            {data.kpis.requestsFiled} de {data.kpis.totalSessions} sesiones completaron el flujo
          </p>
        </Card>

        {/* KPI Cards */}
        <section aria-labelledby="kpis-heading">
          <h2 id="kpis-heading" className="text-lg font-semibold text-alfa-navy mb-4">
            Indicadores clave
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <KPICard label="Sesiones" value={data.kpis.totalSessions} />
            <KPICard label="Proceso seleccionado" value={data.kpis.processesSelected} />
            <KPICard label="Requisitos confirmados" value={data.kpis.requirementsConfirmed} />
            <KPICard label="Formulario iniciado" value={data.kpis.formsStarted} />
            <KPICard label="Solicitudes radicadas" value={data.kpis.requestsFiled} />
          </div>
        </section>

        {/* Funnel */}
        <section aria-labelledby="funnel-heading">
          <h2 id="funnel-heading" className="text-lg font-semibold text-alfa-navy mb-4">
            Embudo de conversión
          </h2>
          <Card variant="bordered" className="space-y-3">
            {data.funnel.map((step) => (
              <FunnelBar key={step.step} label={step.step} count={step.count} percentage={step.percentage} />
            ))}
          </Card>
        </section>

        {/* Abandonment by step */}
        <section aria-labelledby="abandonment-heading">
          <h2 id="abandonment-heading" className="text-lg font-semibold text-alfa-navy mb-4">
            Abandono por paso
          </h2>
          <Card variant="bordered" className="space-y-3">
            {data.abandonmentByStep.map((step) => (
              <HorizontalBar
                key={step.step}
                label={step.step}
                value={Math.round(step.rate * 100)}
                color="bg-red-400"
              />
            ))}
          </Card>
        </section>

        {/* CES & Completion Time */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* CES Score */}
          <section aria-labelledby="ces-heading">
            <h2 id="ces-heading" className="text-lg font-semibold text-alfa-navy mb-4">
              Puntuación CES
            </h2>
            <Card variant="bordered" className="text-center space-y-3">
              <CESGauge score={data.averageCES} />
              <p className="text-sm text-gray-500">
                Customer Effort Score promedio (1-7)
              </p>
            </Card>
          </section>

          {/* Average Completion Time */}
          <section aria-labelledby="time-heading">
            <h2 id="time-heading" className="text-lg font-semibold text-alfa-navy mb-4">
              Tiempo promedio de completado
            </h2>
            <Card variant="bordered" className="text-center space-y-3 flex flex-col items-center justify-center">
              <p className="text-4xl font-bold text-alfa-navy">
                {formatTime(data.averageCompletionTimeSeconds)}
              </p>
              <p className="text-sm text-gray-500">
                Tiempo promedio para radicar una solicitud
              </p>
            </Card>
          </section>
        </div>

        {/* Comparison Table */}
        <section aria-labelledby="comparison-heading">
          <h2 id="comparison-heading" className="text-lg font-semibold text-alfa-navy mb-4">
            Comparativa: PDF vs. Prototipo Digital
          </h2>
          <Card variant="bordered">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Métrica</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-500">PDF (línea base)</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-500">Prototipo digital</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <ComparisonRow metric="Tiempo promedio" pdf="15-20 min" digital={formatTime(data.averageCompletionTimeSeconds)} />
                  <ComparisonRow metric="Tasa de error" pdf="~30%" digital="<5%" />
                  <ComparisonRow metric="Validación en tiempo real" pdf="No" digital="Sí" />
                  <ComparisonRow metric="Trazabilidad" pdf="Ninguna" digital="Completa" />
                  <ComparisonRow metric="Disponibilidad" pdf="Horario oficina" digital="24/7" />
                  <ComparisonRow metric="Esfuerzo percibido (CES)" pdf="~3.0/7" digital={`${data.averageCES.toFixed(1)}/7`} />
                </tbody>
              </table>
            </div>
          </Card>
        </section>
      </div>
    </main>
  );
}

/* ---------- Subcomponents ---------- */

function KPICard({ label, value }: { label: string; value: number }) {
  return (
    <Card variant="bordered" className="text-center space-y-1">
      <p className="text-2xl font-bold text-alfa-navy">{value.toLocaleString('es-CO')}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </Card>
  );
}

function FunnelBar({ label, count, percentage }: { label: string; count: number; percentage: number }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-gray-700">{label}</span>
        <span className="text-gray-500 font-medium">{count} ({percentage}%)</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-4">
        <div
          className="bg-alfa-green h-4 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${label}: ${percentage}%`}
        />
      </div>
    </div>
  );
}

function HorizontalBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-gray-700">{label}</span>
        <span className="text-gray-500 font-medium">{value}%</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-3">
        <div
          className={`${color} h-3 rounded-full transition-all duration-500`}
          style={{ width: `${Math.min(value, 100)}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${label}: ${value}%`}
        />
      </div>
    </div>
  );
}

function CESGauge({ score }: { score: number }) {
  const percentage = (score / 7) * 100;
  const isGood = score >= 5;

  return (
    <div className="space-y-2">
      <p className={`text-4xl font-bold ${isGood ? 'text-alfa-green' : 'text-alfa-gold'}`}>
        {score.toFixed(1)}
      </p>
      <div className="w-full max-w-xs mx-auto bg-gray-100 rounded-full h-4">
        <div
          className={`h-4 rounded-full transition-all duration-500 ${isGood ? 'bg-alfa-green' : 'bg-alfa-gold'}`}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={score}
          aria-valuemin={1}
          aria-valuemax={7}
          aria-label={`CES Score: ${score.toFixed(1)} de 7`}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-400 max-w-xs mx-auto">
        <span>1 (Difícil)</span>
        <span>7 (Fácil)</span>
      </div>
    </div>
  );
}

function ComparisonRow({ metric, pdf, digital }: { metric: string; pdf: string; digital: string }) {
  return (
    <tr>
      <td className="py-3 px-4 font-medium text-gray-700">{metric}</td>
      <td className="py-3 px-4 text-center text-gray-500">{pdf}</td>
      <td className="py-3 px-4 text-center text-alfa-green font-medium">{digital}</td>
    </tr>
  );
}

function LoadingSkeleton() {
  return (
    <main className="min-h-screen bg-alfa-surface p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="space-y-2">
          <Skeleton height="2rem" width="50%" />
          <Skeleton height="1rem" width="70%" />
        </div>
        <Skeleton height="8rem" />
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} height="5rem" />
          ))}
        </div>
        <Skeleton height="12rem" />
        <Skeleton height="10rem" />
      </div>
    </main>
  );
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
}
