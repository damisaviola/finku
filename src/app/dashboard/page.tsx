'use client';

import React from 'react';
import Link from 'next/link';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  ArrowRight,
  Plus,
  ArrowLeftRight,
  CreditCard,
  Percent,
  ChevronRight,
  Eye,
  EyeOff,
  HandCoins,
  ArrowDownLeft,
  ArrowUpRight,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useDompetKu } from '@/lib/store';
import {
  calculateAccountBalance,
  calculateTotalBalance,
  calculateMonthlySummary,
} from '@/lib/calculations/finance';
import { formatRupiah, formatTanggal, formatBulan } from '@/lib/utils/formatters';
import { IncomeExpenseChart } from '@/components/charts/income-expense-chart';
import { CategoryPieChart } from '@/components/charts/category-pie-chart';

export default function DashboardPage() {
  const {
    user,
    accounts,
    categories,
    transactions,
    debts,
    activeMonth,
    openTransactionModal,
    isPrivacyMode,
    togglePrivacyMode,
    formatAmount,
    isDataLoading,
  } = useDompetKu();

  const totalBalance = calculateTotalBalance(accounts, transactions);
  const monthlySummary = calculateMonthlySummary(transactions, activeMonth);

  const totalActiveReceivables = debts
    .filter((d) => d.type === 'receivable')
    .reduce((acc, d) => acc + Math.max(0, d.total_amount - d.paid_amount), 0);

  const totalActiveDebts = debts
    .filter((d) => d.type === 'debt')
    .reduce((acc, d) => acc + Math.max(0, d.total_amount - d.paid_amount), 0);

  // Recent transactions (PRD Bagian 17)
  const recentTransactions = transactions.slice(0, 5);

  // Category breakdown for chart (PRD Bagian 18)
  const categoryExpensesMap = new Map<string, number>();
  transactions
    .filter((t) => t.type === 'expense' && t.date.startsWith(activeMonth))
    .forEach((t) => {
      if (t.category_id) {
        const prev = categoryExpensesMap.get(t.category_id) || 0;
        categoryExpensesMap.set(t.category_id, prev + t.amount);
      }
    });

  const categoryPieData = Array.from(categoryExpensesMap.entries()).map(([catId, amount]) => {
    const cat = categories.find((c) => c.id === catId);
    return {
      name: cat ? cat.name : 'Lainnya',
      value: amount,
      color: cat?.color || '#a1a1aa',
    };
  });

  // Monthly comparison data for BarChart (PRD Bagian 18 & 38)
  const currentMonthSummary = calculateMonthlySummary(transactions, '2026-09');
  const lastMonthSummary = calculateMonthlySummary(transactions, '2026-08');

  const chartData = [
    {
      name: 'Agu 2026',
      pemasukan: lastMonthSummary.income,
      pengeluaran: lastMonthSummary.expense,
    },
    {
      name: 'Sep 2026',
      pemasukan: currentMonthSummary.income,
      pengeluaran: currentMonthSummary.expense,
    },
  ];

  if (isDataLoading && accounts.length === 0 && transactions.length === 0) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="h-6 w-48 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
            <div className="h-4 w-72 bg-zinc-100 dark:bg-zinc-800/60 rounded-md" />
          </div>
          <div className="flex gap-2">
            <div className="h-9 w-24 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
            <div className="h-9 w-32 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 space-y-3">
              <div className="h-4 w-20 bg-zinc-200 dark:bg-zinc-800 rounded" />
              <div className="h-6 w-32 bg-zinc-300 dark:bg-zinc-700 rounded" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-72 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800" />
          <div className="h-72 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filament Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-950 dark:text-white">
            Ringkasan Keuangan
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Selamat datang kembali, {user?.name || 'Pengguna'}. Laporan keuangan periode {formatBulan(activeMonth)}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => openTransactionModal('transfer')}
          >
            <ArrowLeftRight className="h-3.5 w-3.5 mr-1" />
            <span>Transfer</span>
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => openTransactionModal('expense')}
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            <span>Catat Transaksi</span>
          </Button>
        </div>
      </div>

      {/* Filament Stats Overview Widgets Grid (PRD Bagian 14 & 15) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Saldo */}
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs ring-1 ring-zinc-950/5 dark:ring-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 font-medium">
            <div className="flex items-center gap-1.5">
              <span>Total Saldo</span>
              <button
                onClick={togglePrivacyMode}
                type="button"
                aria-label={isPrivacyMode ? 'Tampilkan nominal saldo' : 'Sembunyikan nominal saldo (Mode Privasi)'}
                title={isPrivacyMode ? 'Tampilkan Saldo' : 'Sembunyikan Saldo'}
                className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors cursor-pointer"
              >
                {isPrivacyMode ? (
                  <EyeOff className="h-3.5 w-3.5 text-amber-500" />
                ) : (
                  <Eye className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
            <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
              {accounts.filter((a) => a.is_active).length} Rekening
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-zinc-950 dark:text-white tracking-tight">
            {formatAmount(totalBalance)}
          </div>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 pt-1 border-t border-zinc-100 dark:border-zinc-800/80">
            Seluruh saldo rekening aktif saat ini
          </p>
        </div>

        {/* Pemasukan Bulanan */}
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs ring-1 ring-zinc-950/5 dark:ring-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 font-medium">
            <span>Pemasukan</span>
            <Badge variant="success" size="sm">
              <TrendingUp className="h-3 w-3" />
              <span>Arus Masuk</span>
            </Badge>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 tracking-tight">
            +{formatAmount(monthlySummary.income)}
          </div>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 pt-1 border-t border-zinc-100 dark:border-zinc-800/80">
            Total penerimaan bulan {formatBulan(activeMonth)}
          </p>
        </div>

        {/* Pengeluaran Bulanan */}
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs ring-1 ring-zinc-950/5 dark:ring-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 font-medium">
            <span>Pengeluaran</span>
            <Badge variant="danger" size="sm">
              <TrendingDown className="h-3 w-3" />
              <span>Arus Keluar</span>
            </Badge>
          </div>
          <div className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400 tracking-tight">
            -{formatAmount(monthlySummary.expense)}
          </div>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 pt-1 border-t border-zinc-100 dark:border-zinc-800/80">
            Tanpa mutasi transfer antar rekening
          </p>
        </div>

        {/* Tabungan & Rasio */}
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs ring-1 ring-zinc-950/5 dark:ring-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 font-medium">
            <span>Tabungan Bersih</span>
            <Badge variant="primary" size="sm">
              <span>{monthlySummary.savingsRate.toFixed(1)}% Rasio</span>
            </Badge>
          </div>
          <div className="text-2xl font-bold font-mono text-zinc-950 dark:text-white tracking-tight">
            {formatAmount(monthlySummary.savings)}
          </div>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 pt-1 border-t border-zinc-100 dark:border-zinc-800/80">
            Pemasukan dikurangi pengeluaran
          </p>
        </div>
      </div>

      {/* Filament Charts Widgets Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Pemasukan vs Pengeluaran */}
        <Card className="lg:col-span-7">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Arus Kas Bulanan</CardTitle>
              <span className="text-[11px] text-zinc-400 font-mono">Agustus vs September</span>
            </div>
            <CardDescription>
              Perbandingan arus kas masuk dan pengeluaran operasional.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <IncomeExpenseChart data={chartData} />
          </CardContent>
        </Card>

        {/* Pengeluaran Berdasarkan Kategori */}
        <Card className="lg:col-span-5">
          <CardHeader>
            <CardTitle>Distribusi Pengeluaran</CardTitle>
            <CardDescription>
              Proporsi belanja menurut pos kategori transaksi.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CategoryPieChart data={categoryPieData} />
          </CardContent>
        </Card>
      </div>

      {/* Bottom Grid: Rekening & Transaksi Terbaru */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Rekening Saya Widget */}
        <Card className="lg:col-span-5 flex flex-col justify-between">
          <div>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Rekening & Saldo</CardTitle>
                <CardDescription>Daftar rekening aktif Anda</CardDescription>
              </div>
              <Link
                href="/accounts"
                className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-1"
              >
                <span>Kelola</span>
                <ChevronRight className="h-3 w-3" />
              </Link>
            </CardHeader>
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
              {accounts.length === 0 ? (
                <div className="px-5 py-6 text-center text-xs text-zinc-400 dark:text-zinc-500">
                  Belum ada rekening dibuat.
                </div>
              ) : (
                accounts.map((acc) => {
                  const currentBal = calculateAccountBalance(acc, transactions);
                  return (
                    <div
                      key={acc.id}
                      className="px-5 py-3 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="h-8 w-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                          style={{ backgroundColor: acc.color || '#3b82f6' }}
                        >
                          {acc.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-zinc-950 dark:text-white">
                            {acc.name}
                          </p>
                          <p className="text-[11px] text-zinc-400">
                            {acc.type}
                          </p>
                        </div>
                      </div>
                      <div className="text-right font-mono text-xs font-bold text-zinc-950 dark:text-white">
                        {formatAmount(currentBal)}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
          <CardFooter className="justify-between text-xs text-zinc-500">
            <span>Total Aktif: {accounts.length} Rekening</span>
            <span className="font-mono font-bold text-zinc-900 dark:text-white">
              {formatAmount(totalBalance)}
            </span>
          </CardFooter>
        </Card>

        {/* Transaksi Terbaru Widget */}
        <Card className="lg:col-span-7 flex flex-col justify-between">
          <div>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Transaksi Terbaru</CardTitle>
                <CardDescription>5 catatan keuangan terakhir</CardDescription>
              </div>
              <Link
                href="/transactions"
                className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-1"
              >
                <span>Lihat Semua</span>
                <ChevronRight className="h-3 w-3" />
              </Link>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50/80 dark:bg-zinc-800/40 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-800">
                  <tr>
                    <th className="px-5 py-2.5">Tanggal</th>
                    <th className="px-5 py-2.5">Keterangan</th>
                    <th className="px-5 py-2.5">Rekening</th>
                    <th className="px-5 py-2.5 text-right">Jumlah</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                  {recentTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-5 py-8 text-center text-zinc-400 dark:text-zinc-500">
                        Belum ada transaksi tercatat. Mulai catat transaksi pertama Anda!
                      </td>
                    </tr>
                  ) : (
                    recentTransactions.map((t) => {
                      const acc = accounts.find((a) => a.id === t.account_id);
                      const destAcc = t.destination_account_id
                        ? accounts.find((a) => a.id === t.destination_account_id)
                        : null;
                      const cat = categories.find((c) => c.id === t.category_id);

                      return (
                        <tr
                          key={t.id}
                          className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors"
                        >
                          <td className="px-5 py-3 text-zinc-500 font-mono whitespace-nowrap">
                            {formatTanggal(t.date)}
                          </td>
                          <td className="px-5 py-3">
                            <p className="font-semibold text-zinc-950 dark:text-white">
                              {t.description}
                            </p>
                            <p className="text-[10px] text-zinc-400">
                              {t.type === 'transfer' ? 'Transfer' : cat?.name || 'Umum'}
                            </p>
                          </td>
                          <td className="px-5 py-3 text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
                            {t.type === 'transfer'
                              ? `${acc?.name} → ${destAcc?.name}`
                              : acc?.name || '-'}
                          </td>
                          <td className="px-5 py-3 text-right font-mono font-bold whitespace-nowrap">
                            <span
                              className={
                                t.type === 'income'
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : t.type === 'expense'
                                  ? 'text-rose-600 dark:text-rose-400'
                                  : 'text-zinc-700 dark:text-zinc-300'
                              }
                            >
                              {t.type === 'income' && `+${formatAmount(t.amount)}`}
                              {t.type === 'expense' && `-${formatAmount(t.amount)}`}
                              {t.type === 'transfer' && formatAmount(t.amount)}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <CardFooter className="justify-between text-xs text-zinc-500">
            <span>Riwayat tercatat di sistem</span>
            <Link
              href="/transactions"
              className="font-medium text-amber-600 dark:text-amber-400 hover:underline"
            >
              Buka Halaman Transaksi
            </Link>
          </CardFooter>
        </Card>
      </div>

      {/* Ringkasan Utang & Piutang Widget */}
      <Card className="border border-zinc-200 dark:border-zinc-800 bg-linear-to-r from-zinc-50/50 to-amber-50/30 dark:from-zinc-900/50 dark:to-amber-950/10">
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
                <HandCoins className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-950 dark:text-white flex items-center gap-2">
                  <span>Pelacak Utang & Piutang</span>
                  <Badge variant="default" size="sm">
                    {debts.length} Catatan
                  </Badge>
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Kelola hak tagih piutang Anda dan bayar kewajiban utang tepat waktu.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
              <div>
                <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
                  Piutang Anda
                </span>
                <span className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400">
                  {formatAmount(totalActiveReceivables)}
                </span>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
                  Kewajiban Utang
                </span>
                <span className="text-sm font-bold font-mono text-rose-600 dark:text-rose-400">
                  {formatAmount(totalActiveDebts)}
                </span>
              </div>

              <Link
                href="/debts"
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-700/80 border border-zinc-200 dark:border-zinc-700 shadow-2xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Kelola</span>
                <ChevronRight className="h-3.5 w-3.5 text-zinc-400" />
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
