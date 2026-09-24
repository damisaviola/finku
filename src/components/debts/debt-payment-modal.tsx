'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle2, Coins, Calendar, Wallet, FileText, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { Dialog, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RupiahInput } from '@/components/ui/rupiah-input';
import { Select } from '@/components/ui/select';
import { useDompetKu } from '@/lib/store';
import { Debt } from '@/types';
import { formatRupiah, cn } from '@/lib/utils/formatters';

interface DebtPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  debt: Debt | null;
}

export function DebtPaymentModal({ isOpen, onClose, debt }: DebtPaymentModalProps) {
  const { accounts, recordDebtPayment } = useDompetKu();

  const [amount, setAmount] = useState<number>(0);
  const [paymentDate, setPaymentDate] = useState<string>('');
  const [accountId, setAccountId] = useState<string>('');
  const [syncWithAccount, setSyncWithAccount] = useState<boolean>(true);
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const remaining = debt ? Math.max(0, debt.total_amount - debt.paid_amount) : 0;
  const isReceivable = debt?.type === 'receivable';

  useEffect(() => {
    setIsSaving(false);
    if (debt) {
      const rem = Math.max(0, debt.total_amount - debt.paid_amount);
      setAmount(rem); // Default to full remaining balance
      setPaymentDate(new Date().toISOString().split('T')[0]);
      setAccountId(debt.account_id || accounts[0]?.id || '');
      setSyncWithAccount(true);
      setNotes('');
      setError('');
    }
  }, [debt, accounts, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!debt) return;

    if (amount <= 0) {
      setError('Nominal pembayaran harus lebih besar dari Rp 0.');
      return;
    }

    if (amount > remaining) {
      setError(`Nominal pembayaran tidak boleh melebihi sisa tagihan (${formatRupiah(remaining)}).`);
      return;
    }

    setIsSaving(true);
    try {
      const success = await recordDebtPayment(
        debt.id,
        amount,
        paymentDate || new Date().toISOString().split('T')[0],
        accountId || null,
        notes.trim() || undefined,
        syncWithAccount
      );

      if (success) {
        onClose();
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (!debt) return null;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={isReceivable ? 'Terima Pelunasan / Cicilan' : 'Bayar Cicilan / Pelunasan Utang'}
      description={`Catat riwayat pembayaran untuk tagihan ${debt.person_name}.`}
      icon={<Coins className="h-5 w-5" />}
      iconVariant={isReceivable ? 'emerald' : 'amber'}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Info Tagihan Card */}
        <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-500 dark:text-zinc-400">Pihak Terkait:</span>
            <span className="font-bold text-zinc-900 dark:text-zinc-100">{debt.person_name}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-500 dark:text-zinc-400">Total Pinjaman:</span>
            <span className="font-semibold text-zinc-700 dark:text-zinc-300">
              {formatRupiah(debt.total_amount)}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-500 dark:text-zinc-400">Sudah Dibayar:</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              {formatRupiah(debt.paid_amount)}
            </span>
          </div>
          <div className="pt-1.5 border-t border-zinc-200 dark:border-zinc-700 flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
              Sisa Tagihan Saat Ini:
            </span>
            <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
              {formatRupiah(remaining)}
            </span>
          </div>
        </div>

        {/* Input Nominal Pembayaran */}
        <div className="space-y-1.5">
          <RupiahInput
            label="Nominal Pembayaran"
            value={amount}
            onChange={(val) => {
              setAmount(val);
              if (error) setError('');
            }}
            error={error}
            placeholder="0"
            required
          />
          {remaining > 0 && amount !== remaining && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setAmount(remaining)}
                className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
              >
                Lunasi Sisa Tagihan ({formatRupiah(remaining)})
              </button>
            </div>
          )}
        </div>

        {/* Tanggal Pembayaran */}
        <Input
          type="date"
          label="Tanggal Pembayaran"
          value={paymentDate}
          onChange={(e) => setPaymentDate(e.target.value)}
          leadingIcon={<Calendar className="h-4 w-4" />}
          required
        />

        {/* Pilihan Rekening */}
        <Select
          label={isReceivable ? 'Rekening Penerima Uang' : 'Rekening Sumber Pembayaran'}
          value={accountId}
          onChange={(e) => setAccountId(e.target.value)}
          leadingIcon={<Wallet className="h-4 w-4" />}
          options={[
            { label: '-- Tidak Terhubung Rekening --', value: '' },
            ...accounts.map((a) => ({
              label: `${a.name} (${a.type})`,
              value: a.id,
            })),
          ]}
        />

        {/* Checkbox Sinkronisasi Transaksi */}
        {accountId && (
          <label className="flex items-start gap-2.5 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 cursor-pointer">
            <input
              type="checkbox"
              checked={syncWithAccount}
              onChange={(e) => setSyncWithAccount(e.target.checked)}
              className="mt-0.5 rounded border-zinc-300 text-amber-500 focus:ring-amber-400"
            />
            <div className="text-xs">
              <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                {isReceivable
                  ? 'Tambah saldo rekening & catat transaksi pemasukan'
                  : 'Kurangi saldo rekening & catat transaksi pengeluaran'}
              </p>
              <p className="text-zinc-500 dark:text-zinc-400 mt-0.5">
                {isReceivable
                  ? 'Otomatis menambah saldo rekening yang dipilih sejumlah dana yang diterima.'
                  : 'Otomatis memotong saldo rekening yang dipilih untuk membayar utang.'}
              </p>
            </div>
          </label>
        )}

        {/* Catatan Pembayaran */}
        <Input
          label="Catatan Pembayaran (Opsional)"
          placeholder="Contoh: Transfer BCA, Diberikan tunai, dsb."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          leadingIcon={<FileText className="h-4 w-4" />}
        />

        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" variant="primary" disabled={isSaving} isLoading={isSaving}>
            <CheckCircle2 className="h-4 w-4 mr-1.5" />
            <span>Simpan Pembayaran</span>
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
