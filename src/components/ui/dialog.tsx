'use client';

import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils/formatters';

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  iconVariant?: 'amber' | 'emerald' | 'blue' | 'rose' | 'zinc';
  badge?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Dialog({
  isOpen,
  onClose,
  title,
  description,
  icon,
  iconVariant = 'amber',
  badge,
  children,
  maxWidth = 'md',
}: DialogProps) {
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [touchCurrentY, setTouchCurrentY] = useState<number | null>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Touch gesture handlers for mobile swipe-down to dismiss
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartY(e.touches[0].clientY);
    setTouchCurrentY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY === null) return;
    const currentY = e.touches[0].clientY;
    // Only allow downward drag
    if (currentY >= touchStartY) {
      setTouchCurrentY(currentY);
    }
  };

  const handleTouchEnd = () => {
    if (touchStartY !== null && touchCurrentY !== null) {
      const deltaY = touchCurrentY - touchStartY;
      if (deltaY > 90) {
        // Dragged down more than 90px -> dismiss
        onClose();
      }
    }
    setTouchStartY(null);
    setTouchCurrentY(null);
  };

  if (!isOpen) return null;

  const dragOffset =
    touchStartY !== null && touchCurrentY !== null && touchCurrentY > touchStartY
      ? touchCurrentY - touchStartY
      : 0;

  const maxWidthClasses = {
    sm: 'sm:max-w-sm',
    md: 'sm:max-w-lg',
    lg: 'sm:max-w-2xl',
    xl: 'sm:max-w-4xl',
  };

  const iconStyles = {
    amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    rose: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    zinc: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop with progressive blur and dark tint */}
      <div
        className="fixed inset-0 bg-zinc-950/60 dark:bg-zinc-950/75 backdrop-blur-[3px] transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal / Bottom Sheet Window */}
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        style={{
          transform: dragOffset > 0 ? `translateY(${dragOffset}px)` : undefined,
          transition: touchStartY === null ? 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)' : 'none',
        }}
        className={cn(
          'relative w-full z-10 flex flex-col',
          // Mobile Native Bottom Sheet / Desktop Elevated Window:
          'rounded-t-[28px] sm:rounded-2xl bg-white dark:bg-zinc-900 border-t sm:border border-zinc-200/90 dark:border-zinc-800 shadow-2xl ring-1 ring-zinc-950/5 dark:ring-white/10 overflow-hidden max-h-[88vh] sm:max-h-[90vh]',
          // Mobile slide-up animation / Desktop zoom-in:
          'animate-in fade-in slide-in-from-bottom-12 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200 ease-out',
          maxWidthClasses[maxWidth]
        )}
      >
        {/* Subtle Top Accent Hairline Glow */}
        <div className="hidden sm:block h-[2px] w-full bg-gradient-to-r from-transparent via-amber-500/50 to-transparent shrink-0" />

        {/* Native Mobile Drag Handle Bar */}
        <div
          className="sm:hidden pt-3 pb-1.5 flex justify-center w-full cursor-grab active:cursor-grabbing select-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="w-11 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700/80" />
        </div>

        {/* Modal Header */}
        <div
          className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/80 px-5 sm:px-6 py-3.5 sm:py-4 bg-zinc-50/60 dark:bg-zinc-900/60 backdrop-blur-xs select-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="flex items-center gap-3 min-w-0 pr-3">
            {icon && (
              <div
                className={cn(
                  'h-10 w-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs border transition-transform',
                  iconStyles[iconVariant]
                )}
              >
                {icon}
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                {title && (
                  <h2 className="text-base sm:text-lg font-bold tracking-tight text-zinc-950 dark:text-white truncate">
                    {title}
                  </h2>
                )}
                {badge && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 shrink-0">
                    {badge}
                  </span>
                )}
              </div>
              {description && (
                <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
                  {description}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="hidden sm:inline-block text-[10px] font-mono text-zinc-400 dark:text-zinc-500 px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-800/80 select-none">
              ESC
            </span>
            <button
              onClick={onClose}
              type="button"
              aria-label="Tutup dialog"
              className="rounded-xl p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 active:scale-95 transition-all cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Body with Native Touch Scrolling */}
        <div className="overflow-y-auto overscroll-contain px-5 sm:px-6 py-4 sm:py-5 flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}

export function DialogFooter({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-end gap-2.5 pt-4 border-t border-zinc-100 dark:border-zinc-800/80 -mx-5 sm:-mx-6 -mb-4 sm:-mb-5 px-5 sm:px-6 py-3.5 pb-[max(env(safe-area-inset-bottom),1rem)] sm:pb-4 bg-zinc-50/50 dark:bg-zinc-900/50',
        className
      )}
    >
      {children}
    </div>
  );
}
