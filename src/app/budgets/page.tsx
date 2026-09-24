'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RupiahInput } from '@/components/ui/rupiah-input';
import { Select } from '@/components/ui/select';
import { Dialog, DialogFooter } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { ProgressBar } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useDompetKu } from '@/lib/store';
import { Budget } from '@/types';
import { calculateBudgetProgress } from '@/lib/calculations/finance';
import { formatRupiah, formatBulan } from '@/lib/utils/formatters';

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

  return (
    <div className="space-y-5">
      {/* Filament Page Header */}
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
                    {/* Filament Status Badge with icon (PRD Section 60) */}
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

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-zinc-500">
                      Terpakai: {formatAmount(prog.used)}
                    </span>
                    <span
                      className={
                        isOver
                          ? 'text-rose-600 font-bold'
                          : isNear
                          ? 'text-amber-600 font-bold'
                          : 'text-zinc-900 dark:text-zinc-100 font-bold'
                      }
                    >
                      {prog.percentage}%
                    </span>
                  </div>
                  <ProgressBar value={prog.percentage} variant="auto" />
                </div>

                {/* Numbers Grid (PRD Bagian 31) */}
                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 text-xs">
                  <div>
                    <span className="text-zinc-400 block text-[10px]">Anggaran</span>
                    <span className="font-mono font-bold text-zinc-950 dark:text-white">
                      {formatAmount(bgt.amount)}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[10px]">Terpakai</span>
                    <span className="font-mono font-bold text-zinc-950 dark:text-white">
                      {formatAmount(prog.used)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-zinc-400 block text-[10px]">Tersisa</span>
                    <span
                      className={`font-mono font-bold ${
                        prog.remaining < 0 ? 'text-rose-600' : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {prog.remaining < 0
                        ? `-${formatAmount(Math.abs(prog.remaining))}`
                        : formatAmount(prog.remaining)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

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
