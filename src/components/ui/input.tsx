import React from 'react';
import { cn } from '@/lib/utils/formatters';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leadingIcon?: React.ReactNode;
  trailingText?: string;
  trailingAction?: React.ReactNode;
  required?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      leadingIcon,
      trailingText,
      trailingAction,
      required,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-zinc-700 dark:text-zinc-200"
          >
            {label}
            {required && <span className="text-rose-500 ml-0.5">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          {leadingIcon && (
            <div className="absolute left-3 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500">
              {leadingIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              'w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3.5 py-2 text-xs sm:text-sm text-zinc-950 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 dark:focus:border-amber-500 dark:focus:ring-amber-500 transition-colors shadow-xs',
              leadingIcon && 'pl-9 sm:pl-9.5',
              (trailingText || trailingAction) && 'pr-10 sm:pr-11',
              error && 'border-rose-500 focus:border-rose-500 focus:ring-rose-500 dark:border-rose-500',
              className
            )}
            {...props}
          />
          {trailingAction && (
            <div className="absolute right-2.5 flex items-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
              {trailingAction}
            </div>
          )}
          {trailingText && !trailingAction && (
            <div className="absolute right-3 text-[11px] sm:text-xs font-semibold text-zinc-400 pointer-events-none">
              {trailingText}
            </div>
          )}
        </div>
        {error && (
          <p className="text-[11px] font-medium text-rose-600 dark:text-rose-400 mt-1">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
