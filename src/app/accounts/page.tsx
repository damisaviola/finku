'use client';

import React, { useState, useMemo } from 'react';
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
  ChevronLeft,
  Eye,
  EyeOff,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
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
import { calculateAccountBalance, calculateTotalBalance } from '@/lib/calculations/finance';
import { formatRupiah, cn } from '@/lib/utils/formatters';

export default function AccountsPage() {
  const {
    accounts,
    transactions,
    addAccount,
    updateAccount,
    deleteAccount,
    formatAmount,
    isPrivacyMode,
    togglePrivacyMode,
    openTransactionModal,
  } = useDompetKu();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [accountToDelete, setAccountToDelete] = useState<Account | null>(null);

  // Type filter for mobile
  const [activeTypeTab, setActiveTypeTab] = useState<string>('all');

  // Form State
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('Bank');
  const [accountNumber, setAccountNumber] = useState('');
  const [initialBalanceStr, setInitialBalanceStr] = useState('');
  const [currency, setCurrency] = useState('IDR');
  const [color, setColor] = useState('#3b82f6');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Total balance across all accounts
  const totalBalance = useMemo(() => {
    return calculateTotalBalance(accounts, transactions);
  }, [accounts, transactions]);

  // Accounts with balances
  const accountsWithBalances = useMemo(() => {
    return accounts.map((acc) => {
      const balance = calculateAccountBalance(acc, transactions);
      return { ...acc, currentBalance: balance };
    });
  }, [accounts, transactions]);

  // Breakdown by type
  const typeMetrics = useMemo(() => {
    const bankAccs = accountsWithBalances.filter((a) => a.type === 'Bank');
    const ewalletAccs = accountsWithBalances.filter((a) => a.type === 'Dompet Digital');
    const cashAccs = accountsWithBalances.filter((a) => a.type === 'Uang Tunai');

    return {
      bankTotal: bankAccs.reduce((s, a) => s + a.currentBalance, 0),
      bankCount: bankAccs.length,
      ewalletTotal: ewalletAccs.reduce((s, a) => s + a.currentBalance, 0),
      ewalletCount: ewalletAccs.length,
      cashTotal: cashAccs.reduce((s, a) => s + a.currentBalance, 0),
      cashCount: cashAccs.length,
    };
  }, [accountsWithBalances]);

  // Filtered accounts for display
  const filteredAccounts = useMemo(() => {
    if (activeTypeTab === 'all') return accountsWithBalances;
    return accountsWithBalances.filter((a) => a.type === activeTypeTab);
  }, [accountsWithBalances, activeTypeTab]);

  const handleOpenModal = (acc?: Account) => {
    setErrors({});
    setIsSaving(false);
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

  const handleSave = async (e: React.FormEvent) => {
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

    setIsSaving(true);
    try {
      if (editingAccount) {
        const success = await updateAccount(editingAccount.id, {
          name: name.trim(),
          type,
          account_number: resolvedAccountNumber,
          initial_balance: initialBalance,
          currency,
          color,
        });
        if (!success) return;
      } else {
        const success = await addAccount({
          name: name.trim(),
          type,
          account_number: resolvedAccountNumber,
          initial_balance: initialBalance,
          currency,
          color,
          is_active: true,
        });
        if (!success) return;
      }

      setIsModalOpen(false);
    } finally {
      setIsSaving(false);
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

          {/* Top Bar: Back Button, Title, and Actions */}
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
                  Rekening Saya
                </h1>
                <p className="text-[11px] text-white/80 font-medium leading-none mt-0.5">
                  {accounts.length} Akun Terdaftar
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <Link
                href="/statement"
                className="h-8 w-8 rounded-full bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/25 active:scale-95 transition-all"
                title="Rekening Koran"
              >
                <FileText className="h-4 w-4" />
              </Link>
              <button
                onClick={() => handleOpenModal()}
                type="button"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-400 text-zinc-950 font-bold text-xs shadow-md hover:bg-amber-300 active:scale-95 transition-all"
              >
                <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                <span>Rekening</span>
              </button>
            </div>
          </div>
        </div>

        {/* 2. Floating Mobile Hero Net Worth Card */}
        <div className="relative z-20 px-4 -mt-10">
          <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-lg shadow-zinc-950/5 dark:shadow-black/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                Total Kekayaan Bersih (Seluruh Rekening)
              </span>
              <button
                onClick={togglePrivacyMode}
                className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
                title={isPrivacyMode ? 'Tampilkan Saldo' : 'Sembunyikan Saldo'}
              >
                {isPrivacyMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <div className="text-2xl font-black font-mono tracking-tight text-zinc-950 dark:text-white">
              {isPrivacyMode ? '••••••••' : formatAmount(totalBalance)}
            </div>

            {/* Quick Breakdown Pills */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/80 text-center">
              <div className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
                <p className="text-[10px] text-zinc-400 font-medium">Bank</p>
                <p className="text-xs font-bold font-mono text-zinc-900 dark:text-white mt-0.5 truncate">
                  {isPrivacyMode ? '•••' : formatAmount(typeMetrics.bankTotal)}
                </p>
              </div>

              <div className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
                <p className="text-[10px] text-zinc-400 font-medium">E-Wallet</p>
                <p className="text-xs font-bold font-mono text-zinc-900 dark:text-white mt-0.5 truncate">
                  {isPrivacyMode ? '•••' : formatAmount(typeMetrics.ewalletTotal)}
                </p>
              </div>

              <div className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
                <p className="text-[10px] text-zinc-400 font-medium">Kas Tunai</p>
                <p className="text-xs font-bold font-mono text-zinc-900 dark:text-white mt-0.5 truncate">
                  {isPrivacyMode ? '•••' : formatAmount(typeMetrics.cashTotal)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Horizontal Filter Pills */}
        <div className="px-4">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {[
              { id: 'all', label: 'Semua', count: accounts.length },
              { id: 'Bank', label: 'Bank', count: typeMetrics.bankCount },
              { id: 'Dompet Digital', label: 'E-Wallet', count: typeMetrics.ewalletCount },
              { id: 'Uang Tunai', label: 'Kas Tunai', count: typeMetrics.cashCount },
            ].map((tab) => {
              const isActive = activeTypeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTypeTab(tab.id)}
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

        {/* 4. Mobile Native Card List */}
        <div className="px-4 space-y-3">
          {filteredAccounts.length === 0 ? (
            <div className="py-10 px-4 text-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-2.5">
              <div className="h-10 w-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center mx-auto">
                <Wallet className="h-5 w-5" />
              </div>
              <p className="text-xs font-semibold text-zinc-900 dark:text-white">
                Belum ada rekening dalam kategori ini
              </p>
              <Button onClick={() => handleOpenModal()} size="sm" variant="primary">
                Tambah Rekening
              </Button>
            </div>
          ) : (
            filteredAccounts.map((acc) => {
              const currentBalance = acc.currentBalance;

              return (
                <div
                  key={acc.id}
                  className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-xs space-y-3"
                >
                  {/* Top: Avatar, Name & Actions */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-11 w-11 rounded-xl flex items-center justify-center text-white text-xs font-black shadow-xs shrink-0"
                        style={{ backgroundColor: acc.color || '#3b82f6' }}
                      >
                        {acc.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-zinc-950 dark:text-white">
                          {acc.name}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                            {acc.type}
                          </span>
                          {acc.account_number && (
                            <>
                              <span className="text-zinc-300 dark:text-zinc-600">•</span>
                              <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                                {acc.account_number}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenModal(acc)}
                        aria-label="Ubah rekening"
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setAccountToDelete(acc)}
                        aria-label="Hapus rekening"
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Saldo Display */}
                  <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-zinc-400 font-medium">Saldo Rekening</p>
                      <p className="text-base font-bold font-mono text-zinc-950 dark:text-white mt-0.5">
                        {isPrivacyMode ? '••••••••' : formatAmount(currentBalance)}
                      </p>
                    </div>
                    <Link
                      href={`/statement?accountId=${acc.id}`}
                      className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
                    >
                      <FileText className="h-3 w-3" />
                      <span>Koran</span>
                    </Link>
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
                        <button
                          onClick={() => setAccountToDelete(acc)}
                          aria-label="Hapus rekening"
                          className="p-1 rounded text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
                      <span className="text-[11px] text-zinc-400 font-medium">Saldo Rekening</span>
                      <div className="text-xl font-bold font-mono text-zinc-950 dark:text-white mt-0.5">
                        {isPrivacyMode ? '••••••••' : formatAmount(currentBalance)}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <Link
                      href={`/statement?accountId=${acc.id}`}
                      className="text-xs text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 font-medium"
                    >
                      <FileText className="h-3 w-3" />
                      <span>Lihat Rekening Koran</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

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
            <Button type="submit" variant="primary" disabled={isSaving} isLoading={isSaving}>
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
          onConfirm={async () => {
            await deleteAccount(accountToDelete.id);
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
