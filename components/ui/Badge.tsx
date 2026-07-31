import { HTMLAttributes } from 'react';

type BadgeVariant = 'status' | 'info' | 'warning' | 'error';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, string> = {
  status: 'bg-alfa-green/10 text-alfa-green border-alfa-green/20',
  info: 'bg-blue-50 text-blue-700 border-blue-200',
  warning: 'bg-alfa-gold/10 text-alfa-gold border-alfa-gold/20',
  error: 'bg-alfa-error/10 text-alfa-error border-alfa-error/20',
};

export function Badge({
  variant = 'info',
  className = '',
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        variantStyles[variant],
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </span>
  );
}
