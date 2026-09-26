'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Plus,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Edit2,
  Trash2,
  PieChart,
  Tag,
  Calendar,
  ChevronLeft,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RupiahInput } from '@/components/ui/rupiah-input';
import { Select } from '@/components/ui/select';
import { Dialog, DialogFooter } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { ProgressBar } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useDompetKu } from '@/lib/store';
import { Budget } from '@/types';
import { calculateBudgetProgress } from '@/lib/calculations/finance';
import { formatRupiah, formatBulan, cn } from '@/lib/utils/formatters';

export default function BudgetsPage() {
  const {
    budgets,
    categories,
    transactions,
    activeMonth,
    addBudget,
    updateBudget,
    deleteBudget,
    formatAmount,
  } = useDompetKu();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [budgetToDelete, setBudgetToDelete] = useState<Budget | null>(null);

  // Status Filter for mobile
  const [statusFilter, setStatusFilter] = useState<'all' | 'safe' | 'warning' | 'danger'>('all');

  // Form State
  const [categoryId, setCategoryId] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [month, setMonth] = useState(activeMonth);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const expenseCategories = categories.filter((c) => c.type === 'expense');

  const handleOpenModal = (bgt?: Budget) => {
    setErrors({});
    setIsSaving(false);
    if (bgt) {
      setEditingBudget(bgt);
      setCategoryId(bgt.category_id);
      setAmountStr(String(bgt.amount));
      setMonth(bgt.month);
    } else {
      setEditingBudget(null);
      setCategoryId(expenseCategories[0]?.id || '');
      setAmountStr('');
      setMonth(activeMonth);
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!categoryId) {
      newErrors.categoryId = 'Silakan pilih kategori.';
    }

    const amount = parseFloat(amountStr) || 0;
    if (amount <= 0) {
      newErrors.amount = 'Jumlah anggaran harus lebih besar dari nol.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSaving(true);
    try {
      if (editingBudget) {
        const success = await updateBudget(editingBudget.id, {
          category_id: categoryId,
          amount,
          month,
        });
        if (!success) return;
      } else {
        const success = await addBudget({
          category_id: categoryId,
          amount,
          month,
        });
        if (!success) return;
      }

      setIsModalOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  const currentBudgets = budgets.filter((b) => b.month === activeMonth);

  const totalBudgeted = currentBudgets.reduce((s, b) => s + b.amount, 0);
  const totalUsed = currentBudgets.reduce((s, b) => {
    const prog = calculateBudgetProgress(b, transactions, categories);
    return s + prog.used;
  }, 0);
  const overallPercentage =
    totalBudgeted > 0 ? Math.round((totalUsed / totalBudgeted) * 100) : 0;
  const remainingBudget = Math.max(0, totalBudgeted - totalUsed);

  // Budgets with progress info
  const budgetsWithProgress = useMemo(() => {
    return currentBudgets.map((bgt) => {
      const prog = calculateBudgetProgress(bgt, transactions, categories);
      return { bgt, prog };
    });
  }, [currentBudgets, transactions, categories]);

  // Counts by status
  const statusCounts = useMemo(() => {
    let safe = 0;
    let warning = 0;
    let danger = 0;

    budgetsWithProgress.forEach(({ prog }) => {
      if (prog.status === 'over_limit') danger++;
      else if (prog.status === 'near_limit') warning++;
      else safe++;
    });

    return { all: budgetsWithProgress.length, safe, warning, danger };
  }, [budgetsWithProgress]);

  // Filtered by status
  const filteredBudgetsWithProgress = useMemo(() => {
    if (statusFilter === 'all') return budgetsWithProgress;
    return budgetsWithProgress.filter(({ prog }) => {
      if (statusFilter === 'danger') return prog.status === 'over_limit';
      if (statusFilter === 'warning') return prog.status === 'near_limit';
      if (statusFilter === 'safe') return prog.status === 'within_limit';
      return true;
    });
  }, [budgetsWithProgress, statusFilter]);

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
                  Anggaran Bulanan
                </h1>
                <p className="text-[11px] text-white/80 font-medium leading-none mt-0.5">
                  Periode {formatBulan(activeMonth)}
                </p>
              </div>
            </div>

            <button
              onClick={() => handleOpenModal()}
              type="button"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-400 text-zinc-950 font-bold text-xs shadow-md hover:bg-amber-300 active:scale-95 transition-all"
            >
              <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>Anggaran</span>
            </button>
          </div>
        </div>

        {/* 2. Floating Mobile Hero Summary Card */}
        <div className="relative z-20 px-4 -mt-10">
          <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-lg shadow-zinc-950/5 dark:shadow-black/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                Total Realisasi Belanja
              </span>
              <span
                className={cn(
                  'text-xs font-bold font-mono px-2 py-0.5 rounded-full',
                  overallPercentage > 100
                    ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                    : overallPercentage > 80
                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                    : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                )}
              >
                {overallPercentage}% Terpakai
              </span>
            </div>

            <div className="flex items-baseline justify-between">
              <div className="text-xl font-black font-mono tracking-tight text-zinc-950 dark:text-white">
                {formatAmount(totalUsed)}
              </div>
              <span className="text-xs font-mono text-zinc-400">
                dari {formatAmount(totalBudgeted)}
              </span>
            </div>

            {/* Overall Progress Bar */}
            <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-500',
                  overallPercentage > 100
                    ? 'bg-rose-500'
                    : overallPercentage > 80
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                )}
                style={{ width: `${Math.min(100, overallPercentage)}%` }}
              />
            </div>

            <div className="flex items-center justify-between pt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
              <span>Sisa Batas Belanja:</span>
              <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">
                {formatAmount(remainingBudget)}
              </span>
            </div>
          </div>
        </div>

        {/* 3. Horizontal Filter Pills */}
        <div className="px-4">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {[
              { id: 'all', label: 'Semua', count: statusCounts.all },
              { id: 'safe', label: 'Dalam Batas', count: statusCounts.safe },
              { id: 'warning', label: 'Mendekati', count: statusCounts.warning },
              { id: 'danger', label: 'Melewati', count: statusCounts.danger },
            ].map((tab) => {
              const isActive = statusFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id as typeof statusFilter)}
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

        {/* 4. Mobile Native Budget Card List */}
        <div className="px-4 space-y-3">
          {filteredBudgetsWithProgress.length === 0 ? (
            <div className="py-10 px-4 text-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-2.5">
              <div className="h-10 w-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center mx-auto">
                <PieChart className="h-5 w-5" />
              </div>
              <p className="text-xs font-semibold text-zinc-900 dark:text-white">
                Belum ada anggaran pada kategori ini
              </p>
              <Button onClick={() => handleOpenModal()} size="sm" variant="primary">
                Tambah Anggaran Baru
              </Button>
            </div>
          ) : (
            filteredBudgetsWithProgress.map(({ bgt, prog }) => {
              const isOver = prog.status === 'over_limit';
              const isNear = prog.status === 'near_limit';

              return (
                <div
                  key={bgt.id}
                  className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
                        style={{ backgroundColor: prog.category?.color || '#a1a1aa' }}
                      />
                      <div>
                        <h3 className="text-xs font-bold text-zinc-950 dark:text-white">
                          {prog.category?.name || 'Kategori'}
                        </h3>
                        <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
                          {formatBulan(bgt.month)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isOver && (
                        <Badge variant="danger" size="sm">
                          <AlertTriangle className="h-3 w-3 mr-0.5" />
                          <span>Melewati</span>
                        </Badge>
                      )}
                      {isNear && (
                        <Badge variant="warning" size="sm">
                          <Clock className="h-3 w-3 mr-0.5" />
                          <span>Mendekati</span>
                        </Badge>
                      )}
                      {!isOver && !isNear && (
                        <Badge variant="success" size="sm">
                          <CheckCircle2 className="h-3 w-3 mr-0.5" />
                          <span>Aman</span>
                        </Badge>
                      )}

                      <button
                        onClick={() => handleOpenModal(bgt)}
                        aria-label="Ubah anggaran"
                        className="p-1 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setBudgetToDelete(bgt)}
                        aria-label="Hapus anggaran"
                        className="p-1 rounded text-zinc-400 hover:text-rose-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Progress Stats */}
                  <div className="space-y-1.5">
                    <div className="flex items-baseline justify-between text-xs">
                      <span className="font-bold font-mono text-zinc-950 dark:text-white">
                        {formatAmount(prog.used)}
                      </span>
                      <span className="font-mono text-zinc-400 text-[11px]">
                        Pagu: {formatAmount(bgt.amount)}
                      </span>
                    </div>

                    <ProgressBar
                      value={prog.percentage}
                      variant="auto"
                    />

                    <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-0.5">
                      <span>{prog.percentage}% terpakai</span>
                      <span
                        className={cn(
                          'font-mono font-medium',
                          isOver ? 'text-rose-600 dark:text-rose-400' : 'text-zinc-500 dark:text-zinc-400'
                        )}
                      >
                        {isOver
                          ? `Lebih ${formatAmount(Math.abs(prog.remaining))}`
                          : `Sisa ${formatAmount(prog.remaining)}`}
                      </span>
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-zinc-950 dark:text-white">
              Anggaran Bulanan
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Batas pengeluaran per kategori pos belanja pada periode {formatBulan(activeMonth)}.
            </p>
          </div>

          <Button
            onClick={() => handleOpenModal()}
            variant="primary"
            size="sm"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            <span>Tambah Anggaran</span>
          </Button>
        </div>

        {/* Filament Stats Summary Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-xs ring-1 ring-zinc-950/5 dark:ring-white/5 space-y-1">
            <span className="text-xs text-zinc-400 font-medium">Total Anggaran Dialokasikan</span>
            <div className="text-xl font-bold font-mono text-zinc-950 dark:text-white">
              {formatAmount(totalBudgeted)}
            </div>
            <p className="text-[11px] text-zinc-400">Untuk {currentBudgets.length} pos kategori belanja</p>
          </div>

          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-xs ring-1 ring-zinc-950/5 dark:ring-white/5 space-y-1">
            <span className="text-xs text-zinc-400 font-medium">Total Realisasi Terpakai</span>
            <div className="text-xl font-bold font-mono text-zinc-950 dark:text-white">
              {formatAmount(totalUsed)}
            </div>
            <p className="text-[11px] text-zinc-400">{overallPercentage}% dari total alokasi</p>
          </div>

          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-xs ring-1 ring-zinc-950/5 dark:ring-white/5 space-y-1">
            <span className="text-xs text-zinc-400 font-medium">Sisa Batas Anggaran</span>
            <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {formatAmount(Math.max(0, totalBudgeted - totalUsed))}
            </div>
            <p className="text-[11px] text-zinc-400">Dana yang masih dapat dibelanjakan</p>
          </div>
        </div>

        {/* Filament Budget Cards Grid */}
        {currentBudgets.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-10 text-center space-y-3">
            <div className="h-10 w-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center mx-auto">
              <PieChart className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-950 dark:text-white">
                Belum ada anggaran pada bulan {formatBulan(activeMonth)}
              </p>
              <p className="text-xs text-zinc-400 mt-0.5">
                Tetapkan batas belanja kategori agar keuangan Anda terkendali.
              </p>
            </div>
            <Button variant="primary" size="sm" onClick={() => handleOpenModal()}>
              Tambah Anggaran Baru
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentBudgets.map((bgt) => {
              const prog = calculateBudgetProgress(bgt, transactions, categories);
              const isOver = prog.status === 'over_limit';
              const isNear = prog.status === 'near_limit';

              return (
                <div
                  key={bgt.id}
                  className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs ring-1 ring-zinc-950/5 dark:ring-white/5 p-5 space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: prog.category?.color || '#a1a1aa' }}
                      />
                      <div>
                        <h3 className="text-sm font-semibold text-zinc-950 dark:text-white">
                          {prog.category?.name || 'Kategori'}
                        </h3>
                        <p className="text-[11px] text-zinc-400 font-mono">
                          {formatBulan(bgt.month)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isOver && (
                        <Badge variant="danger" size="sm">
                          <AlertTriangle className="h-3 w-3" />
                          <span>Melewati batas</span>
                        </Badge>
                      )}
                      {isNear && (
                        <Badge variant="warning" size="sm">
                          <Clock className="h-3 w-3" />
                          <span>Mendekati batas</span>
                        </Badge>
                      )}
                      {!isOver && !isNear && (
                        <Badge variant="success" size="sm">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Dalam batas</span>
                        </Badge>
                      )}

                      <button
                        onClick={() => handleOpenModal(bgt)}
                        aria-label="Ubah anggaran"
                        className="p-1 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setBudgetToDelete(bgt)}
                        aria-label="Hapus anggaran"
                        className="p-1 rounded text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-500">Terpakai:</span>
                      <span className="font-mono font-bold text-zinc-950 dark:text-white">
                        {formatAmount(prog.used)}
                      </span>
                    </div>

                    <ProgressBar
                      value={prog.percentage}
                      variant="auto"
                    />

                    <div className="flex items-center justify-between text-xs text-zinc-400">
                      <span>Pagu: {formatAmount(bgt.amount)}</span>
                      <span>{prog.percentage}%</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs">
                    <span className="text-zinc-500">
                      {isOver ? 'Kelebihan belanja:' : 'Sisa anggaran:'}
                    </span>
                    <span
                      className={`font-mono font-semibold ${
                        isOver
                          ? 'text-rose-600 dark:text-rose-400'
                          : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {isOver
                        ? `-${formatAmount(Math.abs(prog.remaining))}`
                        : formatAmount(prog.remaining)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add / Edit Budget Modal */}
      <Dialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        icon={<PieChart className="h-5 w-5" />}
        iconVariant="amber"
        badge={editingBudget ? 'Edit' : 'Baru'}
        title={editingBudget ? 'Ubah Anggaran' : 'Tambah Anggaran'}
        description="Tetapkan nominal pagu pengeluaran untuk kategori yang dipilih."
        maxWidth="sm"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Select
            label="Pos Kategori Belanja"
            required
            leadingIcon={<Tag className="h-4 w-4" />}
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            error={errors.categoryId}
          >
            {expenseCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </Select>

          <RupiahInput
            label="Pagu Anggaran"
            required
            placeholder="0"
            value={amountStr}
            onChange={(num, raw) => {
              setAmountStr(raw);
              if (errors.amount) setErrors((prev) => ({ ...prev, amount: '' }));
            }}
            error={errors.amount}
            quickAmounts={[500000, 1000000, 2000000, 3000000]}
          />

          <Input
            label="Periode Bulan (YYYY-MM)"
            type="month"
            required
            leadingIcon={<Calendar className="h-4 w-4" />}
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary" disabled={isSaving} isLoading={isSaving}>
              Simpan Anggaran
            </Button>
          </DialogFooter>
        </form>
      </Dialog>

      {/* Confirm Delete Budget Dialog */}
      {budgetToDelete && (
        <ConfirmDialog
          isOpen={!!budgetToDelete}
          onClose={() => setBudgetToDelete(null)}
          onConfirm={async () => {
            await deleteBudget(budgetToDelete.id);
            setBudgetToDelete(null);
          }}
          title="Hapus Anggaran?"
          description={
            <span>
              Pagu anggaran untuk kategori terpilih sebesar{' '}
              <strong>{formatRupiah(budgetToDelete.amount)}</strong> akan dihapus.
            </span>
          }
          confirmText="Hapus"
          cancelText="Batal"
        />
      )}
    </div>
  );
}
