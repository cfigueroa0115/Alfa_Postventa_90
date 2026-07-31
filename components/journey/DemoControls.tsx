'use client';

import { useState } from 'react';
import { clearDraft } from '@/lib/forms';
import { tracker } from '@/lib/analytics';
import { Button } from '@/components/ui';

interface DemoControlsProps {
  onLoadDemoData?: () => void;
}

export function DemoControls({ onLoadDemoData }: DemoControlsProps) {
  const [showToast, setShowToast] = useState<string | null>(null);

  async function handleLoadDemoData() {
    if (onLoadDemoData) {
      onLoadDemoData();
    }
    await tracker.track('form_step_changed', 'demo_controls', { action: 'demo_data_loaded' });
    setShowToast('Datos demo cargados correctamente');
    setTimeout(() => setShowToast(null), 3000);
  }

  async function handleReset() {
    if (!confirm('¿Reiniciar la experiencia? Se perderá el progreso actual.')) return;
    clearDraft();
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('demo_session_id');
    }
    await tracker.track('form_step_changed', 'demo_controls', { action: 'demo_reset' });
    window.location.href = '/prototipo';
  }

  return (
    <div className="bg-alfa-gold/5 border border-alfa-gold/20 rounded-lg p-4 space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-alfa-gold uppercase tracking-wide">
          Modo demostración
        </span>
      </div>
      <p className="text-xs text-gray-500">
        Use únicamente información ficticia.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={handleLoadDemoData}>
          Cargar datos demo
        </Button>
        <Button size="sm" variant="ghost" onClick={handleReset}>
          Reiniciar experiencia
        </Button>
      </div>
      {showToast && (
        <p className="text-xs text-alfa-green font-medium" role="status" aria-live="polite">
          ✓ {showToast}
        </p>
      )}
    </div>
  );
}
