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
  Bell,
  Search,
  PieChart,
  Target,
  CalendarDays,
  BarChart3,
  FileText,
  Tags,
  Settings,
  Sparkles,
  RefreshCw,
  Cloud,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils/formatters';
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
    syncToCloud,
    isSyncing,
    showToast,
  } = useDompetKu();

  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = React.useState(false);

  const totalBalance = calculateTotalBalance(accounts, transactions);
  const monthlySummary = calculateMonthlySummary(transactions, activeMonth);

  const totalActiveReceivables = debts
    .filter((d) => d.type === 'receivable')
    .reduce((acc, d) => acc + Math.max(0, d.total_amount - d.paid_amount), 0);

  const totalActiveDebts = debts
    .filter((d) => d.type === 'debt')
    .reduce((acc, d) => acc + Math.max(0, d.total_amount - d.paid_amount), 0);

  const activeDebtsCount = debts.filter((d) => d.total_amount > d.paid_amount).length;
  const hasDeficit = monthlySummary.savings < 0;

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

  const [searchQuery, setSearchQuery] = React.useState('');

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 11) return 'Selamat Pagi,';
    if (hour >= 11 && hour < 15) return 'Selamat Siang,';
    if (hour >= 15 && hour < 18) return 'Selamat Sore,';
    return 'Selamat Malam,';
  };

  const mobileFeatures = [
    {
      label: 'Anggaran',
      href: '/budgets',
      icon: PieChart,
      colorClasses: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-800/40',
      hasBadge: false,
    },
    {
      label: 'Utang & Piutang',
      href: '/debts',
      icon: HandCoins,
      colorClasses: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-200/60 dark:border-blue-800/40',
      hasBadge: debts.filter((d) => d.total_amount > d.paid_amount).length > 0,
    },
    {
      label: 'Target Tabungan',
      href: '/goals',
      icon: Target,
      colorClasses: 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border-purple-200/60 dark:border-purple-800/40',
      hasBadge: false,
    },
    {
      label: 'Kalender',
      href: '/calendar',
      icon: CalendarDays,
      colorClasses: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200/60 dark:border-amber-800/40',
      hasBadge: false,
    },
    {
      label: 'Laporan',
      href: '/reports',
      icon: BarChart3,
      colorClasses: 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200/60 dark:border-rose-800/40',
      hasBadge: false,
    },
    {
      label: 'Rekening Koran',
      href: '/statement',
      icon: FileText,
      colorClasses: 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 border-cyan-200/60 dark:border-cyan-800/40',
      hasBadge: false,
    },
    {
      label: 'Kategori',
      href: '/categories',
      icon: Tags,
      colorClasses: 'bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border-orange-200/60 dark:border-orange-800/40',
      hasBadge: false,
    },
    {
      label: 'Pengaturan',
      href: '/settings',
      icon: Settings,
      colorClasses: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700',
      hasBadge: false,
    },
  ];

  const filteredMobileFeatures = searchQuery.trim()
    ? mobileFeatures.filter((f) =>
        f.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : mobileFeatures;

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
    <>
      {/* ========================================================= */}
      {/* MOBILE VIEW (BRImo-style Responsive Design: visible on < lg) */}
      {/* ========================================================= */}
      <div className="lg:hidden -mx-4 -mt-4 pb-6 space-y-4">
        {/* 1. Mobile Sunset & City Skyline Hero Header */}
        <div className="relative bg-gradient-to-b from-[#8b2d18] via-[#c65324] to-[#0a4d92] px-4 pt-5 pb-16 text-white overflow-hidden">
          {/* Skyline Silhouette Illustration */}
          <div className="absolute inset-0 opacity-15 pointer-events-none flex items-end">
            <svg className="w-full h-24" viewBox="0 0 400 100" fill="currentColor" preserveAspectRatio="none">
              <rect x="10" y="35" width="28" height="65" />
              <rect x="42" y="15" width="34" height="85" />
              <rect x="80" y="45" width="22" height="55" />
              <rect x="108" y="20" width="38" height="80" />
              <rect x="152" y="48" width="28" height="52" />
              <rect x="186" y="12" width="36" height="88" />
              <rect x="228" y="38" width="24" height="62" />
              <rect x="258" y="22" width="44" height="78" />
              <rect x="308" y="52" width="28" height="48" />
              <rect x="342" y="18" width="48" height="82" />
            </svg>
          </div>
          {/* Sun Glow */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full bg-amber-300/20 blur-2xl pointer-events-none" />

          {/* Top Bar: Brand, Greeting, Notification, Help */}
          <div className="relative z-10 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center font-black text-amber-300 text-sm shadow-xs">
                DK
              </div>
              <div>
                <p className="text-[11px] text-white/80 font-medium leading-none">
                  {getGreeting()}
                </p>
                <h3 className="text-sm font-bold text-white leading-tight mt-0.5 truncate max-w-[170px]">
                  {user?.name || 'Nabila'}
                </h3>
              </div>
            </div>

            {/* Right Action Icons: Cloud Sync & Financial Notifications */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={async () => {
                  showToast('Menyinkronkan data keuangan ke cloud...', 'info');
                  await syncToCloud();
                }}
                disabled={isSyncing}
                className="h-8 w-8 rounded-full bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-white/90 hover:bg-white/25 active:scale-95 transition-all cursor-pointer"
                title="Sinkronisasi Cloud Supabase"
              >
                <RefreshCw className={cn("h-4 w-4", isSyncing && "animate-spin text-amber-300")} />
              </button>

              <button
                type="button"
                onClick={() => setIsNotificationDrawerOpen(true)}
                className="h-8 w-8 rounded-full bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-white/90 hover:bg-white/25 active:scale-95 transition-all relative cursor-pointer"
                title="Pemberitahuan & Pengingat Keuangan"
              >
                <Bell className="h-4 w-4" />
                {(activeDebtsCount > 0 || hasDeficit) && (
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white/60 animate-pulse" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* 2. Floating Master Balance Card with Quick Action Grid */}
        <div className="relative z-20 px-4 -mt-12">
          <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xl overflow-hidden">
            {/* Blue Top Half (Card Saldo Rekening Utama) */}
            <div className="bg-gradient-to-r from-[#00529c] via-[#026cb6] to-[#014f96] p-4 sm:p-5 text-white">
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/85 font-medium">Saldo Rekening Utama</span>
                <button
                  type="button"
                  onClick={togglePrivacyMode}
                  aria-label={isPrivacyMode ? 'Tampilkan Saldo' : 'Sembunyikan Saldo'}
                  className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
                >
                  {isPrivacyMode ? <EyeOff className="h-4 w-4 text-amber-300" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <div className="text-2xl font-bold font-mono tracking-tight text-white mt-1">
                {isPrivacyMode ? '● ● ● ● ● ● ● ●' : formatAmount(totalBalance)}
              </div>

              <Link
                href="/accounts"
                className="mt-3.5 pt-2.5 border-t border-white/20 flex items-center justify-between text-xs text-white/90 hover:text-white group"
              >
                <span className="font-semibold">Semua Rekeningmu</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {/* Bottom Half: 4 Quick Actions Bar */}
            <div className="grid grid-cols-4 gap-1 p-3 bg-white dark:bg-zinc-900">
              <button
                type="button"
                onClick={() => openTransactionModal('transfer')}
                className="flex flex-col items-center gap-1.5 p-1 rounded-xl active:scale-95 transition-all group cursor-pointer"
              >
                <div className="h-11 w-11 rounded-2xl bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 border border-cyan-100 dark:border-cyan-900/40 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                  <ArrowLeftRight className="h-5 w-5" />
                </div>
                <span className="text-[11px] font-medium text-zinc-700 dark:text-zinc-300">
                  Transfer
                </span>
              </button>

              <button
                type="button"
                onClick={() => openTransactionModal('income')}
                className="flex flex-col items-center gap-1.5 p-1 rounded-xl active:scale-95 transition-all group cursor-pointer"
              >
                <div className="h-11 w-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <span className="text-[11px] font-medium text-zinc-700 dark:text-zinc-300">
                  Pemasukan
                </span>
              </button>

              <button
                type="button"
                onClick={() => openTransactionModal('expense')}
                className="flex flex-col items-center gap-1.5 p-1 rounded-xl active:scale-95 transition-all group cursor-pointer"
              >
                <div className="h-11 w-11 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/40 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                  <TrendingDown className="h-5 w-5" />
                </div>
                <span className="text-[11px] font-medium text-zinc-700 dark:text-zinc-300">
                  Pengeluaran
                </span>
              </button>

              <Link
                href="/accounts"
                className="flex flex-col items-center gap-1.5 p-1 rounded-xl active:scale-95 transition-all group cursor-pointer"
              >
                <div className="h-11 w-11 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/40 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                  <Wallet className="h-5 w-5" />
                </div>
                <span className="text-[11px] font-medium text-zinc-700 dark:text-zinc-300">
                  Rekening
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* 3. Kartu Pantauan Keuangan Cerdas (Real App Financial Insight) */}
        <div className="px-4 pt-1">
          <div
            className={cn(
              'rounded-2xl text-white p-3.5 shadow-md flex items-center justify-between gap-3 relative overflow-hidden',
              monthlySummary.savings >= 0
                ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600'
                : 'bg-gradient-to-r from-rose-600 via-orange-600 to-amber-600'
            )}
          >
            <div className="relative z-10 space-y-1 min-w-0">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-xs text-[10px] font-semibold border border-white/25">
                <Sparkles className="h-3 w-3" />
                <span>
                  {monthlySummary.savings >= 0
                    ? `Surplus ${formatBulan(activeMonth)}`
                    : `Evaluasi ${formatBulan(activeMonth)}`}
                </span>
              </div>
              <h4 className="text-xs font-bold text-white tracking-tight">
                {monthlySummary.savings >= 0
                  ? `Sisa Arus Kas: ${formatAmount(monthlySummary.savings)}`
                  : `Defisit Anggaran: ${formatAmount(Math.abs(monthlySummary.savings))}`}
              </h4>
              <p className="text-[10px] text-white/90 truncate leading-tight">
                {monthlySummary.savings >= 0
                  ? `Rasio tabungan ${monthlySummary.savingsRate.toFixed(0)}%. Alokasikan dana surplus Anda ke target tabungan.`
                  : 'Pengeluaran melebihi pemasukan bulan ini. Periksa pos anggaran belanja Anda.'}
              </p>
            </div>

            <Link
              href={monthlySummary.savings >= 0 ? '/goals' : '/budgets'}
              className="relative z-10 shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white text-orange-600 text-xs font-bold shadow-xs active:scale-95 transition-transform"
            >
              <span>{monthlySummary.savings >= 0 ? 'Tabung' : 'Anggaran'}</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>

            <div className="absolute -right-2 -bottom-3 opacity-20 pointer-events-none">
              <PiggyBank className="h-16 w-16 text-white" />
            </div>
          </div>
        </div>

        {/* 4. Rounded Search Input */}
        <div className="px-4 pt-1">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Cari fitur..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-4 rounded-full bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/70 dark:border-zinc-700/60 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
            />
          </div>
        </div>

        {/* 5. 4x2 Squircles Feature Grid */}
        <div className="px-4 pt-2">
          <div className="grid grid-cols-4 gap-y-4 gap-x-2">
            {filteredMobileFeatures.map((feat) => {
              const Icon = feat.icon;
              return (
                <Link
                  key={feat.href}
                  href={feat.href}
                  className="flex flex-col items-center gap-1.5 p-1 rounded-2xl active:scale-95 transition-all text-center group cursor-pointer"
                >
                  <div
                    className={cn(
                      'w-13 h-13 rounded-2xl flex items-center justify-center shadow-2xs border relative group-hover:scale-105 transition-transform',
                      feat.colorClasses
                    )}
                  >
                    <Icon className="h-6 w-6" />
                    {feat.hasBadge && (
                      <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-rose-500 border-2 border-white dark:border-zinc-900" />
                    )}
                  </div>
                  <span className="text-[11px] font-medium text-zinc-700 dark:text-zinc-300 leading-tight line-clamp-2">
                    {feat.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* 6. Mutasi Terakhir (Recent Transactions) */}
        <div className="px-4 pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-zinc-950 dark:text-white uppercase tracking-wider">
              Mutasi Terakhir
            </h3>
            <Link
              href="/transactions"
              className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-0.5"
            >
              <span>Lihat Semua</span>
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="space-y-2">
            {recentTransactions.length === 0 ? (
              <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 text-center text-xs text-zinc-400">
                Belum ada transaksi tercatat bulan ini.
              </div>
            ) : (
              recentTransactions.map((tx) => {
                const category = categories.find((c) => c.id === tx.category_id);
                const account = accounts.find((a) => a.id === tx.account_id);
                const isIncome = tx.type === 'income';
                const isTransfer = tx.type === 'transfer';

                return (
                  <div
                    key={tx.id}
                    className="p-3.5 rounded-2xl border border-zinc-200/70 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={cn(
                          'h-10 w-10 rounded-xl flex items-center justify-center shrink-0 shadow-2xs text-xs font-bold',
                          isIncome
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                            : isTransfer
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                        )}
                      >
                        {isIncome ? (
                          <TrendingUp className="h-5 w-5" />
                        ) : isTransfer ? (
                          <ArrowLeftRight className="h-5 w-5" />
                        ) : (
                          <TrendingDown className="h-5 w-5" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-zinc-950 dark:text-white truncate">
                          {tx.description || category?.name || 'Transaksi'}
                        </p>
                        <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                          <span>{formatTanggal(tx.date)}</span>
                          {account && (
                            <>
                              <span>•</span>
                              <span className="font-medium text-zinc-600 dark:text-zinc-400 truncate">
                                {account.name}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p
                        className={cn(
                          'text-xs font-bold font-mono tracking-tight',
                          isIncome
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : isTransfer
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-rose-600 dark:text-rose-400'
                        )}
                      >
                        {isIncome ? '+' : isTransfer ? '' : '-'}
                        {formatAmount(tx.amount)}
                      </p>
                      {category && (
                        <span className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate block mt-0.5">
                          {category.name}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* DESKTOP VIEW (Filament Dashboard: visible on lg+)          */}
      {/* ========================================================= */}
      <div className="hidden lg:block space-y-6">
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

      {/* Financial Notification Bottom Sheet Modal */}
      {isNotificationDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
          <div
            className="fixed inset-0 bg-zinc-950/60 dark:bg-zinc-950/80 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setIsNotificationDrawerOpen(false)}
          />
          <div className="relative z-10 bg-white dark:bg-zinc-900 rounded-t-[32px] p-5 pt-3 pb-[max(env(safe-area-inset-bottom),1.5rem)] border-t border-zinc-200/80 dark:border-zinc-800 shadow-2xl animate-in slide-in-from-bottom duration-250">
            {/* Handle */}
            <div className="flex justify-center pb-3">
              <div className="w-10 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between pb-3.5 mb-3 border-b border-zinc-100 dark:border-zinc-800/80">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Bell className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-zinc-950 dark:text-white text-sm">
                    Pemberitahuan & Pengingat
                  </h3>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Status keuangan dan agenda aktif Anda
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsNotificationDrawerOpen(false)}
                className="h-8 w-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 active:scale-95 transition-all cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Notification Items List */}
            <div className="space-y-2.5">
              {/* Alert 1: Utang & Piutang */}
              <div className="p-3.5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/40 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div
                    className={cn(
                      'h-9 w-9 rounded-xl flex items-center justify-center shrink-0 shadow-2xs mt-0.5',
                      activeDebtsCount > 0
                        ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                        : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                    )}
                  >
                    <HandCoins className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      {activeDebtsCount > 0
                        ? `${activeDebtsCount} Catatan Utang / Piutang Aktif`
                        : 'Catatan Utang & Piutang Bersih'}
                    </h4>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
                      {totalActiveReceivables > 0
                        ? `Hak tagih piutang Anda: ${formatAmount(totalActiveReceivables)} belum lunas.`
                        : totalActiveDebts > 0
                        ? `Kewajiban utang aktif: ${formatAmount(totalActiveDebts)} perlu dibayar.`
                        : 'Seluruh transaksi utang dan piutang Anda telah selesai tercatat lunas.'}
                    </p>
                  </div>
                </div>
                <Link
                  href="/debts"
                  onClick={() => setIsNotificationDrawerOpen(false)}
                  className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-600 shrink-0 self-center shadow-2xs active:scale-95 transition-all"
                >
                  Kelola
                </Link>
              </div>

              {/* Alert 2: Status Arus Kas & Anggaran */}
              <div className="p-3.5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/40 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div
                    className={cn(
                      'h-9 w-9 rounded-xl flex items-center justify-center shrink-0 shadow-2xs mt-0.5',
                      monthlySummary.savings >= 0
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                        : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                    )}
                  >
                    {monthlySummary.savings >= 0 ? (
                      <TrendingUp className="h-4.5 w-4.5" />
                    ) : (
                      <TrendingDown className="h-4.5 w-4.5" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      {monthlySummary.savings >= 0
                        ? `Arus Kas Surplus (${monthlySummary.savingsRate.toFixed(1)}% Tabungan)`
                        : 'Pengeluaran Melebihi Pemasukan'}
                    </h4>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
                      {monthlySummary.savings >= 0
                        ? `Sisa dana tabungan bulan ini: ${formatAmount(monthlySummary.savings)}. Amankan surplus ke target impian.`
                        : `Defisit sebesar ${formatAmount(Math.abs(monthlySummary.savings))}. Segera evaluasi batas pagu pengeluaran Anda.`}
                    </p>
                  </div>
                </div>
                <Link
                  href={monthlySummary.savings >= 0 ? '/goals' : '/budgets'}
                  onClick={() => setIsNotificationDrawerOpen(false)}
                  className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-600 shrink-0 self-center shadow-2xs active:scale-95 transition-all"
                >
                  {monthlySummary.savings >= 0 ? 'Target' : 'Pagu'}
                </Link>
              </div>

              {/* Alert 3: Database Cloud Sync */}
              <div className="p-3.5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/40 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="h-9 w-9 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                    <Cloud className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      Sinkronisasi Database Cloud
                    </h4>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
                      {isSyncing
                        ? 'Sedang menyinkronkan data mutasi dengan server Supabase...'
                        : 'Cadangkan mutasi lokal Anda ke PostgreSQL cloud secara aman.'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    showToast('Menyinkronkan data keuangan ke cloud...', 'info');
                    await syncToCloud();
                  }}
                  disabled={isSyncing}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500 text-zinc-950 shadow-2xs shrink-0 self-center active:scale-95 transition-all cursor-pointer"
                >
                  {isSyncing ? 'Proses...' : 'Sinkron'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
