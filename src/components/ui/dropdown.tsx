'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils/formatters';

export interface DropdownOption<T extends string | number = string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
  dotColor?: string; // hex or Tailwind color class for status indicator
  description?: string;
  disabled?: boolean;
}

export interface DropdownSelectProps<T extends string | number = string> {
  value: T;
  onChange: (value: T) => void;
  options: DropdownOption<T>[];
  placeholder?: string;
  leadingIcon?: React.ReactNode;
  className?: string;
  align?: 'left' | 'right';
  size?: 'sm' | 'md';
  label?: string;
}

/**
 * DropdownSelect: Dropdown pemilih nilai kustom yang modern dan responsif
 * Dilengkapi animasi halus, indikator warna status, ikon, dan checkmark.
 */
export function DropdownSelect<T extends string | number = string>({
  value,
  onChange,
  options,
  placeholder = 'Pilih salah satu...',
  leadingIcon,
  className,
  align = 'left',
  size = 'md',
  label,
}: DropdownSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Tutup dropdown saat klik di luar komponen
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (opt: DropdownOption<T>) => {
    if (opt.disabled) return;
    onChange(opt.value);
    setIsOpen(false);
  };

  return (
    <div className={cn('relative w-full', className)} ref={containerRef}>
      {label && (
        <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-200 mb-1.5">
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={cn(
          'w-full flex items-center justify-between gap-2.5 rounded-xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 text-zinc-900 dark:text-zinc-100 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-150 cursor-pointer',
          size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-3.5 py-2 text-xs sm:text-sm',
          isOpen && 'border-amber-500 ring-2 ring-amber-500/15 dark:border-amber-500'
        )}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1 truncate">
          {leadingIcon && (
            <span className="shrink-0 text-zinc-400 dark:text-zinc-500">{leadingIcon}</span>
          )}

          {selectedOption?.dotColor && (
            <span
              className="h-2 w-2 rounded-full shrink-0 ring-2 ring-white dark:ring-zinc-900"
              style={{ backgroundColor: selectedOption.dotColor }}
            />
          )}

          {selectedOption?.icon && (
            <span className="shrink-0 text-zinc-500 dark:text-zinc-400">{selectedOption.icon}</span>
          )}

          <span className="truncate font-medium text-zinc-800 dark:text-zinc-200">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 ml-1">
          {selectedOption?.badge && (
            <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
              {selectedOption.badge}
            </span>
          )}
          <ChevronDown
            className={cn(
              'h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500 transition-transform duration-200',
              isOpen && 'rotate-180 text-amber-500 dark:text-amber-400'
            )}
          />
        </div>
      </button>

      {/* Floating Menu List */}
      {isOpen && (
        <div
          role="listbox"
          className={cn(
            'absolute z-50 mt-1.5 max-h-64 w-full min-w-[200px] overflow-auto rounded-2xl border border-zinc-200/90 dark:border-zinc-800/90 bg-white/95 dark:bg-zinc-900/95 p-1.5 shadow-xl ring-1 ring-zinc-950/5 dark:ring-white/5 backdrop-blur-md transition-all duration-150 animate-in fade-in zoom-in-95',
            align === 'right' ? 'right-0' : 'left-0'
          )}
        >
          {options.map((opt) => {
            const isSelected = opt.value === value;

            return (
              <button
                key={String(opt.value)}
                type="button"
                role="option"
                aria-selected={isSelected}
                disabled={opt.disabled}
                onClick={() => handleSelect(opt)}
                className={cn(
                  'w-full flex items-center justify-between gap-2.5 rounded-xl px-2.5 py-2 text-xs transition-colors cursor-pointer text-left',
                  isSelected
                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold'
                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/70',
                  opt.disabled && 'opacity-40 cursor-not-allowed'
                )}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1 truncate">
                  {opt.dotColor && (
                    <span
                      className="h-2 w-2 rounded-full shrink-0 ring-2 ring-white dark:ring-zinc-900"
                      style={{ backgroundColor: opt.dotColor }}
                    />
                  )}

                  {opt.icon && (
                    <span
                      className={cn(
                        'shrink-0',
                        isSelected
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-zinc-400 dark:text-zinc-500'
                      )}
                    >
                      {opt.icon}
                    </span>
                  )}

                  <div className="truncate">
                    <div className="truncate">{opt.label}</div>
                    {opt.description && (
                      <div className="text-[10px] text-zinc-400 dark:text-zinc-500 font-normal">
                        {opt.description}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {opt.badge && (
                    <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
                      {opt.badge}
                    </span>
                  )}
                  {isSelected && (
                    <Check className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export interface DropdownMenuProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: 'left' | 'right';
  className?: string;
  width?: string;
}

/**
 * DropdownMenu: Menu popup aksi mengambang (Floating Action Menu)
 * Cocok untuk tombol aksi "Titik Tiga" (...) pada baris tabel.
 */
export function DropdownMenu({
  trigger,
  children,
  align = 'right',
  className,
  width = 'w-48',
}: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <div onClick={() => setIsOpen((prev) => !prev)} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className={cn(
            'absolute z-50 mt-1.5 rounded-2xl border border-zinc-200/90 dark:border-zinc-800/90 bg-white/95 dark:bg-zinc-900/95 p-1.5 shadow-xl ring-1 ring-zinc-950/5 dark:ring-white/5 backdrop-blur-md transition-all duration-150 animate-in fade-in zoom-in-95',
            width,
            align === 'right' ? 'right-0' : 'left-0',
            className
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export interface DropdownMenuItemProps {
  icon?: React.ReactNode;
  label: React.ReactNode;
  description?: string;
  badge?: React.ReactNode;
  onClick?: () => void;
  variant?: 'default' | 'danger' | 'success';
  disabled?: boolean;
}

export function DropdownMenuItem({
  icon,
  label,
  description,
  badge,
  onClick,
  variant = 'default',
  disabled = false,
}: DropdownMenuItemProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'w-full flex items-center justify-between gap-2.5 rounded-xl px-2.5 py-2 text-xs transition-colors cursor-pointer text-left',
        variant === 'default' &&
          'text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/80',
        variant === 'danger' &&
          'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40',
        variant === 'success' &&
          'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40',
        disabled && 'opacity-40 cursor-not-allowed'
      )}
    >
      <div className="flex items-center gap-2 min-w-0 flex-1 truncate">
        {icon && (
          <span
            className={cn(
              'shrink-0',
              variant === 'danger'
                ? 'text-rose-500'
                : variant === 'success'
                ? 'text-emerald-500'
                : 'text-zinc-400 dark:text-zinc-500'
            )}
          >
            {icon}
          </span>
        )}
        <div className="truncate">
          <div className="truncate font-medium">{label}</div>
          {description && (
            <div className="text-[10px] text-zinc-400 dark:text-zinc-500">{description}</div>
          )}
        </div>
      </div>

      {badge && <div className="shrink-0">{badge}</div>}
    </button>
  );
}

export function DropdownMenuSeparator() {
  return <div className="my-1 border-t border-zinc-100 dark:border-zinc-800/80" />;
}

export function DropdownMenuLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase text-zinc-400 dark:text-zinc-500">
      {children}
    </div>
  );
}
