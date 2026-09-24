'use client';

import React, { useState } from 'react';
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
import { formatRupiah, formatTanggal } from '@/lib/utils/formatters';

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
      {/* Filament Page Header */}
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

                  {/* Numbers Grid (PRD Bagian 33) */}
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

      {/* Add / Edit Goal Modal (PRD Bagian 34) */}
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
            label="Tanggal Target Selesai (Opsional)"
            type="date"
            leadingIcon={<Calendar className="h-4 w-4" />}
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
          />

          <Textarea
            label="Keterangan / Rencana Alokasi"
            placeholder="Opsional"
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

      {/* Quick Deposit Modal */}
      {contributeTargetGoal && (
        <Dialog
          isOpen={!!contributeTargetGoal}
          onClose={() => setContributeTargetGoal(null)}
          icon={<Coins className="h-5 w-5" />}
          iconVariant="emerald"
          badge="Setor Tabungan"
          title={`Setor ke: ${contributeTargetGoal.name}`}
          description="Tambahkan nominal tabungan dari rekening Anda."
          maxWidth="sm"
        >
          <form onSubmit={handleConfirmContribute} className="space-y-4">
            <RupiahInput
              label="Nominal Setoran"
              required
              placeholder="0"
              value={depositAmountStr}
              onChange={(num, raw) => {
                setDepositAmountStr(raw);
                setDepositError('');
              }}
              error={depositError}
              quickAmounts={[50000, 100000, 250000, 500000, 1000000]}
            />

            <Select
              label="Rekening Sumber Dana"
              required
              leadingIcon={<Wallet className="h-4 w-4" />}
              value={depositAccountId}
              onChange={(e) => setDepositAccountId(e.target.value)}
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name}
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
              <Button type="submit" variant="primary" disabled={isContributing} isLoading={isContributing}>
                Simpan Setoran
              </Button>
            </DialogFooter>
          </form>
        </Dialog>
      )}

      {/* Confirm Delete Goal */}
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
              Target <strong>&quot;{goalToDelete.name}&quot;</strong> akan dihapus dari rencana tabungan.
            </span>
          }
          confirmText="Hapus"
          cancelText="Batal"
        />
      )}
    </div>
  );
}
