'use client';

import React from 'react';
import { useDompetKu } from '@/lib/store';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils/formatters';

export function ToastContainer() {
  const { toasts, removeToast } = useDompetKu();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-16 sm:bottom-5 right-4 sm:right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            role="alert"
            className={cn(
              'pointer-events-auto flex items-start gap-2.5 p-3 rounded-lg shadow-lg border backdrop-blur-xs transition-all animate-in fade-in slide-in-from-bottom-2',
              isSuccess &&
                'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border-emerald-500/40 ring-1 ring-emerald-500/20',
              isError &&
                'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border-rose-500/40 ring-1 ring-rose-500/20',
              !isSuccess &&
                !isError &&
                'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border-zinc-200 dark:border-zinc-800 ring-1 ring-zinc-950/5'
            )}
          >
            <div className="shrink-0 mt-0.5">
              {isSuccess && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
              {isError && <AlertCircle className="h-4 w-4 text-rose-500" />}
              {!isSuccess && !isError && <Info className="h-4 w-4 text-amber-500" />}
            </div>
            <div className="flex-1 text-xs font-medium whitespace-pre-line leading-relaxed">
              {toast.message}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              aria-label="Tutup notifikasi"
              className="shrink-0 rounded p-0.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
