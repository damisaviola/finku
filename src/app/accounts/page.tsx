'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  Landmark,
  Banknote,
  Wallet,
  Building2,
  Edit2,
  Trash2,
  FileText,
  Coins,
  CreditCard,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RupiahInput } from '@/components/ui/rupiah-input';
import { Select } from '@/components/ui/select';
import { Dialog, DialogFooter } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Badge } from '@/components/ui/badge';
import { useDompetKu } from '@/lib/store';
import { Account, AccountType } from '@/types';
import { calculateAccountBalance } from '@/lib/calculations/finance';
import { formatRupiah } from '@/lib/utils/formatters';

export default function AccountsPage() {
  const {
    accounts,
    transactions,
    addAccount,
    updateAccount,
    deleteAccount,
    formatAmount,
  } = useDompetKu();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [accountToDelete, setAccountToDelete] = useState<Account | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('Bank');
  const [accountNumber, setAccountNumber] = useState('');
  const [initialBalanceStr, setInitialBalanceStr] = useState('');
  const [currency, setCurrency] = useState('IDR');
  const [color, setColor] = useState('#3b82f6');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleOpenModal = (acc?: Account) => {
    setErrors({});
    if (acc) {
      setEditingAccount(acc);
      setName(acc.name);
      setType(acc.type);
      setAccountNumber(acc.account_number || '');
      setInitialBalanceStr(String(acc.initial_balance));
      setCurrency(acc.currency);
      setColor(acc.color || '#3b82f6');
    } else {
      setEditingAccount(null);
      setName('');
      setType('Bank');
      setAccountNumber('');
      setInitialBalanceStr('');
      setCurrency('IDR');
      setColor('#3b82f6');
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Nama rekening wajib diisi.';
    }

    const initialBalance = parseFloat(initialBalanceStr) || 0;
    if (initialBalance < 0) {
      newErrors.initialBalance = 'Saldo awal tidak boleh negatif.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const resolvedAccountNumber = type === 'Bank' && accountNumber.trim() ? accountNumber.trim() : undefined;

    if (editingAccount) {
      updateAccount(editingAccount.id, {
        name: name.trim(),
        type,
        account_number: resolvedAccountNumber,
        initial_balance: initialBalance,
        currency,
        color,
      });
    } else {
      addAccount({
        name: name.trim(),
        type,
        account_number: resolvedAccountNumber,
        initial_balance: initialBalance,
        currency,
        color,
        is_active: true,
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-5">
      {/* Filament Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-950 dark:text-white">
            Rekening & Dompet
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Daftar seluruh rekening bank, kas fisik, dan dompet digital Anda.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/statement">
            <Button variant="secondary" size="sm" className="gap-1.5">
              <FileText className="h-3.5 w-3.5 text-amber-500" />
              <span>Rekening Koran</span>
            </Button>
          </Link>
          <Button
            onClick={() => handleOpenModal()}
            variant="primary"
            size="sm"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            <span>Tambah Rekening</span>
          </Button>
        </div>
      </div>

      {/* Filament Accounts Grid */}
      {accounts.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/40">
          <div className="h-12 w-12 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400 mx-auto flex items-center justify-center mb-3">
            <Wallet className="h-6 w-6" />
          </div>
          <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Belum ada rekening dibuat
          </h4>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
            Mulai tambahkan rekening bank, dompet digital, atau uang tunai untuk mencatat transaksi keuangan Anda.
          </p>
          <div className="mt-4 flex items-center justify-center">
            <Button onClick={() => handleOpenModal()} size="sm" variant="primary">
              <Plus className="h-3.5 w-3.5 mr-1" />
              <span>Tambah Rekening Baru</span>
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map((acc) => {
          const currentBalance = calculateAccountBalance(acc, transactions);

          const incomeTotal = transactions
            .filter((t) => t.type === 'income' && t.account_id === acc.id)
            .reduce((s, t) => s + t.amount, 0);

          const expenseTotal = transactions
            .filter((t) => t.type === 'expense' && t.account_id === acc.id)
            .reduce((s, t) => s + t.amount, 0);

          const transferOutTotal = transactions
            .filter((t) => t.type === 'transfer' && t.account_id === acc.id)
            .reduce((s, t) => s + t.amount, 0);

          const transferInTotal = transactions
            .filter((t) => t.type === 'transfer' && t.destination_account_id === acc.id)
            .reduce((s, t) => s + t.amount, 0);

          return (
            <div
              key={acc.id}
              className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs ring-1 ring-zinc-950/5 dark:ring-white/5 p-5 space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-10 w-10 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-xs"
                      style={{ backgroundColor: acc.color || '#3b82f6' }}
                    >
                      {acc.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-zinc-950 dark:text-white">
                        {acc.name}
                      </h3>
                      <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                        <Badge variant="default" size="sm" dot={false}>
                          {acc.type}
                        </Badge>
                        {acc.type === 'Bank' && acc.account_number && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-200/60 dark:border-zinc-700/60">
                            <CreditCard className="h-3 w-3 text-zinc-400" />
                            <span>{acc.account_number}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenModal(acc)}
                      aria-label="Ubah rekening"
                      className="p-1 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    {accounts.length > 1 && (
                      <button
                        onClick={() => setAccountToDelete(acc)}
                        aria-label="Hapus rekening"
                        className="p-1 rounded text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
                  <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider block">
                    Saldo Saat Ini
                  </span>
                  <div className="text-xl font-bold font-mono text-zinc-950 dark:text-white mt-0.5">
                    {formatAmount(currentBalance)}
                  </div>
                </div>
              </div>

              {/* Filament Details Breakdown */}
              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-zinc-400 block text-[10px]">Saldo Awal</span>
                  <span className="font-mono text-zinc-700 dark:text-zinc-300 font-medium">
                    {formatAmount(acc.initial_balance)}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-400 block text-[10px]">Pemasukan</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-medium">
                    +{formatAmount(incomeTotal + transferInTotal)}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-400 block text-[10px]">Pengeluaran</span>
                  <span className="font-mono text-rose-600 dark:text-rose-400 font-medium">
                    -{formatAmount(expenseTotal)}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-400 block text-[10px]">Mutasi Keluar</span>
                  <span className="font-mono text-zinc-600 dark:text-zinc-400 font-medium">
                    -{formatAmount(transferOutTotal)}
                  </span>
                </div>
              </div>

              <div className="pt-2.5 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
                <Link
                  href={`/statement?accountId=${acc.id}`}
                  className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
                >
                  <FileText className="h-3 w-3" />
                  <span>Rekening Koran</span>
                </Link>
                <span className="text-[10px] text-zinc-400">Ekspor PDF</span>
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* Account Add/Edit Modal */}
      <Dialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        icon={<Landmark className="h-5 w-5" />}
        iconVariant="amber"
        badge={editingAccount ? 'Edit' : 'Baru'}
        title={editingAccount ? 'Ubah Rekening' : 'Tambah Rekening'}
        description="Kelola instrumen rekening perbankan atau dompet digital Anda."
        maxWidth="sm"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Nama Rekening"
            placeholder="Contoh: BCA, Mandiri, Kas Tunai"
            required
            leadingIcon={<Landmark className="h-4 w-4" />}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
            }}
            error={errors.name}
          />

          <Select
            label="Jenis Rekening"
            required
            leadingIcon={<Wallet className="h-4 w-4" />}
            value={type}
            onChange={(e) => setType(e.target.value as AccountType)}
          >
            <option value="Bank">Bank</option>
            <option value="Uang Tunai">Uang Tunai</option>
            <option value="Dompet Digital">Dompet Digital</option>
            <option value="Tabungan">Tabungan</option>
            <option value="Lainnya">Lainnya</option>
          </Select>

          {type === 'Bank' && (
            <Input
              label="Nomor Rekening"
              placeholder="Contoh: 1234567890 (BCA, Mandiri, BRI, dll)"
              leadingIcon={<CreditCard className="h-4 w-4" />}
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              helperText="Nomor rekening bank untuk kemudahan referensi pencatatan Anda."
            />
          )}

          <RupiahInput
            label="Saldo Awal"
            required
            placeholder="0"
            value={initialBalanceStr}
            onChange={(num, raw) => {
              setInitialBalanceStr(raw);
              if (errors.initialBalance) setErrors((prev) => ({ ...prev, initialBalance: '' }));
            }}
            error={errors.initialBalance}
            quickAmounts={[500000, 1000000, 2500000, 5000000]}
          />

          <Select
            label="Mata Uang"
            leadingIcon={<Coins className="h-4 w-4" />}
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          >
            <option value="IDR">Rupiah (IDR)</option>
          </Select>

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary">
              Simpan Rekening
            </Button>
          </DialogFooter>
        </form>
      </Dialog>

      {/* Confirm Delete Account Dialog */}
      {accountToDelete && (
        <ConfirmDialog
          isOpen={!!accountToDelete}
          onClose={() => setAccountToDelete(null)}
          onConfirm={() => {
            deleteAccount(accountToDelete.id);
            setAccountToDelete(null);
          }}
          title="Hapus Rekening?"
          description={
            <span>
              Rekening <strong>&quot;{accountToDelete.name}&quot;</strong> akan dihapus dari sistem.
            </span>
          }
          confirmText="Hapus"
          cancelText="Batal"
        />
      )}
    </div>
  );
}
