'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Plus,
  Search,
  Trash2,
  Edit2,
  X,
  SlidersHorizontal,
  FileSpreadsheet,
  ChevronLeft,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  TrendingUp,
  TrendingDown,
  Calendar,
  Wallet,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useDompetKu } from '@/lib/store';
import { Transaction } from '@/types';
import { formatRupiah, formatTanggal, formatBulan, cn } from '@/lib/utils/formatters';

export default function TransactionsPage() {
  const {
    transactions,
    accounts,
    categories,
    activeMonth,
    openTransactionModal,
    deleteTransaction,
    formatAmount,
  } = useDompetKu();

  // Filters state (PRD Bagian 26)
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [accountFilter, setAccountFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Delete modal state (PRD Bagian 44)
  const [txToDelete, setTxToDelete] = useState<Transaction | null>(null);

  // Metrics for active month
  const monthlyMetrics = useMemo(() => {
    const monthTx = transactions.filter((t) => t.date.startsWith(activeMonth));
    const income = monthTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = monthTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const net = income - expense;
    return { income, expense, net, count: monthTx.length };
  }, [transactions, activeMonth]);

  // Counts by type
  const typeCounts = useMemo(() => {
    const incomeCount = transactions.filter((t) => t.type === 'income').length;
    const expenseCount = transactions.filter((t) => t.type === 'expense').length;
    const transferCount = transactions.filter((t) => t.type === 'transfer').length;
    return {
      all: transactions.length,
      income: incomeCount,
      expense: expenseCount,
      transfer: transferCount,
    };
  }, [transactions]);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesDesc = t.description.toLowerCase().includes(query);
        const matchesNotes = t.notes?.toLowerCase().includes(query) || false;
        if (!matchesDesc && !matchesNotes) return false;
      }

      // Type filter
      if (typeFilter !== 'all' && t.type !== typeFilter) {
        return false;
      }

      // Account filter
      if (accountFilter !== 'all') {
        if (t.account_id !== accountFilter && t.destination_account_id !== accountFilter) {
          return false;
        }
      }

      // Category filter
      if (categoryFilter !== 'all') {
        if (t.category_id !== categoryFilter) {
          return false;
        }
      }

      return true;
    });
  }, [transactions, searchQuery, typeFilter, accountFilter, categoryFilter]);

  const activeFilterCount =
    (typeFilter !== 'all' ? 1 : 0) +
    (accountFilter !== 'all' ? 1 : 0) +
    (categoryFilter !== 'all' ? 1 : 0);

  const handleResetFilters = () => {
    setSearchQuery('');
    setTypeFilter('all');
    setAccountFilter('all');
    setCategoryFilter('all');
  };

  return (
    <div className="space-y-5">
      {/* ========================================================= */}
      {/* MOBILE VIEW (BRImo-style Responsive Design: visible on < lg) */}
      {/* ========================================================= */}
      <div className="lg:hidden -mx-4 -mt-4 pb-8 space-y-4">
        {/* 1. Mobile Sunset Gradient Hero Header */}
        <div className="relative bg-gradient-to-b from-[#8b2d18] via-[#c65324] to-[#0a4d92] px-4 pt-4 pb-14 text-white overflow-hidden">
          {/* Subtle Skyline Background Pattern */}
          <div className="absolute inset-0 opacity-15 pointer-events-none flex items-end">
            <svg className="w-full h-20" viewBox="0 0 400 100" fill="currentColor" preserveAspectRatio="none">
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

          {/* Top Bar: Back Button, Title, and Add Action */}
          <div className="relative z-10 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard"
                className="h-8 w-8 rounded-full bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/25 active:scale-95 transition-all"
                aria-label="Kembali ke Dashboard"
              >
                <ChevronLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-base font-bold text-white leading-tight">
                  Daftar Transaksi
                </h1>
                <p className="text-[11px] text-white/80 font-medium leading-none mt-0.5">
                  Periode {formatBulan(activeMonth)}
                </p>
              </div>
            </div>

            <button
              onClick={() => openTransactionModal('expense')}
              type="button"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-400 text-zinc-950 font-bold text-xs shadow-md hover:bg-amber-300 active:scale-95 transition-all"
            >
              <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>Catat</span>
            </button>
          </div>
        </div>

        {/* 2. Floating Mobile Hero Summary Card */}
        <div className="relative z-20 px-4 -mt-10">
          <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-lg shadow-zinc-950/5 dark:shadow-black/20 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                <Calendar className="h-3.5 w-3.5 text-amber-500" />
                <span>Arus Kas {formatBulan(activeMonth)}</span>
              </div>
              <span
                className={cn(
                  'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold',
                  monthlyMetrics.net >= 0
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                )}
              >
                {monthlyMetrics.net >= 0 ? (
                  <>
                    <TrendingUp className="h-3 w-3" />
                    <span>Surplus</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-3 w-3" />
                    <span>Defisit</span>
                  </>
                )}
              </span>
            </div>

            <div className="text-xl font-black font-mono tracking-tight text-zinc-950 dark:text-white">
              {monthlyMetrics.net >= 0 ? '+' : ''}
              {formatAmount(monthlyMetrics.net)}
            </div>

            {/* Income & Expense Breakdown Pills */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
              <div className="flex items-center gap-2 p-2 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
                <div className="h-7 w-7 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <ArrowDownLeft className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium leading-none">
                    Pemasukan
                  </p>
                  <p className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5 truncate">
                    +{formatAmount(monthlyMetrics.income)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 rounded-xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40">
                <div className="h-7 w-7 rounded-lg bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                  <ArrowUpRight className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium leading-none">
                    Pengeluaran
                  </p>
                  <p className="text-xs font-bold font-mono text-rose-600 dark:text-rose-400 mt-0.5 truncate">
                    -{formatAmount(monthlyMetrics.expense)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Horizontal Scrollable Filter Pills */}
        <div className="px-4">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {[
              { id: 'all', label: 'Semua', count: typeCounts.all },
              { id: 'expense', label: 'Pengeluaran', count: typeCounts.expense },
              { id: 'income', label: 'Pemasukan', count: typeCounts.income },
              { id: 'transfer', label: 'Transfer', count: typeCounts.transfer },
            ].map((tab) => {
              const isActive = typeFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setTypeFilter(tab.id)}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer',
                    isActive
                      ? 'bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 shadow-xs'
                      : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
                  )}
                >
                  <span>{tab.label}</span>
                  <span
                    className={cn(
                      'text-[10px] px-1.5 py-0.2 rounded-full font-bold',
                      isActive
                        ? 'bg-white/20 dark:bg-zinc-950/20'
                        : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300'
                    )}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Touch Search & Filter Bar */}
        <div className="px-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Input
                placeholder="Cari transaksi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leadingIcon={<Search className="h-3.5 w-3.5" />}
                className="text-xs py-2 bg-white dark:bg-zinc-900 rounded-xl"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  aria-label="Hapus pencarian"
                  className="absolute right-2.5 top-2.5 text-zinc-400 hover:text-zinc-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <Button
              variant={activeFilterCount > 0 ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="text-xs font-semibold gap-1 rounded-xl px-3"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>Filter</span>
              {activeFilterCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-white/30 text-white text-[10px] font-bold">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </div>

          {/* Collapsible Mobile Filter Details */}
          {isFilterOpen && (
            <div className="mt-2 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3 animate-in fade-in duration-150">
              <div>
                <Select
                  label="Rekening"
                  value={accountFilter}
                  onChange={(e) => setAccountFilter(e.target.value)}
                >
                  <option value="all">Semua Rekening</option>
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <Select
                  label="Kategori"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="all">Semua Kategori</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name} ({cat.type === 'income' ? 'Pemasukan' : 'Pengeluaran'})
                    </option>
                  ))}
                </Select>
              </div>

              {activeFilterCount > 0 && (
                <button
                  onClick={handleResetFilters}
                  className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 pt-1"
                >
                  <X className="h-3 w-3" />
                  <span>Reset Semua Filter</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* 5. Mobile Native Card List */}
        <div className="px-4 space-y-2.5">
          {filteredTransactions.length === 0 ? (
            <div className="py-10 px-4 text-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-2.5">
              <div className="h-10 w-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center mx-auto">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <p className="text-xs font-semibold text-zinc-900 dark:text-white">
                Tidak ada transaksi yang cocok
              </p>
              <p className="text-[11px] text-zinc-400 max-w-xs mx-auto">
                Coba sesuaikan filter atau tambahkan transaksi baru.
              </p>
            </div>
          ) : (
            filteredTransactions.map((t) => {
              const acc = accounts.find((a) => a.id === t.account_id);
              const destAcc = t.destination_account_id
                ? accounts.find((a) => a.id === t.destination_account_id)
                : null;
              const cat = categories.find((c) => c.id === t.category_id);

              return (
                <div
                  key={t.id}
                  className="rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3.5 shadow-xs flex items-center justify-between gap-3 active:scale-[0.99] transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Squircle Badge Icon */}
                    <div
                      className={cn(
                        'h-10 w-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs',
                        t.type === 'income' &&
                          'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60',
                        t.type === 'expense' &&
                          'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/60',
                        t.type === 'transfer' &&
                          'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60'
                      )}
                      style={{
                        backgroundColor:
                          t.type !== 'transfer' && cat?.color ? `${cat.color}15` : undefined,
                        color: t.type !== 'transfer' && cat?.color ? cat.color : undefined,
                        borderColor:
                          t.type !== 'transfer' && cat?.color ? `${cat.color}40` : undefined,
                      }}
                    >
                      {t.type === 'income' && <ArrowDownLeft className="h-5 w-5" />}
                      {t.type === 'expense' && <ArrowUpRight className="h-5 w-5" />}
                      {t.type === 'transfer' && <ArrowLeftRight className="h-5 w-5" />}
                    </div>

                    {/* Details */}
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-zinc-950 dark:text-white truncate">
                        {t.description}
                      </h4>
                      <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 mt-0.5 truncate">
                        <span className="font-medium text-zinc-600 dark:text-zinc-300">
                          {t.type === 'transfer'
                            ? `${acc?.name || '-'} → ${destAcc?.name || '-'}`
                            : cat?.name || 'Umum'}
                        </span>
                        <span>•</span>
                        <span>{formatTanggal(t.date)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Amount & Actions */}
                  <div className="flex flex-col items-end shrink-0 gap-1">
                    <span
                      className={cn(
                        'text-xs font-bold font-mono tracking-tight',
                        t.type === 'income' && 'text-emerald-600 dark:text-emerald-400',
                        t.type === 'expense' && 'text-rose-600 dark:text-rose-400',
                        t.type === 'transfer' && 'text-blue-600 dark:text-blue-400'
                      )}
                    >
                      {t.type === 'income' && `+${formatAmount(t.amount)}`}
                      {t.type === 'expense' && `-${formatAmount(t.amount)}`}
                      {t.type === 'transfer' && formatAmount(t.amount)}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openTransactionModal(t.type, t)}
                        aria-label="Ubah transaksi"
                        className="p-1 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                      >
                        <Edit2 className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => setTxToDelete(t)}
                        aria-label="Hapus transaksi"
                        className="p-1 rounded text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* DESKTOP VIEW (Filament UI Layout: visible on lg:) */}
      {/* ========================================================= */}
      <div className="hidden lg:block space-y-5">
        {/* Filament Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-zinc-950 dark:text-white">
              Daftar Transaksi
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Kelola dan pantau seluruh catatan pemasukan, pengeluaran, serta transfer Anda.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => openTransactionModal('expense')}
              variant="primary"
              size="sm"
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              <span>Tambah Transaksi</span>
            </Button>
          </div>
        </div>

        {/* Filament Table Container */}
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs ring-1 ring-zinc-950/5 dark:ring-white/5 overflow-hidden">
          {/* Filament Table Toolbar */}
          <div className="p-3 sm:p-4 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-50/50 dark:bg-zinc-900/50">
            <div className="flex items-center gap-2.5 flex-1 max-w-md">
              <div className="relative flex-1">
                <Input
                  placeholder="Cari transaksi berdasarkan nama atau catatan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  leadingIcon={<Search className="h-3.5 w-3.5" />}
                  className="text-xs py-1.5"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    aria-label="Hapus pencarian"
                    className="absolute right-2.5 top-2.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              <Button
                variant={activeFilterCount > 0 ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="text-xs font-semibold gap-1.5"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                <span>Filter</span>
                {activeFilterCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-white/30 text-white text-[10px] font-bold">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </div>

            {activeFilterCount > 0 && (
              <button
                onClick={handleResetFilters}
                className="text-xs font-medium text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 self-start sm:self-auto"
              >
                <X className="h-3.5 w-3.5" />
                <span>Hapus Semua Filter</span>
              </button>
            )}
          </div>

          {/* Collapsible Filter Panel */}
          {isFilterOpen && (
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-in fade-in duration-150">
              <div>
                <Select
                  label="Jenis Transaksi"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="all">Semua Jenis</option>
                  <option value="income">Pemasukan</option>
                  <option value="expense">Pengeluaran</option>
                  <option value="transfer">Transfer Antar Rekening</option>
                </Select>
              </div>

              <div>
                <Select
                  label="Rekening"
                  value={accountFilter}
                  onChange={(e) => setAccountFilter(e.target.value)}
                >
                  <option value="all">Semua Rekening</option>
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <Select
                  label="Kategori"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="all">Semua Kategori</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name} ({cat.type === 'income' ? 'Pemasukan' : 'Pengeluaran'})
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          )}

          {/* Filament Table View */}
          {filteredTransactions.length === 0 ? (
            <div className="py-12 px-4 text-center space-y-3">
              <div className="h-10 w-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center mx-auto">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                  Tidak ada catatan transaksi yang cocok
                </p>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Coba sesuaikan kata kunci pencarian atau bersihkan filter Anda.
                </p>
              </div>
              {activeFilterCount > 0 && (
                <Button variant="outline" size="sm" onClick={handleResetFilters}>
                  Bersihkan Filter
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="px-5 py-3">Tanggal</th>
                    <th className="px-5 py-3">Status / Jenis</th>
                    <th className="px-5 py-3">Keterangan</th>
                    <th className="px-5 py-3">Kategori</th>
                    <th className="px-5 py-3">Rekening</th>
                    <th className="px-5 py-3 text-right">Jumlah</th>
                    <th className="px-5 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                  {filteredTransactions.map((t) => {
                    const acc = accounts.find((a) => a.id === t.account_id);
                    const destAcc = t.destination_account_id
                      ? accounts.find((a) => a.id === t.destination_account_id)
                      : null;
                    const cat = categories.find((c) => c.id === t.category_id);

                    return (
                      <tr
                        key={t.id}
                        className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/50 transition-colors"
                      >
                        <td className="px-5 py-3 text-zinc-500 font-mono whitespace-nowrap">
                          {formatTanggal(t.date)}
                        </td>
                        <td className="px-5 py-3 whitespace-nowrap">
                          {t.type === 'income' && (
                            <Badge variant="success" size="sm">
                              Pemasukan
                            </Badge>
                          )}
                          {t.type === 'expense' && (
                            <Badge variant="danger" size="sm">
                              Pengeluaran
                            </Badge>
                          )}
                          {t.type === 'transfer' && (
                            <Badge variant="default" size="sm">
                              Transfer
                            </Badge>
                          )}
                        </td>
                        <td className="px-5 py-3">
                          <p className="font-semibold text-zinc-950 dark:text-white">
                            {t.description}
                          </p>
                          {t.notes && (
                            <p className="text-[11px] text-zinc-400 line-clamp-1">
                              {t.notes}
                            </p>
                          )}
                        </td>
                        <td className="px-5 py-3 text-zinc-600 dark:text-zinc-400">
                          {t.type === 'transfer' ? (
                            <span className="text-zinc-400">-</span>
                          ) : (
                            <span>{cat?.name || 'Umum'}</span>
                          )}
                        </td>
                        <td className="px-5 py-3 text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
                          {t.type === 'transfer'
                            ? `${acc?.name || '-'} → ${destAcc?.name || '-'}`
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
                        <td className="px-5 py-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openTransactionModal(t.type, t)}
                              aria-label="Ubah transaksi"
                              className="p-1 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => setTxToDelete(t)}
                              aria-label="Hapus transaksi"
                              className="p-1 rounded text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Filament Table Pagination Footer */}
          <div className="px-5 py-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500 bg-zinc-50/50 dark:bg-zinc-900/50">
            <span>
              Menampilkan {filteredTransactions.length} dari {transactions.length} hasil
            </span>
            <span className="font-mono text-zinc-400 text-[11px]">
              Halaman 1 dari 1
            </span>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {txToDelete && (
        <ConfirmDialog
          isOpen={!!txToDelete}
          onClose={() => setTxToDelete(null)}
          onConfirm={() => {
            deleteTransaction(txToDelete.id);
            setTxToDelete(null);
          }}
          title="Hapus Transaksi?"
          description={
            <span>
              Transaksi <strong>&quot;{txToDelete.description}&quot;</strong> sebesar{' '}
              <strong>{formatRupiah(txToDelete.amount)}</strong> akan dihapus dari buku kas.
            </span>
          }
          confirmText="Hapus"
          cancelText="Batal"
        />
      )}
    </div>
  );
}
