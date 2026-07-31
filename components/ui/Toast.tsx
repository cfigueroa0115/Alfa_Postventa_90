'use client';

import { HTMLAttributes } from 'react';

type ToastVariant = 'success' | 'error' | 'info' | 'warning';

interface ToastProps extends HTMLAttributes<HTMLDivElement> {
  variant?: ToastVariant;
  message: string;
  visible?: boolean;
  onClose?: () => void;
}

const variantStyles: Record<ToastVariant, string> = {
  success: 'bg-alfa-success/10 border-alfa-success/30 text-alfa-success',
  error: 'bg-alfa-error/10 border-alfa-error/30 text-alfa-error',
  info: 'bg-blue-50 border-blue-200 text-blue-700',
  warning: 'bg-alfa-gold/10 border-alfa-gold/30 text-alfa-gold',
};

const icons: Record<ToastVariant, string> = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
  warning: '⚠',
};

export function Toast({
  variant = 'info',
  message,
  visible = true,
  onClose,
  className = '',
  ...props
}: ToastProps) {
  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={[
        'flex items-center gap-3 rounded-lg border px-4 py-3 text-sm font-medium shadow-sm',
        'min-h-[44px]',
        variantStyles[variant],
        className,
      ].join(' ')}
      {...props}
    >
      <span aria-hidden="true" className="text-base">
        {icons[variant]}
      </span>
      <span className="flex-1">{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-2 p-1 rounded hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current min-h-[44px] min-w-[44px] inline-flex items-center justify-center"
          aria-label="Cerrar notificación"
        >
          ✕
        </button>
      )}
    </div>
  );
}
