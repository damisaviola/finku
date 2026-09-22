'use client';

import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import { formatRupiah } from '@/lib/utils/formatters';

interface CategoryPieData {
  name: string;
  value: number;
  color: string;
}

interface CategoryPieChartProps {
  data: CategoryPieData[];
}

export function CategoryPieChart({ data }: CategoryPieChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (data.length === 0 || total === 0) {
    return (
      <div className="w-full h-64 flex flex-col items-center justify-center text-zinc-400 text-xs">
        <p>Belum ada data pengeluaran.</p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col sm:flex-row items-center gap-4">
      <div className="w-full sm:w-1/2 h-52 sm:h-60 relative flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload as CategoryPieData;
                  const pct = ((item.value / total) * 100).toFixed(1);
                  return (
                    <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-2 shadow-lg text-xs space-y-1">
                      <div className="flex items-center gap-1.5 font-semibold text-zinc-900 dark:text-white">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        {item.name}
                      </div>
                      <p className="font-mono text-zinc-600 dark:text-zinc-300 font-bold">
                        {formatRupiah(item.value)} ({pct}%)
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={52}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color || '#a1a1aa'} stroke="none" />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
          <span className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">Total</span>
          <span className="text-xs font-bold font-mono text-zinc-900 dark:text-white">
            {formatRupiah(total)}
          </span>
        </div>
      </div>

      {/* Legend list */}
      <div className="w-full sm:w-1/2 space-y-1.5 max-h-52 overflow-y-auto pr-1">
        {data.map((item, idx) => {
          const pct = ((item.value / total) * 100).toFixed(1);
          return (
            <div
              key={idx}
              className="flex items-center justify-between text-xs p-1.5 rounded hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: item.color || '#a1a1aa' }}
                />
                <span className="font-medium text-zinc-700 dark:text-zinc-300 truncate text-[11px]">
                  {item.name}
                </span>
              </div>
              <div className="flex items-center gap-2 text-right shrink-0">
                <span className="font-mono font-bold text-zinc-900 dark:text-white text-[11px]">
                  {formatRupiah(item.value)}
                </span>
                <span className="text-[10px] font-mono text-zinc-400 w-8 text-right">
                  {pct}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
