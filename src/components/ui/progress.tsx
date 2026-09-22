import React from 'react';
import { cn } from '@/lib/utils/formatters';

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0 to 100+
  variant?: 'emerald' | 'amber' | 'rose' | 'sky' | 'indigo' | 'auto';
  showLabel?: boolean;
}

export function ProgressBar({
  value,
  variant = 'auto',
  className,
  showLabel = false,
  ...props
}: ProgressProps) {
  const clampedValue = Math.min(100, Math.max(0, value));

  let resolvedVariant = variant;
  if (variant === 'auto') {
    if (value >= 100) {
      resolvedVariant = 'rose';
    } else if (value >= 80) {
      resolvedVariant = 'amber';
    } else {
      resolvedVariant = 'emerald';
    }
  }

  const barColors = {
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
    sky: 'bg-sky-500',
    indigo: 'bg-indigo-500',
    auto: 'bg-emerald-500',
  };

  return (
    <div className={cn('w-full space-y-1', className)} {...props}>
      <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
        <div
          className={cn('h-full transition-all duration-300 rounded-full', barColors[resolvedVariant])}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between text-xs font-medium font-mono text-zinc-500 dark:text-zinc-400">
          <span>{Math.round(value)}%</span>
        </div>
      )}
    </div>
  );
}
