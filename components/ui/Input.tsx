'use client';

import { InputHTMLAttributes, SelectHTMLAttributes, forwardRef, useId } from 'react';

type InputType = 'text' | 'email' | 'tel' | 'select';

interface BaseInputProps {
  label: string;
  error?: string;
  required?: boolean;
  className?: string;
}

interface TextInputProps
  extends BaseInputProps,
    Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'className'> {
  type?: Exclude<InputType, 'select'>;
  options?: never;
}

interface SelectInputProps
  extends BaseInputProps,
    Omit<SelectHTMLAttributes<HTMLSelectElement>, 'className'> {
  type: 'select';
  options: { value: string; label: string }[];
}

export type InputProps = TextInputProps | SelectInputProps;

export const Input = forwardRef<
  HTMLInputElement | HTMLSelectElement,
  InputProps
>((props, ref) => {
  const generatedId = useId();
  const { label, error, required, className = '', type = 'text', ...rest } = props;
  const inputId = generatedId;
  const errorId = `${inputId}-error`;

  const baseInputStyles = [
    'w-full rounded-lg border px-4 py-2.5 text-alfa-text transition-colors min-h-[44px]',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-alfa-green',
    error
      ? 'border-alfa-error focus-visible:ring-alfa-error'
      : 'border-gray-300 hover:border-alfa-navy/40',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    className,
  ].join(' ');

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-medium text-alfa-text">
        {label}
        {required && (
          <span className="text-alfa-error ml-1" aria-hidden="true">
            *
          </span>
        )}
      </label>

      {type === 'select' ? (
        <select
          ref={ref as React.Ref<HTMLSelectElement>}
          id={inputId}
          className={baseInputStyles}
          aria-describedby={error ? errorId : undefined}
          aria-invalid={error ? true : undefined}
          aria-required={required}
          {...(rest as Omit<SelectHTMLAttributes<HTMLSelectElement>, 'className'>)}
        >
          <option value="">Seleccionar...</option>
          {(props as SelectInputProps).options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          ref={ref as React.Ref<HTMLInputElement>}
          id={inputId}
          type={type}
          className={baseInputStyles}
          aria-describedby={error ? errorId : undefined}
          aria-invalid={error ? true : undefined}
          aria-required={required}
          {...(rest as Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'className'>)}
        />
      )}

      {error && (
        <p id={errorId} className="text-xs text-alfa-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
