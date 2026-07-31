import Link from 'next/link';
import { Card } from '@/components/ui';

const problems = [
  {
    title: 'Dependencia de PDF',
    description: 'Formularios estáticos que generan errores y reprocesos constantes.',
  },
  {
    title: 'Baja finalización',
    description: 'Usuarios abandonan el trámite por complejidad y falta de guía.',
  },
  {
    title: 'Reprocesos',
    description: 'Documentación incompleta que obliga a reiniciar solicitudes.',
  },
  {
    title: 'Falta de trazabilidad',
    description: 'Sin visibilidad del estado real de cada solicitud.',
  },
  {
    title: 'Abandono del trámite',
    description: 'Fricción acumulada que lleva al usuario a desistir.',
  },
];

const solutionSteps = [
  { number: 1, title: 'Entender y medir', description: 'Diagnosticar el estado actual con datos reales.' },
  { number: 2, title: 'Documentar brechas', description: 'Identificar puntos de dolor y oportunidades.' },
  { number: 3, title: 'Diseñar solución', description: 'Crear el flujo digital que resuelve cada brecha.' },
  { number: 4, title: 'Planear ejecución', description: 'Definir roadmap con entregables medibles.' },
  { number: 5, title: 'Construir y validar', description: 'Implementar, probar y ajustar iterativamente.' },
];

const benefits = [
  { title: 'Mayor finalización', description: 'Guía paso a paso que reduce la complejidad percibida.' },
  { title: 'Menor abandono', description: 'Experiencia fluida que mantiene al usuario comprometido.' },
  { title: 'Menos reprocesos', description: 'Validación en tiempo real que previene errores.' },
  { title: 'Mayor trazabilidad', description: 'Seguimiento transparente del estado de cada trámite.' },
  { title: 'Mejor experiencia', description: 'Interfaz intuitiva diseñada para el usuario final.' },
];

const journeySteps = [
  'Orientarse',
  'Preparar requisitos',
  'Diligenciar',
  'Revisar',
  'Radicar',
  'Hacer seguimiento',
];

export default function Home() {
  return (
    <main className="min-h-screen bg-alfa-background">
      {/* Hero Section */}
      <section className="bg-alfa-navy text-white py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-bold leading-tight">
            Una postventa digital que guía, valida y acompaña hasta el cierre
          </h1>
          <p className="mt-6 text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
            Prototipo de autogestión diseñado para reducir fricciones, reprocesos y abandono,
            conectando experiencia, reglas de negocio, operación, datos y tecnología.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/prototipo"
              className="inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors px-7 py-3.5 text-lg min-h-[44px] min-w-[44px] bg-alfa-green text-white hover:bg-alfa-green/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-alfa-green"
            >
              Iniciar trámite demo
            </Link>
            <Link
              href="/metricas"
              className="inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors px-7 py-3.5 text-lg min-h-[44px] min-w-[44px] border-2 border-white text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white"
            >
              Ver métricas
            </Link>
            <Link
              href="/acerca-del-prototipo"
              className="inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors px-7 py-3.5 text-lg min-h-[44px] min-w-[44px] text-white hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white"
            >
              Conocer la propuesta
            </Link>
          </div>
        </div>
      </section>

      {/* Problem Block */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-alfa-navy text-center">
            ¿Por qué transformar la postventa?
          </h2>
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {problems.map((problem) => (
              <Card key={problem.title} variant="bordered" className="text-center">
                <h3 className="text-lg font-semibold text-alfa-navy">{problem.title}</h3>
                <p className="mt-2 text-alfa-muted text-sm">{problem.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Principles Block */}
      <section className="py-16 px-6 bg-alfa-surface">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-alfa-navy text-center">
            Un enfoque que conecta experiencia, datos y operación
          </h2>
          <div className="mt-10 grid grid-cols-1 md:grid-cols-5 gap-6">
            {solutionSteps.map((step) => (
              <div key={step.number} className="text-center">
                <div className="w-12 h-12 mx-auto rounded-full bg-alfa-green text-white flex items-center justify-center text-xl font-bold">
                  {step.number}
                </div>
                <h3 className="mt-4 text-base font-semibold text-alfa-navy">{step.title}</h3>
                <p className="mt-2 text-alfa-muted text-sm">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Block */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-alfa-navy text-center">
            Beneficios tangibles
          </h2>
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit) => (
              <Card key={benefit.title} variant="bordered" className="text-center">
                <h3 className="text-lg font-semibold text-alfa-green">{benefit.title}</h3>
                <p className="mt-2 text-alfa-muted text-sm">{benefit.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Visual Journey Block */}
      <section className="py-16 px-6 bg-alfa-surface">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-alfa-navy text-center">
            Recorrido del prototipo
          </h2>
          <div className="mt-10 flex flex-col md:flex-row items-center justify-center gap-4">
            {journeySteps.map((step, index) => (
              <div key={step} className="flex items-center gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-14 h-14 rounded-full bg-alfa-navy text-white flex items-center justify-center text-sm font-semibold text-center px-1">
                    {index + 1}
                  </div>
                  <span className="mt-2 text-sm font-medium text-alfa-text text-center max-w-[100px]">
                    {step}
                  </span>
                </div>
                {index < journeySteps.length - 1 && (
                  <span className="hidden md:block text-alfa-green text-2xl font-bold" aria-hidden="true">
                    →
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
