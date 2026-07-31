'use client';

import type { EventType } from '@/lib/validation';

/**
 * Cliente de tracking para registrar eventos desde el navegador.
 * Envía eventos de forma asíncrona al endpoint /api/events.
 * No bloquea la UI si falla el registro.
 */
class EventTracker {
  private sessionId: string | null = null;

  /**
   * Inicializa el tracker creando una sesión en el servidor.
   */
  async initialize(): Promise<string> {
    const viewport = this.detectViewport();

    const response = await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userAgent: navigator.userAgent,
        viewport,
        referrer: document.referrer || undefined,
      }),
    });

    if (!response.ok) {
      throw new Error('No se pudo iniciar la sesión de demostración');
    }

    const data = await response.json();
    this.sessionId = data.sessionId;

    // Persist sessionId in sessionStorage for the current tab
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('demo_session_id', data.sessionId);
    }

    return data.sessionId;
  }

  /**
   * Restaura una sesión existente de sessionStorage.
   */
  restore(): string | null {
    if (typeof window === 'undefined') return null;
    const id = sessionStorage.getItem('demo_session_id');
    if (id) this.sessionId = id;
    return id;
  }

  /**
   * Registra un evento de tracking.
   * No lanza errores — falla silenciosamente para no interrumpir la UX.
   */
  async track(
    eventType: EventType,
    step?: string,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    const sessionId = this.sessionId || this.restore();
    if (!sessionId) return;

    try {
      await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          eventType,
          step,
          metadata,
        }),
      });
    } catch {
      // Silently fail — tracking should not break the user experience
    }
  }

  /**
   * Retorna el sessionId actual.
   */
  getSessionId(): string | null {
    return this.sessionId || this.restore();
  }

  private detectViewport(): 'mobile' | 'tablet' | 'desktop' {
    if (typeof window === 'undefined') return 'desktop';
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }
}

// Singleton instance
export const tracker = new EventTracker();
