'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Percent,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  RotateCcw,
  FileText,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useDompetKu } from '@/lib/store';
import { calculateMonthlySummary } from '@/lib/calculations/finance';
import { formatRupiah, formatBulan } from '@/lib/utils/formatters';
import { IncomeExpenseChart } from '@/components/charts/income-expense-chart';
import { CategoryPieChart } from '@/components/charts/category-pie-chart';

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

function getPrevMonthKey(monthKey: string): string {
  if (!monthKey || !monthKey.includes('-')) return '2026-08';
  const [yearStr, monthStr] = monthKey.split('-');
  let year = parseInt(yearStr, 10);
  let month = parseInt(monthStr, 10) - 1;
  if (month < 1) {
    month = 12;
    year -= 1;
  }
  return `${year}-${String(month).padStart(2, '0')}`;
}

function getNextMonthKey(monthKey: string): string {
  if (!monthKey || !monthKey.includes('-')) return '2026-10';
  const [yearStr, monthStr] = monthKey.split('-');
  let year = parseInt(yearStr, 10);
  let month = parseInt(monthStr, 10) + 1;
  if (month > 12) {
    month = 1;
    year += 1;
  }
  return `${year}-${String(month).padStart(2, '0')}`;
}

export default function ReportsPage() {
  const { transactions, categories, activeMonth } = useDompetKu();
  const currentDefaultMonth = activeMonth || '2026-09';
  const [period, setPeriod] = useState<string>(currentDefaultMonth);

  // Kumpulkan seluruh bulan unik yang ada di transaksi dan bulan 2026
  const monthOptions = useMemo(() => {
    const monthsSet = new Set<string>();
    
    // Tambahkan 12 bulan untuk 2026
    for (let m = 12; m >= 1; m--) {
      monthsSet.add(`2026-${String(m).padStart(2, '0')}`);
    }

    // Tambahkan bulan dari data transaksi jika ada
    transactions.forEach((t) => {
      if (t.date && t.date.length >= 7) {
        monthsSet.add(t.date.substring(0, 7));
      }
    });

    return Array.from(monthsSet)
      .sort((a, b) => b.localeCompare(a))
      .map((key) => {
        const isCurrent = key === currentDefaultMonth;
        return {
          value: key,
          label: `${formatBulan(key)}${isCurrent ? ' (Bulan Ini)' : ''}`,
        };
      });
  }, [transactions, currentDefaultMonth]);

  const isCumulative = period === 'year-2026' || period === 'all';

  const handlePrevMonth = () => {
    if (isCumulative) {
      setPeriod(currentDefaultMonth);
      return;
    }
    setPeriod((prev) => getPrevMonthKey(prev));
  };

  const handleNextMonth = () => {
    if (isCumulative) {
      setPeriod(currentDefaultMonth);
      return;
    }
    setPeriod((prev) => getNextMonthKey(prev));
  };

  // Filter transaksi berdasarkan periode yang dipilih
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (period === 'all') return true;
      if (period === 'year-2026') return t.date.startsWith('2026');
      return t.date.startsWith(period);
    });
  }, [transactions, period]);

  const periodLabel = useMemo(() => {
    if (period === 'all') return 'Semua Periode';
    if (period === 'year-2026') return 'Sepanjang Tahun 2026';
    return formatBulan(period);
  }, [period]);

  // Kalkulasi total
  let totalIncome = 0;
  let totalExpense = 0;
  filteredTransactions.forEach((t) => {
    if (t.type === 'income') totalIncome += t.amount;
    if (t.type === 'expense') totalExpense += t.amount;
  });

  const totalSavings = totalIncome - totalExpense;
  const savingsRate =
    totalIncome > 0 ? Math.max(0, ((totalIncome - totalExpense) / totalIncome) * 100) : 0;

  // Distribusi Pengeluaran
  const categoryBreakdown = useMemo(() => {
    const categoryMap = new Map<string, number>();
    filteredTransactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        if (t.category_id) {
          const prev = categoryMap.get(t.category_id) || 0;
          categoryMap.set(t.category_id, prev + t.amount);
        }
      });

    return Array.from(categoryMap.entries())
      .map(([catId, amount]) => {
        const cat = categories.find((c) => c.id === catId);
        return {
          id: catId,
          name: cat ? cat.name : 'Lainnya',
          amount,
          color: cat?.color || '#a1a1aa',
          percentage: totalExpense > 0 ? (amount / totalExpense) * 100 : 0,
        };
      })
      .sort((a, b) => b.amount - a.amount);
  }, [filteredTransactions, categories, totalExpense]);

  const pieChartData = useMemo(() => {
    return categoryBreakdown.map((item) => ({
      name: item.name,
      value: item.amount,
      color: item.color,
    }));
  }, [categoryBreakdown]);

  // Data Perbandingan Arus Kas
  const comparisonChartData = useMemo(() => {
    if (period === 'year-2026') {
      return ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'].map(
        (mStr, idx) => {
          const mKey = `2026-${mStr}`;
          const s = calculateMonthlySummary(transactions, mKey);
          return {
            name: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'][idx],
            pemasukan: s.income,
            pengeluaran: s.expense,
          };
        }
      );
    }

    if (period === 'all') {
      return ['2026-07', '2026-08', '2026-09'].map((mKey) => {
        const s = calculateMonthlySummary(transactions, mKey);
        return {
          name: formatBulan(mKey),
          pemasukan: s.income,
          pengeluaran: s.expense,
        };
      });
    }

    // Default: Bandingkan bulan sebelumnya vs bulan terpilih
    const prevMonthKey = getPrevMonthKey(period);
    const prevSummary = calculateMonthlySummary(transactions, prevMonthKey);
    const currentSummary = calculateMonthlySummary(transactions, period);

    return [
      {
        name: formatBulan(prevMonthKey),
        pemasukan: prevSummary.income,
        pengeluaran: prevSummary.expense,
      },
      {
        name: formatBulan(period),
        pemasukan: currentSummary.income,
        pengeluaran: currentSummary.expense,
      },
    ];
  }, [transactions, period]);

  return (
    <div className="space-y-5">
      {/* Filament Page Header & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-200/80 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl font-bold tracking-tight text-zinc-950 dark:text-white">
              Laporan Keuangan
            </h2>
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
              {periodLabel}
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Evaluasi menyeluruh arus kas, rasio simpanan, dan rincian belanja per bulan.
          </p>
        </div>

        {/* Toolbar Navigasi & Filter Bulan (Filament Style) */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <div className="inline-flex items-center rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-xs p-1">
            <button
              type="button"
              onClick={handlePrevMonth}
              disabled={isCumulative}
              className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
              title="Bulan Sebelumnya"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="relative flex items-center">
              <Calendar className="absolute left-2.5 h-3.5 w-3.5 text-amber-500 pointer-events-none" />
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="pl-8 pr-7 py-1 text-xs font-semibold text-zinc-900 dark:text-zinc-100 bg-transparent border-0 focus:outline-none focus:ring-0 cursor-pointer appearance-none"
              >
                <optgroup label="Pilihan Bulan">
                  {monthOptions.map((m) => (
                    <option
                      key={m.value}
                      value={m.value}
                      className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                    >
                      {m.label}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Periode Lainnya">
                  <option
                    value="year-2026"
                    className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                  >
                    Sepanjang Tahun 2026
                  </option>
                  <option
                    value="all"
                    className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                  >
                    Semua Riwayat (Akumulasi)
                  </option>
                </optgroup>
              </select>
              <ChevronDown className="absolute right-2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              disabled={isCumulative}
              className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
              title="Bulan Berikutnya"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Tombol Cepat Kembali ke Bulan Berjalan */}
          {period !== currentDefaultMonth && (
            <button
              type="button"
              onClick={() => setPeriod(currentDefaultMonth)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20 transition-colors cursor-pointer"
              title="Kembali ke Bulan Berjalan"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Bulan Ini</span>
            </button>
          )}

          {/* Akses Rekening Koran & Unduh PDF */}
          <Link
            href={`/statement${period.match(/^\d{4}-\d{2}$/) ? `?month=${period}` : ''}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:border-amber-500/50 shadow-xs transition-colors"
            title="Buka & Cetak Rekening Koran PDF"
          >
            <FileText className="h-3.5 w-3.5 text-amber-500" />
            <span>Rekening Koran</span>
          </Link>
        </div>
      </div>

      {/* Filament Stats Overview (2x2 pada Layar Ponsel, 4 Kolom pada Desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Pemasukan */}
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3.5 sm:p-4 shadow-xs ring-1 ring-zinc-950/5 dark:ring-white/5 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Total Pemasukan
            </span>
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="h-3.5 w-3.5" />
            </span>
          </div>
          <div className="text-base sm:text-xl lg:text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 truncate">
            {formatRupiah(totalIncome)}
          </div>
          <p className="text-[10px] sm:text-[11px] text-zinc-400 truncate">
            {periodLabel}
          </p>
        </div>

        {/* Total Pengeluaran */}
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3.5 sm:p-4 shadow-xs ring-1 ring-zinc-950/5 dark:ring-white/5 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Total Pengeluaran
            </span>
            <span className="p-1.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <TrendingDown className="h-3.5 w-3.5" />
            </span>
          </div>
          <div className="text-base sm:text-xl lg:text-2xl font-bold font-mono text-rose-600 dark:text-rose-400 truncate">
            {formatRupiah(totalExpense)}
          </div>
          <p className="text-[10px] sm:text-[11px] text-zinc-400 truncate">
            {periodLabel}
          </p>
        </div>

        {/* Tabungan Bersih */}
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3.5 sm:p-4 shadow-xs ring-1 ring-zinc-950/5 dark:ring-white/5 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Tabungan Bersih
            </span>
            <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <PiggyBank className="h-3.5 w-3.5" />
            </span>
          </div>
          <div
            className={`text-base sm:text-xl lg:text-2xl font-bold font-mono truncate ${
              totalSavings >= 0
                ? 'text-zinc-950 dark:text-white'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {formatRupiah(totalSavings)}
          </div>
          <p className="text-[10px] sm:text-[11px] text-zinc-400 truncate">
            Pemasukan - Pengeluaran
          </p>
        </div>

        {/* Rasio Tabungan */}
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3.5 sm:p-4 shadow-xs ring-1 ring-zinc-950/5 dark:ring-white/5 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Rasio Tabungan
            </span>
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Percent className="h-3.5 w-3.5" />
            </span>
          </div>
          <div className="text-base sm:text-xl lg:text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">
            {savingsRate.toFixed(1)}%
          </div>
          {/* Progress bar visual rasio tabungan */}
          <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-amber-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, Math.max(0, savingsRate))}%` }}
            />
          </div>
        </div>
      </div>

      {/* Filament Charts Widgets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <Card className="lg:col-span-7">
          <CardHeader>
            <CardTitle>Perbandingan Arus Kas</CardTitle>
            <CardDescription>
              {period === 'year-2026'
                ? 'Tren arus kas bulanan sepanjang tahun 2026.'
                : period === 'all'
                ? 'Arus kas kumulatif seluruh riwayat transaksi.'
                : `Perbandingan nominal pemasukan dan pengeluaran ${periodLabel} dengan bulan sebelumnya.`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <IncomeExpenseChart data={comparisonChartData} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-5">
          <CardHeader>
            <CardTitle>Distribusi Pengeluaran</CardTitle>
            <CardDescription>
              Proporsi alokasi belanja periode {periodLabel}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CategoryPieChart data={pieChartData} />
          </CardContent>
        </Card>
      </div>

      {/* Filament Table Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Rincian Pengeluaran Menurut Kategori</CardTitle>
          <CardDescription>
            Peringkat pos pengeluaran dari nominal terbesar untuk {periodLabel}.
          </CardDescription>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="px-5 py-3">Pos Kategori</th>
                <th className="px-5 py-3 text-right">Nominal Realisasi</th>
                <th className="px-5 py-3 text-right">Persentase</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
              {categoryBreakdown.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-5 py-8 text-center text-zinc-400 text-xs">
                    Tidak ada catatan pengeluaran pada periode {periodLabel}.
                  </td>
                </tr>
              ) : (
                categoryBreakdown.map((item) => (
                  <tr key={item.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                    <td className="px-5 py-3 flex items-center gap-2.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="font-semibold text-zinc-950 dark:text-white">
                        {item.name}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right font-mono font-bold text-zinc-950 dark:text-white">
                      {formatRupiah(item.amount)}
                    </td>
                    <td className="px-5 py-3 text-right font-mono text-zinc-500">
                      {item.percentage.toFixed(1)}%
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

