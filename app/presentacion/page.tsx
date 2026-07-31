'use client';

import { useState } from 'react';
import { Card } from '@/components/ui';

export default function PresentacionPage() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';
  const isLocalhost = !appUrl || appUrl.includes('localhost') || appUrl.includes('127.0.0.1');
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!appUrl) return;
    try {
      await navigator.clipboard.writeText(appUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = appUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-alfa-navy flex flex-col items-center justify-center px-6 py-12">
      {/* Main content optimized for projection */}
      <div className="w-full max-w-3xl text-center space-y-10">
        {/* Title */}
        <div>
          <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight">
            Explorar prototipo
          </h1>
          <p className="mt-3 text-2xl md:text-3xl font-light text-alfa-green">
            Alfa Postventa 90
          </p>
        </div>

        {/* QR / URL Section */}
        <Card variant="elevated" className="mx-auto max-w-lg">
          {isLocalhost ? (
            <div className="py-8 space-y-4">
              <div className="w-48 h-48 mx-auto bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                <p className="text-sm text-alfa-muted text-center px-4">
                  QR disponible en producción
                </p>
              </div>
              <p className="text-alfa-warning font-medium text-sm">
                URL de producción no disponible aún
              </p>
              <p className="text-alfa-muted text-xs">
                Configura NEXT_PUBLIC_APP_URL en las variables de entorno para habilitar el código QR
                y el enlace al prototipo.
              </p>
            </div>
          ) : (
            <div className="py-8 space-y-6">
              {/* Real QR Code */}
              <div className="w-48 h-48 mx-auto bg-white border-2 border-alfa-navy/10 rounded-lg flex items-center justify-center p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/qr/alfa-postventa-90-qr.svg"
                  alt="Código QR - Alfa Postventa 90"
                  className="w-full h-full"
                />
              </div>

              {/* URL display */}
              <div className="space-y-2">
                <p className="text-xs text-alfa-muted uppercase tracking-wide font-medium">
                  Escanea el QR o visita
                </p>
                <p className="text-lg font-mono font-semibold text-alfa-navy break-all">
                  {appUrl}
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors px-5 py-2.5 min-h-[44px] min-w-[44px] bg-alfa-navy text-white hover:bg-alfa-navy-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-alfa-navy"
                  aria-label="Copiar enlace del prototipo al portapapeles"
                >
                  {copied ? '✓ Copiado' : 'Copiar enlace'}
                </button>
                <a
                  href={appUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors px-5 py-2.5 min-h-[44px] min-w-[44px] bg-alfa-green text-white hover:bg-alfa-green/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-alfa-green"
                >
                  Abrir prototipo ↗
                </a>
              </div>

              {/* Download buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 border-t border-gray-100 pt-4">
                <a
                  href="/qr/alfa-postventa-90-qr.png"
                  download
                  className="inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors px-4 py-2 min-h-[44px] min-w-[44px] text-sm border border-alfa-navy/20 text-alfa-navy hover:bg-alfa-navy/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-alfa-navy"
                >
                  Descargar QR PNG
                </a>
                <a
                  href="/qr/alfa-postventa-90-qr.svg"
                  download
                  className="inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors px-4 py-2 min-h-[44px] min-w-[44px] text-sm border border-alfa-navy/20 text-alfa-navy hover:bg-alfa-navy/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-alfa-navy"
                >
                  Descargar QR SVG
                </a>
              </div>
            </div>
          )}
        </Card>

        {/* Subtitle for presentation context */}
        <p className="text-gray-400 text-lg max-w-xl mx-auto">
          Propuesta de transformación digital del proceso de postventa — Actualización de datos de
          contacto
        </p>
      </div>

      {/* Disclaimer at bottom */}
      <div className="mt-auto pt-12 w-full max-w-3xl">
        <div className="border-t border-white/10 pt-6 text-center">
          <p className="text-xs text-gray-400">
            ⚠️ Prototipo conceptual para validación de experiencia — No conectado a sistemas
            productivos de Seguros Alfa
          </p>
        </div>
      </div>
    </div>
  );
}
