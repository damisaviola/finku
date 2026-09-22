'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RupiahInput } from '@/components/ui/rupiah-input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useDompetKu } from '@/lib/store';
import { TransactionType } from '@/types';
import { calculateAccountBalance } from '@/lib/calculations/finance';
import { formatRupiah, cn } from '@/lib/utils/formatters';
import {
  AlertCircle,
  Calendar,
  FileText,
  Wallet,
  Tag,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowRightLeft,
} from 'lucide-react';

export function TransactionModal() {
  const {
    isTransactionModalOpen,
    closeTransactionModal,
    transactionModalInitialType,
    transactionToEdit,
    transactionModalInitialDate,
    accounts,
    categories,
    transactions,
    addTransaction,
    updateTransaction,
  } = useDompetKu();

  const [type, setType] = useState<TransactionType>('expense');
  const [amountStr, setAmountStr] = useState('');
  const [accountId, setAccountId] = useState('');
  const [destAccountId, setDestAccountId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isTransactionModalOpen) {
      setErrors({});
      if (transactionToEdit) {
        setType(transactionToEdit.type);
        setAmountStr(String(transactionToEdit.amount));
        setAccountId(transactionToEdit.account_id);
        setDestAccountId(transactionToEdit.destination_account_id || '');
        setCategoryId(transactionToEdit.category_id || '');
        setDescription(transactionToEdit.description);
        setDate(transactionToEdit.date);
        setNotes(transactionToEdit.notes || '');
      } else {
        setType(transactionModalInitialType);
        setAmountStr('');
        setAccountId(accounts[0]?.id || '');
        setDestAccountId(accounts[1]?.id || '');
        const availableCats = categories.filter(
          (c) => c.type === (transactionModalInitialType === 'income' ? 'income' : 'expense')
        );
        setCategoryId(availableCats[0]?.id || '');
        setDescription('');
        setDate(transactionModalInitialDate || new Date().toISOString().split('T')[0]);
        setNotes('');
      }
    }
  }, [isTransactionModalOpen, transactionModalInitialType, transactionToEdit, transactionModalInitialDate, accounts, categories]);

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    setErrors({});
    if (newType !== 'transfer') {
      const matchCats = categories.filter((c) => c.type === (newType === 'income' ? 'income' : 'expense'));
      if (matchCats.length > 0) {
        setCategoryId(matchCats[0].id);
      }
    }
  };

  const selectedSourceAccount = accounts.find((a) => a.id === accountId);
  const currentSourceBalance = selectedSourceAccount
    ? calculateAccountBalance(selectedSourceAccount, transactions)
    : 0;

  const numericAmount = parseFloat(amountStr) || 0;
  const isInsufficient =
    (type === 'expense' || type === 'transfer') &&
    numericAmount > 0 &&
    numericAmount > currentSourceBalance;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!numericAmount || numericAmount <= 0) {
      newErrors.amount = 'Jumlah harus lebih besar dari nol.';
    }

    if (!accountId) {
      newErrors.accountId = 'Silakan pilih rekening.';
    }

    if (type === 'transfer') {
      if (!destAccountId) {
        newErrors.destAccountId = 'Silakan pilih rekening tujuan.';
      } else if (destAccountId === accountId) {
        newErrors.destAccountId = 'Rekening tujuan tidak boleh sama dengan rekening sumber.';
      }
    } else {
      if (!categoryId) {
        newErrors.categoryId = 'Silakan pilih kategori.';
      }
    }

    if (!description.trim()) {
      newErrors.description = 'Keterangan transaksi wajib diisi.';
    }

    if (!date) {
      newErrors.date = 'Tanggal transaksi wajib diisi.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (isInsufficient) {
      return;
    }

    if (transactionToEdit) {
      updateTransaction(transactionToEdit.id, {
        type,
        amount: numericAmount,
        account_id: accountId,
        destination_account_id: type === 'transfer' ? destAccountId : null,
        category_id: type === 'transfer' ? null : categoryId,
        description: description.trim(),
        date,
        notes: notes.trim(),
      });
    } else {
      const success = addTransaction({
        type,
        amount: numericAmount,
        account_id: accountId,
        destination_account_id: type === 'transfer' ? destAccountId : null,
        category_id: type === 'transfer' ? null : categoryId,
        description: description.trim(),
        date,
        notes: notes.trim(),
      });

      if (!success) return;
    }

    closeTransactionModal();
  };

  const filteredCategories = categories.filter(
    (c) => c.type === (type === 'income' ? 'income' : 'expense')
  );

  return (
    <Dialog
      isOpen={isTransactionModalOpen}
      onClose={closeTransactionModal}
      icon={
        type === 'expense' ? (
          <ArrowDownLeft className="h-5 w-5" />
        ) : type === 'income' ? (
          <ArrowUpRight className="h-5 w-5" />
        ) : (
          <ArrowRightLeft className="h-5 w-5" />
        )
      }
      iconVariant={type === 'expense' ? 'rose' : type === 'income' ? 'emerald' : 'amber'}
      title={
        transactionToEdit
          ? 'Ubah Transaksi'
          : type === 'expense'
          ? 'Tambah Pengeluaran'
          : type === 'income'
          ? 'Tambah Pemasukan'
          : 'Transfer Antar Rekening'
      }
      description={
        transactionToEdit
          ? 'Perbarui formulir transaksi keuangan di bawah ini.'
          : 'Catat transaksi baru untuk memperbarui saldo dan riwayat keuangan Anda.'
      }
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Filament Tabs Toggle */}
        {!transactionToEdit && (
          <div className="flex border-b border-zinc-200 dark:border-zinc-800 -mx-5 sm:-mx-6 px-5 sm:px-6 pb-3">
            <div className="inline-flex p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800/70 border border-zinc-200/60 dark:border-zinc-700/60 w-full sm:w-auto">
              {[
                { id: 'expense', label: 'Pengeluaran', icon: ArrowDownLeft, activeColor: 'text-rose-600 dark:text-rose-400' },
                { id: 'income', label: 'Pemasukan', icon: ArrowUpRight, activeColor: 'text-emerald-600 dark:text-emerald-400' },
                { id: 'transfer', label: 'Transfer', icon: ArrowRightLeft, activeColor: 'text-amber-600 dark:text-amber-400' },
              ].map((tab) => {
                const isCurrent = type === tab.id;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleTypeChange(tab.id as TransactionType)}
                    className={cn(
                      'flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer',
                      isCurrent
                        ? `bg-white dark:bg-zinc-900 ${tab.activeColor} shadow-xs`
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Amount Input */}
        <RupiahInput
          label="Jumlah Transaksi"
          required
          placeholder="0"
          value={amountStr}
          onChange={(num, raw) => {
            setAmountStr(raw);
            if (errors.amount) setErrors((prev) => ({ ...prev, amount: '' }));
          }}
          error={errors.amount}
          quickAmounts={[50000, 100000, 250000, 500000, 1000000]}
        />

        {/* Accounts / Category grid */}
        {type === 'transfer' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Select
              label="Dari Rekening (Sumber)"
              required
              leadingIcon={<Wallet className="h-4 w-4" />}
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              error={errors.accountId}
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({formatRupiah(calculateAccountBalance(acc, transactions))})
                </option>
              ))}
            </Select>

            <Select
              label="Ke Rekening (Tujuan)"
              required
              leadingIcon={<Wallet className="h-4 w-4" />}
              value={destAccountId}
              onChange={(e) => {
                setDestAccountId(e.target.value);
                if (errors.destAccountId) {
                  setErrors((prev) => ({ ...prev, destAccountId: '' }));
                }
              }}
              error={errors.destAccountId}
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id} disabled={acc.id === accountId}>
                  {acc.name} ({formatRupiah(calculateAccountBalance(acc, transactions))})
                </option>
              ))}
            </Select>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Select
              label="Rekening"
              required
              leadingIcon={<Wallet className="h-4 w-4" />}
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              error={errors.accountId}
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({formatRupiah(calculateAccountBalance(acc, transactions))})
                </option>
              ))}
            </Select>

            <Select
              label="Kategori"
              required
              leadingIcon={<Tag className="h-4 w-4" />}
              value={categoryId}
              onChange={(e) => {
                setCategoryId(e.target.value);
                if (errors.categoryId) {
                  setErrors((prev) => ({ ...prev, categoryId: '' }));
                }
              }}
              error={errors.categoryId}
            >
              {filteredCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </Select>
          </div>
        )}

        {/* Real-time Balance Warning (PRD Section 52) */}
        {isInsufficient && selectedSourceAccount && (
          <div className="rounded-xl p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-xs flex items-start gap-2.5 shadow-xs">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
            <div className="space-y-0.5">
              <p className="font-semibold">Saldo tidak mencukupi.</p>
              <p className="text-rose-700 dark:text-rose-400">
                Saldo {selectedSourceAccount.name} saat ini:{' '}
                <strong>{formatRupiah(currentSourceBalance)}</strong>
              </p>
              <p className="text-rose-700 dark:text-rose-400">
                Jumlah transaksi:{' '}
                <strong>{formatRupiah(numericAmount)}</strong>
              </p>
            </div>
          </div>
        )}

        {/* Description & Date Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <Input
            label="Keterangan"
            placeholder="Contoh: Makan Siang, Bensin"
            required
            leadingIcon={<FileText className="h-4 w-4" />}
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              if (errors.description) setErrors((prev) => ({ ...prev, description: '' }));
            }}
            error={errors.description}
          />
          <Input
            label="Tanggal"
            type="date"
            required
            leadingIcon={<Calendar className="h-4 w-4" />}
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              if (errors.date) setErrors((prev) => ({ ...prev, date: '' }));
            }}
            error={errors.date}
          />
        </div>

        {/* Notes */}
        <Textarea
          label="Catatan Tambahan"
          placeholder="Opsional (misal nomor referensi transaksi, rekan belanja)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
        />

        {/* Modal Action Footer */}
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={closeTransactionModal}>
            Batal
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isInsufficient}
          >
            {transactionToEdit
              ? 'Simpan Perubahan'
              : type === 'transfer'
              ? 'Proses Transfer'
              : 'Simpan Transaksi'}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
