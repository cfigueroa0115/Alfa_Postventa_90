import { Card, Badge } from '@/components/ui';

const quickWins = [
  {
    title: 'Formulario digital guiado',
    description:
      'Reemplazo del PDF estático por un wizard multi-paso con validación en tiempo real que reduce errores y reprocesos.',
    badge: 'Quick Win 1',
  },
  {
    title: 'Validación en tiempo real',
    description:
      'Feedback inmediato campo a campo con esquemas Zod compartidos cliente/servidor que previenen envíos incorrectos.',
    badge: 'Quick Win 2',
  },
  {
    title: 'Trazabilidad del trámite',
    description:
      'Código de seguimiento único que permite al usuario consultar el estado de su solicitud en cualquier momento.',
    badge: 'Quick Win 3',
  },
  {
    title: 'Confirmación inmediata',
    description:
      'Pantalla de confirmación con resumen, código de seguimiento y próximos pasos claros al completar el trámite.',
    badge: 'Quick Win 4',
  },
  {
    title: 'Métricas de conversión',
    description:
      'Dashboard con embudo de conversión, tiempo promedio y tasa de finalización para demostrar impacto medible.',
    badge: 'Quick Win 5',
  },
];

const techStack = [
  { name: 'Next.js 14', role: 'Framework fullstack con App Router y Server Components' },
  { name: 'TypeScript', role: 'Tipado estricto en toda la aplicación' },
  { name: 'Tailwind CSS', role: 'Sistema de diseño utility-first responsivo' },
  { name: 'Zod', role: 'Validación de esquemas compartida cliente/servidor' },
  { name: 'Neon PostgreSQL', role: 'Base de datos serverless con cold start < 500ms' },
  { name: 'Drizzle ORM', role: 'ORM type-safe ligero para acceso a datos' },
  { name: 'Vercel', role: 'Plataforma de despliegue con CI/CD integrado' },
];

const limitations = [
  'No utiliza datos reales de asegurados ni se conecta a sistemas productivos de Seguros Alfa.',
  'La autenticación es simulada — no hay integración con SSO ni proveedores de identidad reales.',
  'No incorpora modelos de inteligencia artificial ni procesamiento de lenguaje natural.',
  'Los datos son sintéticos y generados para demostración; no representan información real.',
  'Es un prototipo conceptual para validar la experiencia de usuario y el enfoque técnico.',
];

export default function AcercaDelPrototipoPage() {
  return (
    <div className="min-h-screen bg-alfa-background">
      {/* Header */}
      <section className="bg-alfa-navy text-white py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold">Acerca de Alfa Postventa 90</h1>
          <p className="mt-4 text-lg text-gray-300 max-w-2xl mx-auto">
            Propuesta de transformación digital postventa para Seguros Alfa
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 py-12 space-y-12">
        {/* Propósito */}
        <Card variant="bordered">
          <h2 className="text-xl font-bold text-alfa-navy">Propósito</h2>
          <p className="mt-3 text-alfa-text leading-relaxed">
            Alfa Postventa 90 es un prototipo conceptual que demuestra cómo transformar digitalmente
            el proceso de postventa de Seguros Alfa. La propuesta parte del trámite de
            &quot;Actualización de datos de contacto&quot; como caso de uso end-to-end, mostrando
            una experiencia guiada, validada en tiempo real, medible y trazable que reemplaza los
            formularios PDF estáticos actuales.
          </p>
        </Card>

        {/* Alcance */}
        <Card variant="bordered">
          <h2 className="text-xl font-bold text-alfa-navy">Alcance</h2>
          <p className="mt-3 text-alfa-text leading-relaxed">
            El prototipo implementa el flujo completo de &quot;Actualización de datos de
            contacto&quot;: desde la identificación del usuario hasta la confirmación de radicación,
            incluyendo formulario wizard multi-paso, validación en tiempo real, guardado de
            borradores, confirmación con código de seguimiento, consulta de estado y métricas de
            conversión. Representa un caso de uso end-to-end que demuestra el enfoque aplicable a
            cualquier trámite postventa.
          </p>
        </Card>

        {/* Stack Tecnológico */}
        <Card variant="bordered">
          <h2 className="text-xl font-bold text-alfa-navy">Stack Tecnológico</h2>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {techStack.map((tech) => (
              <div key={tech.name} className="flex items-start gap-3">
                <span className="shrink-0 w-2 h-2 mt-2 rounded-full bg-alfa-green" aria-hidden="true" />
                <div>
                  <span className="font-semibold text-alfa-navy">{tech.name}</span>
                  <p className="text-sm text-alfa-muted">{tech.role}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Limitaciones */}
        <Card variant="bordered">
          <h2 className="text-xl font-bold text-alfa-navy">Limitaciones</h2>
          <ul className="mt-4 space-y-3">
            {limitations.map((limitation) => (
              <li key={limitation} className="flex items-start gap-3">
                <span className="shrink-0 mt-1 text-alfa-warning" aria-hidden="true">⚠️</span>
                <span className="text-alfa-text text-sm">{limitation}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Quick Wins */}
        <section>
          <h2 className="text-2xl font-bold text-alfa-navy text-center">
            5 Quick Wins demostrados
          </h2>
          <p className="mt-2 text-center text-alfa-muted">
            Resultados tangibles que validan el enfoque de transformación digital
          </p>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickWins.map((win) => (
              <Card key={win.title} variant="bordered" className="flex flex-col">
                <Badge variant="status" className="self-start mb-3">
                  {win.badge}
                </Badge>
                <h3 className="text-lg font-semibold text-alfa-navy">{win.title}</h3>
                <p className="mt-2 text-sm text-alfa-muted flex-1">{win.description}</p>
              </Card>
            ))}
          </div>
        </section>
      </div>

      {/* Disclaimer */}
      <section className="border-t border-gray-200 bg-alfa-gold/5 py-6 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm text-alfa-muted">
            ⚠️ <strong>Prototipo conceptual</strong> — Este sistema es una demostración de experiencia
            de usuario y enfoque técnico. No está conectado a sistemas productivos de Seguros Alfa ni
            utiliza datos reales de asegurados.
          </p>
        </div>
      </section>
    </div>
  );
}
