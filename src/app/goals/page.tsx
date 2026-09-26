'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Plus,
  Target,
  PiggyBank,
  Calendar,
  CheckCircle2,
  Edit2,
  Trash2,
  Coins,
  Wallet,
  ChevronLeft,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RupiahInput } from '@/components/ui/rupiah-input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogFooter } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { ProgressBar } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useDompetKu } from '@/lib/store';
import { Goal } from '@/types';
import { formatRupiah, formatTanggal, cn } from '@/lib/utils/formatters';

export default function GoalsPage() {
  const {
    goals,
    accounts,
    addGoal,
    updateGoal,
    contributeGoal,
    deleteGoal,
    formatAmount,
  } = useDompetKu();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [goalToDelete, setGoalToDelete] = useState<Goal | null>(null);

  // Status Filter for mobile
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('all');

  // Quick contribute modal state
  const [contributeTargetGoal, setContributeTargetGoal] = useState<Goal | null>(null);
  const [depositAmountStr, setDepositAmountStr] = useState('');
  const [depositAccountId, setDepositAccountId] = useState('');
  const [depositError, setDepositError] = useState('');

  // Goal Form State (PRD Bagian 34)
  const [name, setName] = useState('');
  const [targetAmountStr, setTargetAmountStr] = useState('');
  const [currentAmountStr, setCurrentAmountStr] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isContributing, setIsContributing] = useState(false);

  // Aggregate metrics
  const totalTarget = useMemo(() => goals.reduce((s, g) => s + g.target_amount, 0), [goals]);
  const totalCurrent = useMemo(() => goals.reduce((s, g) => s + g.current_amount, 0), [goals]);
  const overallPercentage = totalTarget > 0 ? Math.min(100, Math.round((totalCurrent / totalTarget) * 100)) : 0;
  const completedGoalsCount = useMemo(() => goals.filter((g) => g.current_amount >= g.target_amount).length, [goals]);

  // Filtered goals
  const filteredGoals = useMemo(() => {
    if (statusFilter === 'all') return goals;
    if (statusFilter === 'completed') return goals.filter((g) => g.current_amount >= g.target_amount);
    return goals.filter((g) => g.current_amount < g.target_amount);
  }, [goals, statusFilter]);

  const handleOpenModal = (g?: Goal) => {
    setErrors({});
    setIsSaving(false);
    if (g) {
      setEditingGoal(g);
      setName(g.name);
      setTargetAmountStr(String(g.target_amount));
      setCurrentAmountStr(String(g.current_amount));
      setTargetDate(g.target_date || '');
      setDescription(g.description || '');
    } else {
      setEditingGoal(null);
      setName('');
      setTargetAmountStr('');
      setCurrentAmountStr('0');
      setTargetDate('');
      setDescription('');
    }
    setIsModalOpen(true);
  };

  const handleSaveGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Nama target tabungan wajib diisi.';
    }

    const targetAmount = parseFloat(targetAmountStr) || 0;
    if (targetAmount <= 0) {
      newErrors.targetAmount = 'Jumlah target harus lebih besar dari nol.';
    }

    const currentAmount = parseFloat(currentAmountStr) || 0;
    if (currentAmount < 0) {
      newErrors.currentAmount = 'Jumlah saat ini tidak boleh negatif.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSaving(true);
    try {
      if (editingGoal) {
        const success = await updateGoal(editingGoal.id, {
          name: name.trim(),
          target_amount: targetAmount,
          current_amount: currentAmount,
          target_date: targetDate || undefined,
          description: description.trim() || undefined,
        });
        if (!success) return;
      } else {
        const success = await addGoal({
          name: name.trim(),
          target_amount: targetAmount,
          current_amount: currentAmount,
          target_date: targetDate || undefined,
          description: description.trim() || undefined,
        });
        if (!success) return;
      }

      setIsModalOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenContribute = (g: Goal) => {
    setContributeTargetGoal(g);
    setDepositAmountStr('');
    setDepositAccountId(accounts[0]?.id || '');
    setDepositError('');
    setIsContributing(false);
  };

  const handleConfirmContribute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contributeTargetGoal) return;

    const amount = parseFloat(depositAmountStr) || 0;
    if (amount <= 0) {
      setDepositError('Jumlah setor harus lebih besar dari nol.');
      return;
    }

    setIsContributing(true);
    try {
      const success = await contributeGoal(contributeTargetGoal.id, amount, depositAccountId);
      if (success) {
        setContributeTargetGoal(null);
      }
    } finally {
      setIsContributing(false);
    }
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
                  Target Tabungan
                </h1>
                <p className="text-[11px] text-white/80 font-medium leading-none mt-0.5">
                  {goals.length} Rencana Impian
                </p>
              </div>
            </div>

            <button
              onClick={() => handleOpenModal()}
              type="button"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-400 text-zinc-950 font-bold text-xs shadow-md hover:bg-amber-300 active:scale-95 transition-all"
            >
              <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>Target</span>
            </button>
          </div>
        </div>

        {/* 2. Floating Mobile Hero Summary Card */}
        <div className="relative z-20 px-4 -mt-10">
          <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-lg shadow-zinc-950/5 dark:shadow-black/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                Total Akumulasi Tabungan
              </span>
              <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                {overallPercentage}% Terkumpul
              </span>
            </div>

            <div className="flex items-baseline justify-between">
              <div className="text-xl font-black font-mono tracking-tight text-zinc-950 dark:text-white">
                {formatAmount(totalCurrent)}
              </div>
              <span className="text-xs font-mono text-zinc-400">
                dari {formatAmount(totalTarget)}
              </span>
            </div>

            {/* Overall Progress Bar */}
            <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full transition-all duration-500"
                style={{ width: `${overallPercentage}%` }}
              />
            </div>

            <div className="flex items-center justify-between pt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
              <span>{completedGoalsCount} dari {goals.length} target tercapai</span>
              <span className="font-bold font-mono text-amber-600 dark:text-amber-400">
                Kurang: {formatAmount(Math.max(0, totalTarget - totalCurrent))}
              </span>
            </div>
          </div>
        </div>

        {/* 3. Horizontal Filter Pills */}
        <div className="px-4">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {[
              { id: 'all', label: 'Semua', count: goals.length },
              { id: 'active', label: 'Dalam Proses', count: goals.length - completedGoalsCount },
              { id: 'completed', label: 'Tercapai', count: completedGoalsCount },
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

        {/* 4. Mobile Native Goal Card List */}
        <div className="px-4 space-y-3">
          {filteredGoals.length === 0 ? (
            <div className="py-10 px-4 text-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-2.5">
              <div className="h-10 w-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center mx-auto">
                <Target className="h-5 w-5" />
              </div>
              <p className="text-xs font-semibold text-zinc-900 dark:text-white">
                Belum ada target tabungan dalam kategori ini
              </p>
              <Button onClick={() => handleOpenModal()} size="sm" variant="primary">
                Buat Target Baru
              </Button>
            </div>
          ) : (
            filteredGoals.map((goal) => {
              const percentage =
                goal.target_amount > 0
                  ? Math.min(100, Math.round((goal.current_amount / goal.target_amount) * 100))
                  : 0;
              const remaining = Math.max(0, goal.target_amount - goal.current_amount);
              const isCompleted = goal.current_amount >= goal.target_amount;

              return (
                <div
                  key={goal.id}
                  className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs font-bold text-zinc-950 dark:text-white">
                          {goal.name}
                        </h3>
                        {isCompleted && (
                          <Badge variant="success" size="sm">
                            <CheckCircle2 className="h-3 w-3 mr-0.5" />
                            <span>Tercapai</span>
                          </Badge>
                        )}
                      </div>
                      {goal.target_date && (
                        <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
                          Tenggat: {formatTanggal(goal.target_date)}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenModal(goal)}
                        aria-label="Ubah target"
                        className="p-1 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setGoalToDelete(goal)}
                        aria-label="Hapus target"
                        className="p-1 rounded text-zinc-400 hover:text-rose-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-baseline justify-between text-xs">
                      <span className="font-bold font-mono text-zinc-950 dark:text-white">
                        {formatAmount(goal.current_amount)}
                      </span>
                      <span className="font-mono text-zinc-400 text-[11px]">
                        Target: {formatAmount(goal.target_amount)}
                      </span>
                    </div>

                    <ProgressBar value={percentage} variant="amber" />

                    <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-0.5">
                      <span>{percentage}% tercapai</span>
                      <span className="font-mono font-medium text-amber-600 dark:text-amber-400">
                        {isCompleted ? 'Target Terpenuhi!' : `Kurang ${formatAmount(remaining)}`}
                      </span>
                    </div>
                  </div>

                  {/* Quick Action Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs font-semibold justify-center rounded-xl"
                    onClick={() => handleOpenContribute(goal)}
                  >
                    <Coins className="h-3.5 w-3.5 mr-1 text-amber-500" />
                    <span>Setor Tabungan</span>
                  </Button>
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
              Target Tabungan
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Rencana akumulasi dana masa depan dan target impian finansial Anda.
            </p>
          </div>

          <Button
            onClick={() => handleOpenModal()}
            variant="primary"
            size="sm"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            <span>Tambah Target</span>
          </Button>
        </div>

        {/* Goals Grid */}
        {goals.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-10 text-center space-y-3">
            <div className="h-10 w-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center mx-auto">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-950 dark:text-white">
                Belum ada target tabungan yang dibuat
              </p>
              <p className="text-xs text-zinc-400 mt-0.5">
                Tetapkan tujuan tabungan seperti pembelian aset atau dana darurat.
              </p>
            </div>
            <Button variant="primary" size="sm" onClick={() => handleOpenModal()}>
              Buat Target Tabungan
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {goals.map((goal) => {
              const percentage =
                goal.target_amount > 0
                  ? Math.min(100, Math.round((goal.current_amount / goal.target_amount) * 100))
                  : 0;
              const remaining = Math.max(0, goal.target_amount - goal.current_amount);
              const isCompleted = goal.current_amount >= goal.target_amount;

              return (
                <div
                  key={goal.id}
                  className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs ring-1 ring-zinc-950/5 dark:ring-white/5 p-5 space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-zinc-950 dark:text-white">
                            {goal.name}
                          </h3>
                          {isCompleted && (
                            <Badge variant="success" size="sm">
                              <CheckCircle2 className="h-3 w-3" />
                              <span>Tercapai</span>
                            </Badge>
                          )}
                        </div>
                        {goal.target_date && (
                          <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
                            Tenggat: {formatTanggal(goal.target_date)}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenModal(goal)}
                          aria-label="Ubah target"
                          className="p-1 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setGoalToDelete(goal)}
                          aria-label="Hapus target"
                          className="p-1 rounded text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {goal.description && (
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {goal.description}
                      </p>
                    )}

                    {/* Progress bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-zinc-500">
                          Terkumpul: {formatAmount(goal.current_amount)}
                        </span>
                        <span className="font-bold text-amber-600 dark:text-amber-400">
                          {percentage}%
                        </span>
                      </div>
                      <ProgressBar value={percentage} variant="amber" />
                    </div>

                    {/* Numbers Grid */}
                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 text-xs">
                      <div>
                        <span className="text-zinc-400 block text-[10px]">Plafon Target</span>
                        <span className="font-mono font-bold text-zinc-900 dark:text-white">
                          {formatAmount(goal.target_amount)}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-zinc-400 block text-[10px]">Kurang</span>
                        <span className="font-mono font-bold text-zinc-900 dark:text-white">
                          {formatAmount(remaining)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Deposit Action Button */}
                  <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs font-medium justify-center"
                      onClick={() => handleOpenContribute(goal)}
                    >
                      <Coins className="h-3.5 w-3.5 mr-1 text-amber-500" />
                      <span>Setor Simpanan</span>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add / Edit Goal Modal */}
      <Dialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        icon={<Target className="h-5 w-5" />}
        iconVariant="amber"
        badge={editingGoal ? 'Edit' : 'Baru'}
        title={editingGoal ? 'Ubah Target Tabungan' : 'Tambah Target Tabungan'}
        description="Tetapkan sasaran akumulasi dana untuk kebutuhan jangka panjang."
        maxWidth="sm"
      >
        <form onSubmit={handleSaveGoal} className="space-y-4">
          <Input
            label="Nama Target"
            placeholder="Contoh: Laptop Baru, Dana Darurat"
            required
            leadingIcon={<Target className="h-4 w-4" />}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
            }}
            error={errors.name}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <RupiahInput
              label="Nominal Target"
              required
              placeholder="0"
              value={targetAmountStr}
              onChange={(num, raw) => {
                setTargetAmountStr(raw);
                if (errors.targetAmount) setErrors((prev) => ({ ...prev, targetAmount: '' }));
              }}
              error={errors.targetAmount}
              quickAmounts={[1000000, 5000000, 10000000, 25000000]}
            />
            <RupiahInput
              label="Saldo Saat Ini"
              placeholder="0"
              value={currentAmountStr}
              onChange={(num, raw) => {
                setCurrentAmountStr(raw);
                if (errors.currentAmount) setErrors((prev) => ({ ...prev, currentAmount: '' }));
              }}
              error={errors.currentAmount}
            />
          </div>

          <Input
            label="Target Tanggal (Opsional)"
            type="date"
            leadingIcon={<Calendar className="h-4 w-4" />}
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
          />

          <Textarea
            label="Deskripsi / Catatan Tambahan"
            placeholder="Catatan mengenai tujuan atau rencana penyisihan..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
          />

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary" disabled={isSaving} isLoading={isSaving}>
              Simpan Target
            </Button>
          </DialogFooter>
        </form>
      </Dialog>

      {/* Quick Contribute (Deposit) Modal */}
      <Dialog
        isOpen={!!contributeTargetGoal}
        onClose={() => setContributeTargetGoal(null)}
        icon={<Coins className="h-5 w-5" />}
        iconVariant="amber"
        badge="Setor"
        title="Setor Simpanan Target"
        description={
          contributeTargetGoal
            ? `Tambahkan saldo simpanan ke target "${contributeTargetGoal.name}". Transaksi pengeluaran penabung akan otomatis dibuat.`
            : ''
        }
        maxWidth="sm"
      >
        <form onSubmit={handleConfirmContribute} className="space-y-4">
          <RupiahInput
            label="Jumlah Setoran"
            required
            placeholder="0"
            value={depositAmountStr}
            onChange={(num, raw) => {
              setDepositAmountStr(raw);
              if (depositError) setDepositError('');
            }}
            error={depositError}
            quickAmounts={[100000, 250000, 500000, 1000000]}
          />

          <Select
            label="Sumber Dana Rekening"
            required
            leadingIcon={<Wallet className="h-4 w-4" />}
            value={depositAccountId}
            onChange={(e) => setDepositAccountId(e.target.value)}
          >
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.name} ({acc.type})
              </option>
            ))}
          </Select>

          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setContributeTargetGoal(null)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isContributing}
              isLoading={isContributing}
            >
              Konfirmasi Setor
            </Button>
          </DialogFooter>
        </form>
      </Dialog>

      {/* Confirm Delete Goal Dialog */}
      {goalToDelete && (
        <ConfirmDialog
          isOpen={!!goalToDelete}
          onClose={() => setGoalToDelete(null)}
          onConfirm={async () => {
            await deleteGoal(goalToDelete.id);
            setGoalToDelete(null);
          }}
          title="Hapus Target Tabungan?"
          description={
            <span>
              Target tabungan <strong>&quot;{goalToDelete.name}&quot;</strong> akan dihapus permanen.
            </span>
          }
          confirmText="Hapus"
          cancelText="Batal"
        />
      )}
    </div>
  );
}
