'use client';

import React, { useState, useEffect } from 'react';
import { cn, formatNumberDots, parseNumberFromDots, formatRupiah, terbilang } from '@/lib/utils/formatters';
import { X, Sparkles } from 'lucide-react';

export interface RupiahInputProps {
  label?: string;
  value: number | string;
  onChange: (value: number, rawString: string) => void;
  error?: string;
  helperText?: string;
  placeholder?: string;
  required?: boolean;
  id?: string;
  className?: string;
  disabled?: boolean;
  showTerbilang?: boolean;
  quickAmounts?: number[];
}

export const RupiahInput = React.forwardRef<HTMLInputElement, RupiahInputProps>(
  (
    {
      label,
      value,
      onChange,
      error,
      helperText,
      placeholder = '0',
      required,
      id,
      className,
      disabled = false,
      showTerbilang = true,
      quickAmounts,
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    // Synchronize local display state with value prop
    const [displayVal, setDisplayVal] = useState<string>(() => {
      if (value === 0 || value === '0') return '';
      return formatNumberDots(value);
    });

    useEffect(() => {
      const formatted = formatNumberDots(value);
      setDisplayVal(formatted);
    }, [value]);

    const numericValue = parseNumberFromDots(displayVal);
    const terbilangText = terbilang(numericValue);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawInput = e.target.value;
      const cleanDigits = rawInput.replace(/\D/g, '');
      const num = cleanDigits ? parseInt(cleanDigits, 10) : 0;
      const formatted = formatNumberDots(cleanDigits);

      setDisplayVal(formatted);
      onChange(num, cleanDigits);
    };

    const handleClear = () => {
      setDisplayVal('');
      onChange(0, '');
    };

    const handleQuickAmount = (amount: number) => {
      const newAmount = amount;
      const formatted = formatNumberDots(newAmount);
      setDisplayVal(formatted);
      onChange(newAmount, String(newAmount));
    };

    return (
      <div className="w-full space-y-1">
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
          {/* Prefix "Rp" */}
          <div className="absolute left-3 flex items-center pointer-events-none text-xs font-bold text-zinc-500 dark:text-zinc-400 select-none">
            Rp
          </div>

          <input
            id={inputId}
            ref={ref}
            type="text"
            inputMode="numeric"
            disabled={disabled}
            placeholder={placeholder}
            value={displayVal}
            onChange={handleChange}
            className={cn(
              'w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 pl-9 pr-14 py-2 text-xs sm:text-sm font-mono font-bold text-zinc-950 dark:text-zinc-50 placeholder:text-zinc-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 dark:focus:border-amber-500 dark:focus:ring-amber-500 transition-colors shadow-xs',
              error && 'border-rose-500 focus:border-rose-500 focus:ring-rose-500 dark:border-rose-500',
              disabled && 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed',
              className
            )}
          />

          {/* Suffix / Clear button */}
          <div className="absolute right-3 flex items-center gap-1.5">
            {displayVal && !disabled && (
              <button
                type="button"
                onClick={handleClear}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-0.5 rounded-lg transition-colors cursor-pointer"
                title="Hapus nominal"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
            <span className="text-[11px] font-semibold text-zinc-400 pointer-events-none select-none">
              IDR
            </span>
          </div>
        </div>

        {/* Live Tulisan Rupiah & Terbilang Otomatis */}
        {showTerbilang && numericValue > 0 && (
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 text-xs transition-all animate-in fade-in duration-150">
            <span className="font-mono font-bold text-amber-700 dark:text-amber-400 shrink-0">
              {formatRupiah(numericValue)}
            </span>
            <span className="text-zinc-300 dark:text-zinc-700">•</span>
            <span className="italic text-[11px] text-zinc-700 dark:text-zinc-300 font-medium truncate">
              {terbilangText}
            </span>
          </div>
        )}

        {/* Quick Amount Chips */}
        {quickAmounts && quickAmounts.length > 0 && !disabled && (
          <div className="flex gap-1.5 pt-1 overflow-x-auto pb-0.5 text-xs">
            {quickAmounts.map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => handleQuickAmount(val)}
                className="px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-700/80 bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-amber-500/10 hover:border-amber-500/40 hover:text-amber-700 dark:hover:text-amber-400 font-mono text-[11px] font-semibold transition-colors shrink-0 cursor-pointer"
              >
                +{formatRupiah(val)}
              </button>
            ))}
          </div>
        )}

        {/* Error / Helper text */}
        {error && (
          <p className="text-[11px] sm:text-xs font-medium text-rose-600 dark:text-rose-400 mt-1">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

RupiahInput.displayName = 'RupiahInput';
