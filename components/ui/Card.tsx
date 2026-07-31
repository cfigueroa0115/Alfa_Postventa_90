import { HTMLAttributes } from 'react';

type CardVariant = 'default' | 'elevated' | 'bordered';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
}

const variantStyles: Record<CardVariant, string> = {
  default: 'bg-alfa-surface',
  elevated: 'bg-alfa-surface shadow-lg',
  bordered: 'bg-alfa-surface border border-gray-200',
};

export function Card({
  variant = 'default',
  className = '',
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={[
        'rounded-lg p-6',
        variantStyles[variant],
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </div>
  );
}
