import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 py-16">
      <div className="text-center max-w-md mx-auto space-y-6">
        {/* 404 visual */}
        <div className="text-8xl font-bold text-alfa-navy/10" aria-hidden="true">
          404
        </div>

        {/* Message */}
        <h1 className="text-2xl md:text-3xl font-bold text-alfa-navy">
          Página no encontrada
        </h1>
        <p className="text-alfa-muted text-lg">
          La página que buscas no existe o ha sido movida.
        </p>

        {/* Action */}
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors px-6 py-3 min-h-[44px] min-w-[44px] bg-alfa-green text-white hover:bg-alfa-green/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-alfa-green"
        >
          ← Volver al inicio
        </Link>
      </div>

      {/* Disclaimer */}
      <div className="mt-16 text-center">
        <p className="text-xs text-alfa-muted">
          ⚠️ Prototipo conceptual — No conectado a sistemas productivos de Seguros Alfa
        </p>
      </div>
    </div>
  );
}
