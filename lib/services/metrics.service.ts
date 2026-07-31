import { feedbackRepo } from '@/lib/repositories';
import * as analyticsRepo from '@/lib/repositories/analytics.repo';

export interface MetricsData {
  kpis: {
    totalSessions: number;
    processesSelected: number;
    requirementsConfirmed: number;
    formsStarted: number;
    requestsFiled: number;
  };
  filingRate: number;
  completionRate: number; // Alias for backward compatibility
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

const STATUS_LABELS: Record<string, string> = {
  radicado: 'Radicado',
  en_validacion: 'En validación',
  procesado: 'Procesado',
  finalizado: 'Finalizado',
};

export async function getMetrics(): Promise<MetricsData> {
  const [eventCounts, averageCES, statusDist, cesDist, filingTime] = await Promise.all([
    analyticsRepo.countUniqueSessionsByEventType(),
    feedbackRepo.getAverageCES(),
    analyticsRepo.getRequestStatusDistribution(),
    analyticsRepo.getCESDistribution(),
    analyticsRepo.getFilingTimeStatistics(),
  ]);

  const totalSessions = eventCounts.find(e => e.eventType === 'journey_started')?.count ?? 0;
  const processesSelected = eventCounts.find(e => e.eventType === 'process_selected')?.count ?? 0;
  const requirementsConfirmed = eventCounts.find(e => e.eventType === 'requirements_confirmed')?.count ?? 0;
  const formsStarted = eventCounts.find(e => e.eventType === 'form_started')?.count ?? 0;
  const requestsFiled = eventCounts.find(e => e.eventType === 'request_filed')?.count ?? 0;

  const filingRate = totalSessions > 0 ? requestsFiled / totalSessions : 0;

  const funnel = [
    { step: 'Sesión iniciada', count: totalSessions, percentage: 100 },
    { step: 'Proceso seleccionado', count: processesSelected, percentage: totalSessions > 0 ? Math.round((processesSelected / totalSessions) * 100) : 0 },
    { step: 'Requisitos confirmados', count: requirementsConfirmed, percentage: totalSessions > 0 ? Math.round((requirementsConfirmed / totalSessions) * 100) : 0 },
    { step: 'Formulario iniciado', count: formsStarted, percentage: totalSessions > 0 ? Math.round((formsStarted / totalSessions) * 100) : 0 },
    { step: 'Solicitud radicada', count: requestsFiled, percentage: totalSessions > 0 ? Math.round((requestsFiled / totalSessions) * 100) : 0 },
  ];

  const abandonmentByStep = [
    { step: 'Selección', rate: totalSessions > 0 ? Number(((totalSessions - processesSelected) / totalSessions).toFixed(2)) : 0 },
    { step: 'Requisitos', rate: processesSelected > 0 ? Number(((processesSelected - requirementsConfirmed) / processesSelected).toFixed(2)) : 0 },
    { step: 'Formulario', rate: requirementsConfirmed > 0 ? Number(((requirementsConfirmed - formsStarted) / requirementsConfirmed).toFixed(2)) : 0 },
    { step: 'Revisión', rate: formsStarted > 0 ? Number(((formsStarted - requestsFiled) / formsStarted).toFixed(2)) : 0 },
  ];

  // Status distribution with labels and percentages
  const totalRequests = statusDist.reduce((sum, s) => sum + s.count, 0);
  const statusDistribution = statusDist.map(s => ({
    status: s.status,
    label: STATUS_LABELS[s.status] ?? s.status,
    count: s.count,
    percentage: totalRequests > 0 ? Number(((s.count / totalRequests) * 100).toFixed(1)) : 0,
  }));

  // CES distribution with percentages
  const totalCES = cesDist.reduce((sum, c) => sum + c.count, 0);
  const cesDistribution = cesDist.map(c => ({
    score: c.score,
    count: c.count,
    percentage: totalCES > 0 ? Number(((c.count / totalCES) * 100).toFixed(1)) : 0,
  }));

  return {
    kpis: { totalSessions, processesSelected, requirementsConfirmed, formsStarted, requestsFiled },
    filingRate: Number(filingRate.toFixed(2)),
    completionRate: Number(filingRate.toFixed(2)), // backward compat
    averageCES: averageCES ?? null,
    cesResponseCount: totalCES,
    averageCompletionTimeSeconds: filingTime.averageSeconds,
    medianCompletionTimeSeconds: filingTime.medianSeconds,
    p90CompletionTimeSeconds: filingTime.p90Seconds,
    completionTimeSampleSize: filingTime.sampleSize,
    funnel,
    abandonmentByStep,
    statusDistribution,
    cesDistribution,
    isSynthetic: false,
    metadata: { generatedAt: new Date().toISOString(), dataSource: 'neon', uniqueSessions: true },
  };
}
