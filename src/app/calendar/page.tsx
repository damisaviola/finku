'use client';

import React, { useState, useMemo } from 'react';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  TrendingUp,
  TrendingDown,
  Wallet,
  Tag,
  Filter,
  Layers,
  X,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useDompetKu } from '@/lib/store';
import { formatRupiah, formatTanggal, formatBulan, cn } from '@/lib/utils/formatters';
import {
  CalendarDay,
  generateCalendarGrid,
  getMonthlyCalendarMetrics,
  formatIndonesianFullDate,
} from '@/lib/utils/calendar';
import { Transaction, TransactionType } from '@/types';

export default function FinancialCalendarPage() {
  const {
    transactions,
    accounts,
    categories,
    activeMonth,
    setActiveMonth,
    openTransactionModal,
    deleteTransaction,
    showToast,
  } = useDompetKu();

  // Selected date state (defaults to today's date)
  const todayStr = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, []);

  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'calendar' | 'agenda'>('calendar');

  // Filters
  const [selectedAccountId, setSelectedAccountId] = useState<string>('all');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<'all' | 'income' | 'expense'>('all');

  // Current year and month from activeMonth (e.g. "2026-09")
  const { currentYear, currentMonth } = useMemo(() => {
    const [yStr, mStr] = (activeMonth || '2026-09').split('-');
    return {
      currentYear: parseInt(yStr, 10),
      currentMonth: parseInt(mStr, 10),
    };
  }, [activeMonth]);

  // Navigate months
  const handlePrevMonth = () => {
    let newMonth = currentMonth - 1;
    let newYear = currentYear;
    if (newMonth < 1) {
      newMonth = 12;
      newYear -= 1;
    }
    const newMonthKey = `${newYear}-${String(newMonth).padStart(2, '0')}`;
    setActiveMonth(newMonthKey);
  };

  const handleNextMonth = () => {
    let newMonth = currentMonth + 1;
    let newYear = currentYear;
    if (newMonth > 12) {
      newMonth = 1;
      newYear += 1;
    }
    const newMonthKey = `${newYear}-${String(newMonth).padStart(2, '0')}`;
    setActiveMonth(newMonthKey);
  };

  const handleJumpToToday = () => {
    const now = new Date();
    const todayMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    setActiveMonth(todayMonthKey);
    setSelectedDate(todayStr);
  };

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (selectedAccountId !== 'all') {
        if (t.account_id !== selectedAccountId && t.destination_account_id !== selectedAccountId) {
          return false;
        }
      }
      if (selectedTypeFilter !== 'all') {
        if (t.type !== selectedTypeFilter) return false;
      }
      return true;
    });
  }, [transactions, selectedAccountId, selectedTypeFilter]);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    return generateCalendarGrid(currentYear, currentMonth, filteredTransactions);
  }, [currentYear, currentMonth, filteredTransactions]);

  // Monthly summary metrics
  const metrics = useMemo(() => {
    return getMonthlyCalendarMetrics(filteredTransactions, activeMonth);
  }, [filteredTransactions, activeMonth]);

  // Transactions for the currently selected date
  const selectedDayTransactions = useMemo(() => {
    return filteredTransactions.filter((t) => t.date === selectedDate);
  }, [filteredTransactions, selectedDate]);

  const selectedDayMetrics = useMemo(() => {
    const income = selectedDayTransactions
      .filter((t) => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0);
    const expense = selectedDayTransactions
      .filter((t) => t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0);
    return {
      income,
      expense,
      net: income - expense,
      count: selectedDayTransactions.length,
    };
  }, [selectedDayTransactions]);

  // Group transactions for Agenda View (chronological)
  const agendaDays = useMemo(() => {
    const map = new Map<string, Transaction[]>();
    filteredTransactions
      .filter((t) => t.date.startsWith(activeMonth))
      .sort((a, b) => a.date.localeCompare(b.date))
      .forEach((t) => {
        const list = map.get(t.date) || [];
        list.push(t);
        map.set(t.date, list);
      });

    return Array.from(map.entries()).map(([dateStr, txs]) => {
      const income = txs.filter((t) => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
      const expense = txs.filter((t) => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
      return {
        dateStr,
        transactions: txs,
        income,
        expense,
        net: income - expense,
      };
    });
  }, [filteredTransactions, activeMonth]);

  // Click on a calendar day
  const handleDayClick = (day: CalendarDay) => {
    setSelectedDate(day.dateStr);
    setIsDetailDrawerOpen(true);
  };

  const handleDeleteTx = (id: string, description: string) => {
    if (window.confirm(`Hapus transaksi "${description}"?`)) {
      deleteTransaction(id);
      showToast('Transaksi berhasil dihapus.', 'info');
    }
  };

  const weekDayHeaders = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

  return (
    <div className="space-y-6">
      {/* 1. Page Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 mb-1.5">
            <CalendarDays className="h-3 w-3" />
            <span>Arus Kas Tanggal per Tanggal</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
            Kalender Keuangan
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Pantau pemasukan, pengeluaran harian, dan mutasi kas dalam tampilan kalender interaktif.
          </p>
        </div>

        {/* View Switcher & Action Button */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Dual-View Switch (Grid vs Agenda) */}
          <div className="flex items-center p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/80 shadow-xs">
            <button
              type="button"
              onClick={() => setViewMode('calendar')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer',
                viewMode === 'calendar'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              )}
            >
              <CalendarDays className="h-3.5 w-3.5" />
              <span>Kalender</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('agenda')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer',
                viewMode === 'agenda'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              )}
            >
              <Clock className="h-3.5 w-3.5" />
              <span>Agenda Harian</span>
            </button>
          </div>

          {/* Quick Add Transaction Button */}
          <Button
            variant="primary"
            size="sm"
            onClick={() => openTransactionModal('expense', null, selectedDate)}
            className="h-9 font-semibold shadow-xs"
          >
            <Plus className="h-4 w-4 mr-1" />
            <span>Catat Transaksi</span>
          </Button>
        </div>
      </div>

      {/* 2. Controls & Month Navigator */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-xs ring-1 ring-zinc-950/5 dark:ring-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Month Selector Buttons */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl border border-zinc-200 dark:border-zinc-700">
            <button
              type="button"
              onClick={handlePrevMonth}
              aria-label="Bulan Sebelumnya"
              title="Bulan Sebelumnya"
              className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition-colors cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <span className="px-3 text-xs sm:text-sm font-bold text-zinc-900 dark:text-white min-w-[130px] text-center">
              {formatBulan(activeMonth)}
            </span>

            <button
              type="button"
              onClick={handleNextMonth}
              aria-label="Bulan Berikutnya"
              title="Bulan Berikutnya"
              className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition-colors cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleJumpToToday}
            className="h-9 text-xs font-semibold shadow-xs"
          >
            <span>Bulan Ini</span>
          </Button>
        </div>

        {/* Filters: Rekening & Jenis Transaksi */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Account Filter */}
          <div className="flex items-center gap-1.5 text-xs text-zinc-500">
            <Wallet className="h-3.5 w-3.5 text-zinc-400" />
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-2.5 py-1.5 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-amber-500 shadow-xs cursor-pointer"
            >
              <option value="all">Semua Rekening</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({acc.type})
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-1.5 text-xs text-zinc-500">
            <Filter className="h-3.5 w-3.5 text-zinc-400" />
            <select
              value={selectedTypeFilter}
              onChange={(e) => setSelectedTypeFilter(e.target.value as 'all' | 'income' | 'expense')}
              className="rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-2.5 py-1.5 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-amber-500 shadow-xs cursor-pointer"
            >
              <option value="all">Semua Tipe</option>
              <option value="expense">Hanya Pengeluaran</option>
              <option value="income">Hanya Pemasukan</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Monthly Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pemasukan Bulanan */}
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4.5 shadow-xs ring-1 ring-zinc-950/5 dark:ring-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 font-medium">
            <span>Pemasukan Bulan Ini</span>
            <Badge variant="success" size="sm">
              <TrendingUp className="h-3 w-3 mr-0.5" />
              <span>Masuk</span>
            </Badge>
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 tracking-tight">
            +{formatRupiah(metrics.totalIncome)}
          </div>
          <p className="text-[11px] text-zinc-400 pt-1 border-t border-zinc-100 dark:border-zinc-800/80">
            Periode {formatBulan(activeMonth)}
          </p>
        </div>

        {/* Pengeluaran Bulanan */}
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4.5 shadow-xs ring-1 ring-zinc-950/5 dark:ring-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 font-medium">
            <span>Pengeluaran Bulan Ini</span>
            <Badge variant="danger" size="sm">
              <TrendingDown className="h-3 w-3 mr-0.5" />
              <span>Keluar</span>
            </Badge>
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-rose-600 dark:text-rose-400 tracking-tight">
            -{formatRupiah(metrics.totalExpense)}
          </div>
          <p className="text-[11px] text-zinc-400 pt-1 border-t border-zinc-100 dark:border-zinc-800/80">
            Tanpa mutasi transfer internal
          </p>
        </div>

        {/* Arus Kas Bersih */}
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4.5 shadow-xs ring-1 ring-zinc-950/5 dark:ring-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 font-medium">
            <span>Arus Kas Bersih</span>
            <span
              className={cn(
                'text-[10px] font-semibold px-2 py-0.5 rounded-full border',
                metrics.netCashflow >= 0
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
              )}
            >
              {metrics.netCashflow >= 0 ? 'Surplus' : 'Defisit'}
            </span>
          </div>
          <div
            className={cn(
              'text-xl sm:text-2xl font-bold font-mono tracking-tight',
              metrics.netCashflow >= 0 ? 'text-zinc-950 dark:text-white' : 'text-rose-600 dark:text-rose-400'
            )}
          >
            {metrics.netCashflow >= 0 ? '+' : ''}
            {formatRupiah(metrics.netCashflow)}
          </div>
          <p className="text-[11px] text-zinc-400 pt-1 border-t border-zinc-100 dark:border-zinc-800/80">
            Selisih penerimaan dan belanja
          </p>
        </div>

        {/* Rata-rata & Hari Terboros */}
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4.5 shadow-xs ring-1 ring-zinc-950/5 dark:ring-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 font-medium">
            <span>Rata-Rata Harian</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
              {metrics.transactionCount} Transaksi
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-zinc-950 dark:text-white tracking-tight">
            {formatRupiah(metrics.dailyAverageExpense)}
            <span className="text-xs font-normal text-zinc-400">/hari</span>
          </div>
          <p className="text-[11px] text-zinc-400 pt-1 border-t border-zinc-100 dark:border-zinc-800/80 truncate">
            {metrics.peakSpendingDay ? (
              <span>
                🔥 Hari terboros: <strong>{formatTanggal(metrics.peakSpendingDay.date)}</strong> ({formatRupiah(metrics.peakSpendingDay.amount)})
              </span>
            ) : (
              <span>Belum ada transaksi bulan ini</span>
            )}
          </p>
        </div>
      </div>

      {/* 4. Main Calendar Content: Grid View or Agenda View */}
      {viewMode === 'calendar' ? (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* Calendar Grid Container (9 Cols on Large, 12 on Mobile) */}
          <div className="xl:col-span-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 sm:p-6 shadow-xs ring-1 ring-zinc-950/5 dark:ring-white/5">
            {/* Days of Week Header */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
              {weekDayHeaders.map((dayName, idx) => (
                <div
                  key={dayName}
                  className={cn(
                    'py-2 text-center text-xs font-bold uppercase tracking-wider',
                    idx >= 5 ? 'text-amber-600 dark:text-amber-400' : 'text-zinc-500 dark:text-zinc-400'
                  )}
                >
                  <span className="hidden sm:inline">{dayName}</span>
                  <span className="sm:hidden">{dayName.slice(0, 3)}</span>
                </div>
              ))}
            </div>

            {/* Calendar Days 7x5 or 7x6 Grid */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {calendarDays.map((day, idx) => {
                const isSelected = day.dateStr === selectedDate;
                const hasTransactions = day.transactions.length > 0;

                return (
                  <div
                    key={`${day.dateStr}-${idx}`}
                    onClick={() => handleDayClick(day)}
                    className={cn(
                      'min-h-[80px] sm:min-h-[105px] p-1.5 sm:p-2.5 rounded-xl border transition-all flex flex-col justify-between text-left cursor-pointer group select-none',
                      day.isCurrentMonth
                        ? 'bg-white dark:bg-zinc-900/90 border-zinc-200/80 dark:border-zinc-800 hover:border-amber-500/50 hover:bg-amber-500/[0.02]'
                        : 'bg-zinc-50/50 dark:bg-zinc-950/40 border-zinc-100 dark:border-zinc-800/40 opacity-40 hover:opacity-75',
                      isSelected &&
                        'ring-2 ring-amber-500 border-amber-500 dark:border-amber-500 bg-amber-500/[0.04] dark:bg-amber-500/10',
                      day.isToday && !isSelected && 'border-amber-400/60 dark:border-amber-500/50'
                    )}
                  >
                    {/* Top Row: Date Number & Badges */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <span
                          className={cn(
                            'text-xs sm:text-sm font-bold rounded-lg px-1.5 py-0.5 leading-none',
                            day.isToday
                              ? 'bg-amber-500 text-white shadow-xs'
                              : isSelected
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-zinc-800 dark:text-zinc-200'
                          )}
                        >
                          {day.dayNumber}
                        </span>
                        {day.isToday && (
                          <span className="hidden md:inline text-[9px] font-semibold text-amber-600 dark:text-amber-400">
                            Hari Ini
                          </span>
                        )}
                      </div>

                      {hasTransactions && (
                        <span className="text-[9px] sm:text-[10px] font-mono px-1 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700/60">
                          {day.transactions.length}
                        </span>
                      )}
                    </div>

                    {/* Middle / Bottom Content: Daily Totals */}
                    <div className="space-y-0.5 sm:space-y-1 mt-1">
                      {/* Income Badge */}
                      {day.income > 0 && (
                        <div className="text-[9px] sm:text-[11px] font-mono font-semibold text-emerald-600 dark:text-emerald-400 truncate bg-emerald-500/10 dark:bg-emerald-500/15 px-1 sm:px-1.5 py-0.5 rounded border border-emerald-500/20">
                          +{formatRupiah(day.income)}
                        </div>
                      )}

                      {/* Expense Badge */}
                      {day.expense > 0 && (
                        <div className="text-[9px] sm:text-[11px] font-mono font-semibold text-rose-600 dark:text-rose-400 truncate bg-rose-500/10 dark:bg-rose-500/15 px-1 sm:px-1.5 py-0.5 rounded border border-rose-500/20">
                          -{formatRupiah(day.expense)}
                        </div>
                      )}

                      {/* Transfer Badge (if only transfer on that day) */}
                      {day.transferCount > 0 && day.income === 0 && day.expense === 0 && (
                        <div className="text-[9px] sm:text-[10px] text-amber-600 dark:text-amber-400 truncate bg-amber-500/10 px-1 py-0.5 rounded flex items-center gap-0.5">
                          <ArrowLeftRight className="h-2.5 w-2.5" />
                          <span>Transfer</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Day Detail Side-Over Panel (4 Cols on Large) */}
          <div className="xl:col-span-4 space-y-4 sticky top-20">
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs ring-1 ring-zinc-950/5 dark:ring-white/5 space-y-4">
              {/* Header Details */}
              <div className="border-b border-zinc-100 dark:border-zinc-800/80 pb-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                    Rincian Tanggal Terpilih
                  </span>
                  <button
                    type="button"
                    onClick={() => openTransactionModal('expense', null, selectedDate)}
                    className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Catat di Tanggal Ini</span>
                  </button>
                </div>
                <h3 className="text-base font-bold text-zinc-950 dark:text-white mt-1">
                  {formatIndonesianFullDate(selectedDate)}
                </h3>
              </div>

              {/* Day Quick Summary Mini Chips */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/20">
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block">Masuk</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs truncate block">
                    +{formatRupiah(selectedDayMetrics.income)}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-rose-500/[0.06] border border-rose-500/20">
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block">Keluar</span>
                  <span className="font-mono font-bold text-rose-600 dark:text-rose-400 text-xs truncate block">
                    -{formatRupiah(selectedDayMetrics.expense)}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block">Arus Kas</span>
                  <span
                    className={cn(
                      'font-mono font-bold text-xs truncate block',
                      selectedDayMetrics.net >= 0 ? 'text-zinc-950 dark:text-white' : 'text-rose-600 dark:text-rose-400'
                    )}
                  >
                    {formatRupiah(selectedDayMetrics.net)}
                  </span>
                </div>
              </div>

              {/* List of Transactions for Selected Date */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs text-zinc-500">
                  <span>Daftar Transaksi</span>
                  <span>{selectedDayTransactions.length} catatan</span>
                </div>

                {selectedDayTransactions.length === 0 ? (
                  <div className="py-8 text-center rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 p-4 space-y-2">
                    <div className="h-10 w-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center mx-auto">
                      <CalendarDays className="h-5 w-5" />
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Tidak ada transaksi pada tanggal ini.
                    </p>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => openTransactionModal('expense', null, selectedDate)}
                      className="text-xs font-semibold mt-1"
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" />
                      <span>Tambah Sekarang</span>
                    </Button>
                  </div>
                ) : (
                  <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80 max-h-[380px] overflow-y-auto pr-1">
                    {selectedDayTransactions.map((tx) => {
                      const acc = accounts.find((a) => a.id === tx.account_id);
                      const destAcc = tx.destination_account_id
                        ? accounts.find((a) => a.id === tx.destination_account_id)
                        : null;
                      const cat = categories.find((c) => c.id === tx.category_id);

                      return (
                        <div
                          key={tx.id}
                          className="py-3 flex items-start justify-between gap-3 group/item hover:bg-zinc-50 dark:hover:bg-zinc-800/40 rounded-xl px-2 -mx-2 transition-colors"
                        >
                          <div className="flex items-start gap-2.5 min-w-0">
                            {/* Icon Indicator */}
                            <div
                              className={cn(
                                'p-2 rounded-lg shrink-0 mt-0.5',
                                tx.type === 'income'
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                  : tx.type === 'expense'
                                  ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                              )}
                            >
                              {tx.type === 'income' && <ArrowDownLeft className="h-4 w-4" />}
                              {tx.type === 'expense' && <ArrowUpRight className="h-4 w-4" />}
                              {tx.type === 'transfer' && <ArrowLeftRight className="h-4 w-4" />}
                            </div>

                            {/* Details */}
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-zinc-950 dark:text-white truncate">
                                {tx.description}
                              </p>
                              <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 mt-0.5 truncate">
                                <span>{tx.type === 'transfer' ? 'Transfer' : cat?.name || 'Umum'}</span>
                                <span>•</span>
                                <span>
                                  {tx.type === 'transfer' ? `${acc?.name} → ${destAcc?.name}` : acc?.name}
                                </span>
                              </div>
                              {tx.notes && (
                                <p className="text-[10px] text-zinc-400 italic mt-0.5 truncate">
                                  {tx.notes}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Right Amount & Actions */}
                          <div className="text-right shrink-0">
                            <span
                              className={cn(
                                'font-mono text-xs font-bold block',
                                tx.type === 'income'
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : tx.type === 'expense'
                                  ? 'text-rose-600 dark:text-rose-400'
                                  : 'text-zinc-800 dark:text-zinc-200'
                              )}
                            >
                              {tx.type === 'income' && `+${formatRupiah(tx.amount)}`}
                              {tx.type === 'expense' && `-${formatRupiah(tx.amount)}`}
                              {tx.type === 'transfer' && formatRupiah(tx.amount)}
                            </span>

                            {/* Action Buttons on Hover */}
                            <div className="flex items-center justify-end gap-1.5 mt-1 opacity-80 group-hover/item:opacity-100 transition-opacity">
                              <button
                                type="button"
                                onClick={() => openTransactionModal(tx.type, tx, tx.date)}
                                title="Ubah transaksi"
                                className="p-1 rounded text-zinc-400 hover:text-amber-600 hover:bg-amber-500/10 transition-colors cursor-pointer"
                              >
                                <Edit2 className="h-3 w-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteTx(tx.id, tx.description)}
                                title="Hapus transaksi"
                                className="p-1 rounded text-zinc-400 hover:text-rose-600 hover:bg-rose-500/10 transition-colors cursor-pointer"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* 5. Agenda Harian (Timeline View) */
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 sm:p-6 shadow-xs ring-1 ring-zinc-950/5 dark:ring-white/5 space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/80 pb-3">
            <div>
              <h3 className="text-base font-bold text-zinc-950 dark:text-white">
                Agenda Kronologis Transaksi
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Menampilkan mutasi hari demi hari yang aktif pada periode {formatBulan(activeMonth)}.
              </p>
            </div>
            <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
              {agendaDays.length} Hari Aktif
            </span>
          </div>

          {agendaDays.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
                <CalendarDays className="h-6 w-6" />
              </div>
              <h4 className="text-sm font-bold text-zinc-950 dark:text-white">
                Belum Ada Catatan Transaksi
              </h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
                Tidak ada mutasi belanja ataupun pemasukan pada bulan {formatBulan(activeMonth)}.
              </p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => openTransactionModal('expense')}
                className="font-semibold"
              >
                <Plus className="h-4 w-4 mr-1" />
                <span>Catat Transaksi Pertama</span>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {agendaDays.map((agenda) => (
                <div
                  key={agenda.dateStr}
                  className="rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 p-4 space-y-3"
                >
                  {/* Date Banner Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-200/60 dark:border-zinc-800/60 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-amber-500" />
                      <span className="font-bold text-xs sm:text-sm text-zinc-950 dark:text-white">
                        {formatIndonesianFullDate(agenda.dateStr)}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs font-mono">
                      {agenda.income > 0 && (
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                          +{formatRupiah(agenda.income)}
                        </span>
                      )}
                      {agenda.expense > 0 && (
                        <span className="text-rose-600 dark:text-rose-400 font-semibold">
                          -{formatRupiah(agenda.expense)}
                        </span>
                      )}
                      <span className="text-zinc-400 font-sans text-[11px]">
                        ({agenda.transactions.length} mutasi)
                      </span>
                    </div>
                  </div>

                  {/* Transactions Rows */}
                  <div className="divide-y divide-zinc-200/50 dark:divide-zinc-800/50">
                    {agenda.transactions.map((tx) => {
                      const acc = accounts.find((a) => a.id === tx.account_id);
                      const destAcc = tx.destination_account_id
                        ? accounts.find((a) => a.id === tx.destination_account_id)
                        : null;
                      const cat = categories.find((c) => c.id === tx.category_id);

                      return (
                        <div
                          key={tx.id}
                          className="py-2.5 flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={cn(
                                'h-7 w-7 rounded-lg flex items-center justify-center shrink-0',
                                tx.type === 'income'
                                  ? 'bg-emerald-500/10 text-emerald-600'
                                  : tx.type === 'expense'
                                  ? 'bg-rose-500/10 text-rose-600'
                                  : 'bg-amber-500/10 text-amber-600'
                              )}
                            >
                              {tx.type === 'income' && <ArrowDownLeft className="h-3.5 w-3.5" />}
                              {tx.type === 'expense' && <ArrowUpRight className="h-3.5 w-3.5" />}
                              {tx.type === 'transfer' && <ArrowLeftRight className="h-3.5 w-3.5" />}
                            </div>

                            <div className="min-w-0">
                              <p className="font-semibold text-zinc-900 dark:text-white truncate">
                                {tx.description}
                              </p>
                              <p className="text-[11px] text-zinc-400 truncate">
                                {tx.type === 'transfer'
                                  ? `${acc?.name} → ${destAcc?.name}`
                                  : `${cat?.name || 'Umum'} • ${acc?.name}`}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <span
                              className={cn(
                                'font-mono font-bold',
                                tx.type === 'income'
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : tx.type === 'expense'
                                  ? 'text-rose-600 dark:text-rose-400'
                                  : 'text-zinc-700 dark:text-zinc-300'
                              )}
                            >
                              {tx.type === 'income' && `+${formatRupiah(tx.amount)}`}
                              {tx.type === 'expense' && `-${formatRupiah(tx.amount)}`}
                              {tx.type === 'transfer' && formatRupiah(tx.amount)}
                            </span>

                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => openTransactionModal(tx.type, tx, tx.date)}
                                className="p-1 text-zinc-400 hover:text-amber-600 rounded cursor-pointer"
                                title="Ubah"
                              >
                                <Edit2 className="h-3 w-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteTx(tx.id, tx.description)}
                                className="p-1 text-zinc-400 hover:text-rose-600 rounded cursor-pointer"
                                title="Hapus"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
