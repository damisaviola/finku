'use client';

import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { formatRupiah } from '@/lib/utils/formatters';
import { useDompetKu } from '@/lib/store';

interface IncomeExpenseChartProps {
  data: Array<{
    name: string;
    pemasukan: number;
    pengeluaran: number;
  }>;
}

export function IncomeExpenseChart({ data }: IncomeExpenseChartProps) {
  const { isDarkMode } = useDompetKu();

  return (
    <div className="w-full h-64 sm:h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          barGap={6}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke={isDarkMode ? '#27272a' : '#e4e4e7'}
          />
          <XAxis
            dataKey="name"
            stroke={isDarkMode ? '#71717a' : '#a1a1aa'}
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke={isDarkMode ? '#71717a' : '#a1a1aa'}
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => {
              if (value >= 1000000) return `${(value / 1000000).toFixed(1)}jt`;
              if (value >= 1000) return `${(value / 1000).toFixed(0)}rb`;
              return value;
            }}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-2.5 shadow-lg text-xs space-y-1 min-w-[140px]">
                    <p className="font-semibold text-zinc-900 dark:text-white">{label}</p>
                    {payload.map((entry, index) => (
                      <div
                        key={`tooltip-${index}`}
                        className="flex items-center justify-between gap-3"
                      >
                        <span className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 text-[11px]">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: entry.color }}
                          />
                          {entry.name}:
                        </span>
                        <span className="font-mono font-bold text-zinc-900 dark:text-white">
                          {formatRupiah(Number(entry.value))}
                        </span>
                      </div>
                    ))}
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend
            verticalAlign="top"
            align="right"
            iconType="circle"
            wrapperStyle={{ paddingBottom: '12px', fontSize: '11px' }}
            formatter={(value) => (
              <span className="text-zinc-600 dark:text-zinc-300 font-medium">
                {value}
              </span>
            )}
          />
          <Bar
            dataKey="pemasukan"
            name="Pemasukan"
            fill="#10b981"
            radius={[4, 4, 0, 0]}
            maxBarSize={28}
          />
          <Bar
            dataKey="pengeluaran"
            name="Pengeluaran"
            fill="#f43f5e"
            radius={[4, 4, 0, 0]}
            maxBarSize={28}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
