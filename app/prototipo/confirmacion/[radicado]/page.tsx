'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { tracker } from '@/lib/analytics';
import { Button, Card } from '@/components/ui';

export default function ConfirmacionPage() {
  const params = useParams();
  const radicado = params.radicado as string;

  const [copied, setCopied] = useState(false);
  const [cesScore, setCesScore] = useState<number | null>(null);
  const [cesComment, setCesComment] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackDismissed, setFeedbackDismissed] = useState(false);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(radicado);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for browsers without clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = radicado;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  async function handleSubmitFeedback() {
    if (!cesScore) return;

    setSubmittingFeedback(true);

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trackingCode: radicado,
          cesScore,
          comment: cesComment || undefined,
        }),
      });

      if (response.ok) {
        await tracker.track('feedback_submitted', 'confirmacion', { cesScore });
        setFeedbackSubmitted(true);
      }
    } catch {
      // Silently fail — feedback is optional
    } finally {
      setSubmittingFeedback(false);
    }
  }

  function handleSkipFeedback() {
    setFeedbackDismissed(true);
  }

  return (
    <main className="min-h-screen bg-alfa-surface flex items-center justify-center p-4">
      <div className="max-w-lg w-full space-y-6">
        {/* Success header */}
        <div className="text-center space-y-3">
          <div className="mx-auto w-16 h-16 bg-alfa-green/10 rounded-full flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-alfa-green"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-alfa-navy">
            ¡Solicitud radicada exitosamente!
          </h1>
          <p className="text-gray-600">
            Tu solicitud ha sido registrada. Guarda el código de radicado para consultar el estado.
          </p>
        </div>

        {/* Tracking code card */}
        <Card variant="elevated" className="text-center space-y-4">
          <p className="text-sm text-gray-500 uppercase tracking-wide font-medium">
            Código de radicado
          </p>
          <p className="text-2xl font-bold text-alfa-navy tracking-wider font-mono">
            {radicado}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            aria-label="Copiar código de radicado"
          >
            {copied ? (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Copiado
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                Copiar código
              </>
            )}
          </Button>
        </Card>

        {/* Next steps */}
        <Card variant="bordered" className="space-y-3">
          <h2 className="font-semibold text-alfa-navy">Próximos pasos</h2>
          <ol className="space-y-2 text-sm text-gray-600 list-decimal list-inside">
            <li>Tu solicitud será validada por nuestro equipo</li>
            <li>Puedes consultar el estado en cualquier momento con tu código</li>
            <li>Recibirás una notificación cuando el trámite esté completo</li>
          </ol>
          <Link
            href={`/seguimiento/${radicado}`}
            className="inline-flex items-center gap-2 text-alfa-green hover:underline text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-alfa-green rounded"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
            Consultar estado de mi solicitud
          </Link>
        </Card>

        {/* CES Feedback section */}
        {!feedbackSubmitted && !feedbackDismissed && (
          <Card variant="bordered" className="space-y-4">
            <h2 className="font-semibold text-alfa-navy">
              ¿Qué tan fácil fue este proceso?
            </h2>
            <p className="text-sm text-gray-500">
              Tu opinión nos ayuda a mejorar. (Opcional)
            </p>

            {/* Star rating */}
            <div className="flex items-center justify-center gap-2" role="radiogroup" aria-label="Calificación de esfuerzo">
              {[1, 2, 3, 4, 5].map((score) => (
                <button
                  key={score}
                  type="button"
                  onClick={() => setCesScore(score)}
                  className={[
                    'w-10 h-10 rounded-full text-lg font-bold transition-all',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-alfa-green focus-visible:ring-offset-2',
                    cesScore === score
                      ? 'bg-alfa-gold text-white scale-110'
                      : cesScore && score <= cesScore
                        ? 'bg-alfa-gold/60 text-white'
                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200',
                  ].join(' ')}
                  aria-label={`${score} de 5`}
                  role="radio"
                  aria-checked={cesScore === score}
                >
                  {score}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-400 px-1">
              <span>Muy difícil</span>
              <span>Muy fácil</span>
            </div>

            {/* Comment */}
            <textarea
              value={cesComment}
              onChange={(e) => setCesComment(e.target.value)}
              placeholder="Comentario opcional..."
              maxLength={1000}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-alfa-text placeholder:text-gray-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-alfa-green resize-none min-h-[80px]"
              aria-label="Comentario opcional sobre tu experiencia"
            />

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="primary"
                size="sm"
                onClick={handleSubmitFeedback}
                disabled={!cesScore}
                loading={submittingFeedback}
                className="flex-1"
              >
                Enviar calificación
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkipFeedback}
                className="flex-1"
              >
                Omitir
              </Button>
            </div>
          </Card>
        )}

        {/* Feedback submitted confirmation */}
        {feedbackSubmitted && (
          <Card variant="bordered" className="text-center space-y-2">
            <p className="text-sm text-alfa-green font-medium">
              ¡Gracias por tu retroalimentación!
            </p>
          </Card>
        )}

        {/* Back to home */}
        <div className="text-center">
          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-alfa-navy hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-alfa-green rounded"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </main>
  );
}
