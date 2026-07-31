'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, Badge, Skeleton, Button } from '@/components/ui';

// Chart colors
const COLORS = {
  green: '#009A76',
  navy: '#0B2A55',
  gold: '#D89A1D',
  muted: '#64748B',
  danger: '#C62828',
  light: '#F7F9FC',
};

const STATUS_COLORS: Record<string, string> = {
  'Radicado': COLORS.gold,
  'En validación': COLORS.navy,
  'Procesado': COLORS.muted,
  'Finalizado': COLORS.green,
};

interface MetricsData {
  kpis: { totalSessions: number; processesSelected: number; requirementsConfirmed: number; formsStarted: number; requestsFiled: number; };
  filingRate: number;
  completionRate: number;
  averageCES: number | null;
  cesResponseCount: number;
  averageCompletionTimeSeconds: number | null;
  medianCompletionTimeSeconds: number | null;
  p90CompletionTimeSeconds: number | null;
  completionTimeSampleSize: number;
  funnel: Array<{ step: string; count: number; percentage: number }>;
  abandonmentByStep: Array<{ step: string; rate: number }>;
  statusDistribution: Array<{ status: string; label: string; count: number; percentage: number }>;
  cesDistribution: Array<{ score: number; count: number; percentage: number }>;
  isSynthetic: boolean;
  metadata: { generatedAt: string; dataSource: string; uniqueSessions: boolean };
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

  if (pageState === 'loading') return <LoadingSkeleton />;
  if (pageState === 'error') {
    return (
      <main className="min-h-screen bg-alfa-background flex items-center justify-center p-4">
        <Card variant="bordered" className="max-w-md w-full text-center space-y-4">
          <div className="text-4xl">⚠️</div>
          <h1 className="text-xl font-bold text-alfa-navy">Error al cargar métricas</h1>
          <p className="text-gray-600">No se pudieron obtener los datos. Intenta nuevamente.</p>
          <Button onClick={fetchMetrics}>Reintentar</Button>
        </Card>
      </main>
    );
  }

  const data = metrics!;

  // Transform funnel data for bar chart
  const funnelChartData = data.funnel.map(s => ({
    name: s.step
      .replace('Sesión iniciada', 'Sesión')
      .replace('Proceso seleccionado', 'Selección')
      .replace('Requisitos confirmados', 'Requisitos')
      .replace('Formulario iniciado', 'Formulario')
      .replace('Solicitud radicada', 'Radicación'),
    sesiones: s.count,
    porcentaje: s.percentage,
  }));

  // Transform abandonment for bar chart
  const abandonmentChartData = data.abandonmentByStep.map(s => ({
    name: s.step,
    abandono: Math.round(s.rate * 100),
  }));

  // CES distribution from real data
  const cesData = (data.cesDistribution ?? []).map(c => ({
    score: String(c.score),
    count: c.count,
  }));

  // Status distribution from real data
  const statusData = (data.statusDistribution ?? []).map(s => ({
    name: s.label,
    value: s.count,
  }));

  // Determine completion time display
  const hasRealTimeData = data.averageCompletionTimeSeconds !== null && data.averageCompletionTimeSeconds > 0;

  return (
    <main className="min-h-screen bg-alfa-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-bold text-alfa-navy">
              Dashboard ejecutivo del canal digital
            </h1>
            <p className="text-gray-600 text-sm">
              Lectura del journey, conversión, esfuerzo y trazabilidad de las sesiones demo.
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="warning">Datos de demostración</Badge>
              <span className="text-xs text-gray-400">Última actualización: {new Date().toLocaleTimeString('es-CO')}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchMetrics}>↻ Actualizar</Button>
          </div>
        </div>

        {/* North Star + KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <Card variant="elevated" className="col-span-2 text-center space-y-1 bg-gradient-to-br from-alfa-green/5 to-white">
            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Tasa de radicación</p>
            <p className="text-4xl font-bold text-alfa-green">{Math.round(data.completionRate * 100)}%</p>
            <p className="text-xs text-gray-400">{data.kpis.requestsFiled}/{data.kpis.totalSessions} sesiones</p>
          </Card>
          <KPICard label="Sesiones únicas" value={data.kpis.totalSessions} icon="📊" />
          <KPICard label="CES promedio" value={data.averageCES !== null ? Number(data.averageCES.toFixed(1)) : 0} icon="⭐" suffix="/7" />
          <KPICard label="Formularios" value={data.kpis.formsStarted} icon="📝" />
          <KPICard label="Radicadas" value={data.kpis.requestsFiled} icon="✅" />
        </div>

        {/* Completion time info */}
        <Card variant="bordered" className="text-center space-y-1">
          <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Tiempo promedio de radicación</p>
          {hasRealTimeData ? (
            <>
              <p className="text-3xl font-bold text-alfa-navy">{formatTime(data.averageCompletionTimeSeconds!)}</p>
              <p className="text-xs text-alfa-green">Calculado con datos reales</p>
            </>
          ) : (
            <>
              <p className="text-lg font-medium text-alfa-muted">—</p>
              <p className="text-xs text-alfa-muted">Aún no hay sesiones suficientes</p>
            </>
          )}
        </Card>

        {/* Charts Row 1: Funnel + Status Donut */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Funnel */}
          <Card variant="bordered" className="md:col-span-2 space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-alfa-navy">Embudo de conversión</h2>
              <p className="text-xs text-gray-500">¿Dónde se concentra la conversión del journey?</p>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funnelChartData} layout="vertical" margin={{ left: 20, right: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={80} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0' }} />
                  <Bar dataKey="sesiones" fill={COLORS.green} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Status Donut */}
          <Card variant="bordered" className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-alfa-navy">Estado de solicitudes</h2>
              <p className="text-xs text-gray-500">¿Cómo se distribuyen los trámites?</p>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {statusData.map((entry) => (
                      <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || COLORS.muted} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Charts Row 2: Abandonment + CES */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Abandonment */}
          <Card variant="bordered" className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-alfa-navy">Abandono por etapa</h2>
              <p className="text-xs text-gray-500">¿Dónde se concentra la mayor fricción?</p>
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={abandonmentChartData} margin={{ left: 10, right: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis unit="%" tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0' }}
                    formatter={(value) => [`${value}%`, 'Abandono']}
                  />
                  <Bar dataKey="abandono" radius={[4, 4, 0, 0]}>
                    {abandonmentChartData.map((entry, index) => (
                      <Cell key={index} fill={entry.abandono > 15 ? COLORS.danger : entry.abandono > 8 ? COLORS.gold : COLORS.green} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* CES Distribution */}
          <Card variant="bordered" className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-alfa-navy">Distribución CES (1–7)</h2>
              <p className="text-xs text-gray-500">¿Qué tan fácil percibe el usuario la experiencia?</p>
            </div>
            <div className="text-center mb-2">
            <span className="text-3xl font-bold text-alfa-green">{data.averageCES !== null ? data.averageCES.toFixed(1) : '—'}</span>
              <span className="text-sm text-gray-400 ml-1">/7 promedio</span>
            </div>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cesData} margin={{ left: 10, right: 10 }}>
                  <XAxis dataKey="score" tick={{ fontSize: 12 }} />
                  <YAxis hide />
                  <Tooltip contentStyle={{ borderRadius: '8px' }} formatter={(value) => [value, 'Respuestas']} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {cesData.map((entry, index) => (
                      <Cell key={index} fill={Number(entry.score) >= 6 ? COLORS.green : Number(entry.score) >= 4 ? COLORS.gold : COLORS.danger} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-between text-xs text-gray-400 px-2">
              <span>Muy difícil</span>
              <span>Muy fácil</span>
            </div>
          </Card>
        </div>

        {/* Insights */}
        <Card variant="bordered" className="space-y-4">
          <h2 className="text-lg font-semibold text-alfa-navy">Lectura estratégica</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <InsightCard
              title="Mayor punto de fricción"
              finding={abandonmentChartData.length > 0
                ? `La mayor pérdida del embudo se presenta en la etapa "${abandonmentChartData.reduce((max, c) => c.abandono > max.abandono ? c : max, abandonmentChartData[0]).name}" (${abandonmentChartData.reduce((max, c) => c.abandono > max.abandono ? c : max, abandonmentChartData[0]).abandono}%).`
                : 'Aún no hay datos suficientes.'}
              action="Simplificar requisitos y precargar información para reducir abandono."
            />
            <InsightCard
              title="Esfuerzo percibido"
              finding={data.averageCES !== null && data.averageCES > 0
                ? `El CES promedio es ${data.averageCES.toFixed(1)}/7. ${data.averageCES >= 5 ? 'La experiencia se percibe como fluida.' : 'Existe oportunidad de mejora.'}`
                : 'Aún no hay respuestas CES suficientes.'}
              action={data.averageCES !== null && data.averageCES >= 5 ? "Mantener la experiencia actual y optimizar tiempos." : "Investigar puntos de fricción mediante feedback cualitativo."}
            />
          </div>
        </Card>

        {/* Assumptions disclaimer */}
        <Card variant="bordered" className="bg-alfa-gold/5 border-alfa-gold/20 space-y-3">
          <h2 className="text-lg font-semibold text-alfa-navy">Escenario ilustrativo del assessment</h2>
          <p className="text-xs text-gray-600">
            Los valores de línea base son supuestos de trabajo y requieren validación con información del canal.
            No representan datos reales de operación de Seguros Alfa.
          </p>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="space-y-1">
              <p className="font-medium text-alfa-navy">Supuestos PDF</p>
              <p className="text-gray-500">Tiempo: 15-20 min</p>
              <p className="text-gray-500">Error: ~30%</p>
              <p className="text-gray-500">Trazabilidad: Ninguna</p>
            </div>
            <div className="space-y-1">
              <p className="font-medium text-alfa-green">Observado en prototipo</p>
              <p className="text-gray-500">Tasa radicación: {Math.round(data.completionRate * 100)}%</p>
              <p className="text-gray-500">CES: {data.averageCES !== null ? data.averageCES.toFixed(1) : '—'}/7</p>
              <p className="text-gray-500">Trazabilidad: Completa</p>
            </div>
            <div className="space-y-1">
              <p className="font-medium text-alfa-gold">Metas propuestas</p>
              <p className="text-gray-500">Finalización: &gt;70%</p>
              <p className="text-gray-500">CES: &gt;5.0/7</p>
              <p className="text-gray-500">Tiempo: &lt;5 min</p>
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}

/* ---------- Subcomponents ---------- */

function KPICard({ label, value, icon, suffix }: { label: string; value: number; icon: string; suffix?: string }) {
  return (
    <Card variant="bordered" className="text-center space-y-1">
      <span className="text-lg" aria-hidden="true">{icon}</span>
      <p className="text-2xl font-bold text-alfa-navy">
        {typeof value === 'number' && value % 1 !== 0 ? value.toFixed(1) : value.toLocaleString('es-CO')}
        {suffix || ''}
      </p>
      <p className="text-xs text-gray-500">{label}</p>
    </Card>
  );
}

function InsightCard({ title, finding, action }: { title: string; finding: string; action: string }) {
  return (
    <div className="bg-alfa-background rounded-lg p-4 space-y-2">
      <p className="font-medium text-alfa-navy text-sm">{title}</p>
      <p className="text-sm text-gray-600">{finding}</p>
      <p className="text-xs text-alfa-green">→ {action}</p>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <main className="min-h-screen bg-alfa-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="space-y-2">
          <Skeleton height="2.5rem" width="60%" />
          <Skeleton height="1rem" width="80%" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (<Skeleton key={i} height="5rem" />))}
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <Skeleton height="18rem" className="md:col-span-2" />
          <Skeleton height="18rem" />
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <Skeleton height="16rem" />
          <Skeleton height="16rem" />
        </div>
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
