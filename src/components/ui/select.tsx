import React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils/formatters';

export interface SelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leadingIcon?: React.ReactNode;
  required?: boolean;
  options?: SelectOption[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, helperText, leadingIcon, required, options, children, id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-semibold text-zinc-700 dark:text-zinc-200"
          >
            {label}
            {required && <span className="text-rose-500 ml-0.5">*</span>}
          </label>
        )}
        <div className="relative flex items-center group">
          {leadingIcon && (
            <div className="absolute left-3.5 flex items-center pointer-events-none text-zinc-400 group-focus-within:text-amber-500 dark:text-zinc-500 transition-colors">
              {leadingIcon}
            </div>
          )}
          <select
            id={selectId}
            ref={ref}
            className={cn(
              'w-full appearance-none rounded-xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-950 pl-3.5 pr-10 py-2.5 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 hover:border-zinc-300 dark:hover:border-zinc-700 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 dark:focus:border-amber-500 dark:focus:ring-amber-500/20 transition-all shadow-xs cursor-pointer',
              leadingIcon && 'pl-10',
              error && 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20',
              className
            )}
            {...props}
          >
            {options
              ? options.map((opt) => (
                <option
                  key={opt.value}
                  value={opt.value}
                  disabled={opt.disabled}
                  className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                >
                  {opt.label}
                </option>
              ))
              : children}
          </select>
          <div className="absolute right-3.5 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500 group-focus-within:text-amber-500 transition-colors">
            <ChevronDown className="h-4 w-4" />
          </div>
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

Select.displayName = 'Select';
