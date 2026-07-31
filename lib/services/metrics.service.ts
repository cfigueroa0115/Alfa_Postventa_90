import { eventsRepo, requestsRepo, feedbackRepo } from '@/lib/repositories';

export interface MetricsData {
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

export async function getMetrics(): Promise<MetricsData> {
  const eventCounts = await eventsRepo.countEventsByType();
  const totalRequests = await requestsRepo.getTotalRequests();
  const averageCES = await feedbackRepo.getAverageCES();

  const totalSessions = eventCounts.find((e) => e.eventType === 'journey_started')?.count ?? 0;
  const processesSelected = eventCounts.find((e) => e.eventType === 'process_selected')?.count ?? 0;
  const requirementsConfirmed =
    eventCounts.find((e) => e.eventType === 'requirements_confirmed')?.count ?? 0;
  const formsStarted = eventCounts.find((e) => e.eventType === 'form_started')?.count ?? 0;
  const requestsFiled = eventCounts.find((e) => e.eventType === 'request_filed')?.count ?? 0;

  const completionRate = totalSessions > 0 ? requestsFiled / totalSessions : 0;

  const funnel = [
    { step: 'Sesión iniciada', count: totalSessions, percentage: 100 },
    {
      step: 'Proceso seleccionado',
      count: processesSelected,
      percentage: totalSessions > 0 ? Math.round((processesSelected / totalSessions) * 100) : 0,
    },
    {
      step: 'Requisitos confirmados',
      count: requirementsConfirmed,
      percentage:
        totalSessions > 0 ? Math.round((requirementsConfirmed / totalSessions) * 100) : 0,
    },
    {
      step: 'Formulario iniciado',
      count: formsStarted,
      percentage: totalSessions > 0 ? Math.round((formsStarted / totalSessions) * 100) : 0,
    },
    {
      step: 'Solicitud radicada',
      count: requestsFiled,
      percentage: totalSessions > 0 ? Math.round((requestsFiled / totalSessions) * 100) : 0,
    },
  ];

  const abandonmentByStep = [
    {
      step: 'Selección',
      rate:
        totalSessions > 0
          ? Number(((totalSessions - processesSelected) / totalSessions).toFixed(2))
          : 0,
    },
    {
      step: 'Requisitos',
      rate:
        processesSelected > 0
          ? Number(((processesSelected - requirementsConfirmed) / processesSelected).toFixed(2))
          : 0,
    },
    {
      step: 'Formulario',
      rate:
        requirementsConfirmed > 0
          ? Number(
              ((requirementsConfirmed - formsStarted) / requirementsConfirmed).toFixed(2)
            )
          : 0,
    },
    {
      step: 'Revisión',
      rate:
        formsStarted > 0
          ? Number(((formsStarted - requestsFiled) / formsStarted).toFixed(2))
          : 0,
    },
  ];

  return {
    kpis: {
      totalSessions,
      processesSelected,
      requirementsConfirmed,
      formsStarted,
      requestsFiled,
    },
    completionRate: Number(completionRate.toFixed(2)),
    averageCES: averageCES ?? 0,
    averageCompletionTimeSeconds: 240, // Placeholder — compute from actual data if available
    funnel,
    abandonmentByStep,
    isSynthetic: true,
  };
}
