'use client';

import React, { useState, useEffect } from 'react';
import { HandCoins, ArrowUpRight, ArrowDownLeft, Calendar, User, Phone, Wallet, AlertCircle } from 'lucide-react';
import { Dialog, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RupiahInput } from '@/components/ui/rupiah-input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useDompetKu } from '@/lib/store';
import { Debt, DebtType } from '@/types';
import { cn } from '@/lib/utils/formatters';

interface DebtModalProps {
  isOpen: boolean;
  onClose: () => void;
  debtToEdit?: Debt | null;
  defaultType?: DebtType;
}

export function DebtModal({
  isOpen,
  onClose,
  debtToEdit,
  defaultType = 'receivable',
}: DebtModalProps) {
  const { accounts, addDebt, updateDebt } = useDompetKu();

  const [type, setType] = useState<DebtType>(defaultType);
  const [personName, setPersonName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [dueDate, setDueDate] = useState('');
  const [accountId, setAccountId] = useState('');
  const [notes, setNotes] = useState('');
  const [syncInitialTx, setSyncInitialTx] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (debtToEdit) {
      setType(debtToEdit.type);
      setPersonName(debtToEdit.person_name);
      setPhoneNumber(debtToEdit.phone_number || '');
      setTotalAmount(debtToEdit.total_amount);
      setDueDate(debtToEdit.due_date || '');
      setAccountId(debtToEdit.account_id || '');
      setNotes(debtToEdit.notes || '');
      setSyncInitialTx(false);
    } else {
      setType(defaultType);
      setPersonName('');
      setPhoneNumber('');
      setTotalAmount(0);
      setDueDate('');
      setAccountId(accounts[0]?.id || '');
      setNotes('');
      setSyncInitialTx(false);
    }
    setErrors({});
  }, [debtToEdit, defaultType, accounts, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!personName.trim()) {
      newErrors.personName = 'Nama pihak/orang wajib diisi.';
    }

    if (totalAmount <= 0) {
      newErrors.totalAmount = 'Nominal harus lebih besar dari Rp 0.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (debtToEdit) {
      updateDebt(debtToEdit.id, {
        type,
        person_name: personName.trim(),
        phone_number: phoneNumber.trim() || undefined,
        total_amount: totalAmount,
        due_date: dueDate || undefined,
        account_id: accountId || undefined,
        notes: notes.trim() || undefined,
      });
    } else {
      addDebt(
        {
          type,
          person_name: personName.trim(),
          phone_number: phoneNumber.trim() || undefined,
          total_amount: totalAmount,
          due_date: dueDate || undefined,
          account_id: accountId || undefined,
          notes: notes.trim() || undefined,
        },
        syncInitialTx
      );
    }

    onClose();
  };

  const isReceivable = type === 'receivable';

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={debtToEdit ? 'Ubah Catatan Utang / Piutang' : 'Catat Utang / Piutang Baru'}
      description={
        debtToEdit
          ? 'Perbarui rincian catatan pinjaman Anda.'
          : 'Pantau dana yang dipinjamkan atau kewajiban pembayaran Anda.'
      }
      icon={<HandCoins className="h-5 w-5" />}
      iconVariant={isReceivable ? 'emerald' : 'amber'}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Toggle Type Selector */}
        {!debtToEdit && (
          <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
            <button
              type="button"
              onClick={() => setType('receivable')}
              className={cn(
                'flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer',
                isReceivable
                  ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
              )}
            >
              <ArrowDownLeft className="h-3.5 w-3.5 text-emerald-500" />
              <span>Piutang (Saya Pinjamkan)</span>
            </button>
            <button
              type="button"
              onClick={() => setType('debt')}
              className={cn(
                'flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer',
                !isReceivable
                  ? 'bg-white dark:bg-zinc-900 text-rose-600 dark:text-rose-400 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
              )}
            >
              <ArrowUpRight className="h-3.5 w-3.5 text-rose-500" />
              <span>Utang (Saya Meminjam)</span>
            </button>
          </div>
        )}

        {/* Info banner */}
        <div
          className={cn(
            'p-3 rounded-xl text-xs flex items-start gap-2.5 border',
            isReceivable
              ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300'
              : 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/40 text-rose-800 dark:text-rose-300'
          )}
        >
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>
            {isReceivable
              ? 'Piutang adalah uang Anda yang dipinjam oleh orang lain dan perlu ditagih kembali.'
              : 'Utang adalah kewajiban pembayaran yang perlu Anda bayarkan ke pihak lain.'}
          </span>
        </div>

        {/* Nama Pihak */}
        <Input
          label={isReceivable ? 'Nama Peminjam (Debitur)' : 'Nama Pemberi Pinjaman / Lembaga'}
          placeholder={isReceivable ? 'Contoh: Andi Pratama, Bu Siti' : 'Contoh: Cicilan Laptop, Rian'}
          value={personName}
          onChange={(e) => setPersonName(e.target.value)}
          error={errors.personName}
          leadingIcon={<User className="h-4 w-4" />}
          required
        />

        {/* Nominal Pinjaman */}
        <RupiahInput
          label="Total Nominal Pinjaman"
          value={totalAmount}
          onChange={(val) => setTotalAmount(val)}
          error={errors.totalAmount}
          placeholder="0"
          required
          quickAmounts={[50000, 100000, 250000, 500000, 1000000]}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Tanggal Jatuh Tempo */}
          <Input
            type="date"
            label="Tanggal Jatuh Tempo (Opsional)"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            leadingIcon={<Calendar className="h-4 w-4" />}
          />

          {/* Nomor WhatsApp (Opsional) */}
          <Input
            type="tel"
            label="Nomor WhatsApp (Opsional)"
            placeholder="Contoh: 081234567890"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            leadingIcon={<Phone className="h-4 w-4" />}
            helperText="Untuk kirim pengingat tagihan santun"
          />
        </div>

        {/* Rekening Terkait */}
        <Select
          label="Rekening Terkait (Opsional)"
          value={accountId}
          onChange={(e) => setAccountId(e.target.value)}
          leadingIcon={<Wallet className="h-4 w-4" />}
          options={[
            { label: '-- Tidak Terikat Rekening Khusus --', value: '' },
            ...accounts.map((a) => ({
              label: `${a.name} (${a.type})`,
              value: a.id,
            })),
          ]}
        />

        {/* Sinkronisasi Transaksi Awal (Hanya untuk buat baru dan bila rekening dipilih) */}
        {!debtToEdit && accountId && (
          <label className="flex items-start gap-2.5 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 cursor-pointer">
            <input
              type="checkbox"
              checked={syncInitialTx}
              onChange={(e) => setSyncInitialTx(e.target.checked)}
              className="mt-0.5 rounded border-zinc-300 text-amber-500 focus:ring-amber-400"
            />
            <div className="text-xs">
              <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                {isReceivable
                  ? 'Catat uang keluar dari rekening sekarang?'
                  : 'Catat uang masuk ke rekening sekarang?'}
              </p>
              <p className="text-zinc-500 dark:text-zinc-400 mt-0.5">
                {isReceivable
                  ? 'Membuat transaksi pengeluaran dan mengurangi saldo rekening terpilih.'
                  : 'Membuat transaksi pemasukan dan menambah saldo rekening terpilih.'}
              </p>
            </div>
          </label>
        )}

        {/* Catatan / Keterangan */}
        <Textarea
          label="Catatan Tambahan (Opsional)"
          placeholder="Catatan keperluan pinjaman atau kesepakatan cicilan..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
        />

        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" variant="primary">
            {debtToEdit ? 'Simpan Perubahan' : 'Simpan Catatan'}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
