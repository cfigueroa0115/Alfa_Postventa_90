'use client';

import { usePathname } from 'next/navigation';

const JOURNEY_STEPS = [
  { id: 'tramite', label: 'Trámite', paths: ['/prototipo/seleccion'] },
  { id: 'requisitos', label: 'Requisitos', paths: ['/prototipo/requisitos'] },
  { id: 'datos', label: 'Actualización', paths: ['/prototipo/formulario'] },
  { id: 'revision', label: 'Revisión', paths: ['/prototipo/revision'] },
  { id: 'radicacion', label: 'Radicación', paths: ['/prototipo/confirmacion'] },
  { id: 'seguimiento', label: 'Seguimiento', paths: ['/seguimiento'] },
];

export function GlobalJourneyProgress() {
  const pathname = usePathname();
  
  // Determine current step index
  const currentIndex = JOURNEY_STEPS.findIndex(step =>
    step.paths.some(p => pathname.startsWith(p))
  );
  
  // Don't show if not in the journey
  if (currentIndex === -1) return null;

  return (
    <nav aria-label="Progreso del trámite" className="w-full bg-white border-b border-gray-100 py-3 px-4">
      <div className="max-w-4xl mx-auto">
        <ol className="flex items-center justify-between gap-1">
          {JOURNEY_STEPS.map((step, index) => {
            const isCompleted = index < currentIndex;
            const isCurrent = index === currentIndex;
            
            return (
              <li key={step.id} className="flex items-center gap-1 flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div className={[
                    'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold',
                    isCompleted ? 'bg-alfa-green text-white' :
                    isCurrent ? 'bg-alfa-navy text-white ring-2 ring-alfa-navy/20' :
                    'bg-gray-200 text-gray-400'
                  ].join(' ')}>
                    {isCompleted ? '✓' : index + 1}
                  </div>
                  <span className={[
                    'text-[10px] mt-1 text-center leading-tight',
                    isCurrent ? 'text-alfa-navy font-semibold' :
                    isCompleted ? 'text-alfa-green' : 'text-gray-400'
                  ].join(' ')}>
                    {step.label}
                  </span>
                </div>
                {index < JOURNEY_STEPS.length - 1 && (
                  <div className={[
                    'h-0.5 flex-1 mx-1',
                    index < currentIndex ? 'bg-alfa-green' : 'bg-gray-200'
                  ].join(' ')} aria-hidden="true" />
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}
