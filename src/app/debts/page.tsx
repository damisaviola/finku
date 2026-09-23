'use client';

import React, { useState, useMemo } from 'react';
import {
  HandCoins,
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  Search,
  SlidersHorizontal,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Edit2,
  Trash2,
  Coins,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Wallet,
  Phone,
  Scale,
  X,
  History,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { ProgressBar } from '@/components/ui/progress';
import { useDompetKu } from '@/lib/store';
import { Debt, DebtType, DebtStatus } from '@/types';
import { formatRupiah, formatTanggal, cn } from '@/lib/utils/formatters';
import { DebtModal } from '@/components/debts/debt-modal';
import { DebtPaymentModal } from '@/components/debts/debt-payment-modal';
import { WhatsAppReminderModal } from '@/components/debts/whatsapp-reminder-modal';

function getDebtStatus(debt: Debt): DebtStatus {
  if (debt.paid_amount >= debt.total_amount) {
    return 'paid';
  }

  if (debt.due_date) {
    const today = new Date().toISOString().split('T')[0];
    if (debt.due_date < today) {
      return 'overdue';
    }
  }

  if (debt.paid_amount > 0) {
    return 'partial';
  }

  return 'unpaid';
}

function getDueDateRelativeText(dueDateStr?: string): { text: string; isOverdue: boolean } {
  if (!dueDateStr) return { text: 'Tidak ada tenggat waktu', isOverdue: false };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(dueDateStr);
  due.setHours(0, 0, 0, 0);

  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { text: `Terlambat ${Math.abs(diffDays)} hari`, isOverdue: true };
  } else if (diffDays === 0) {
    return { text: 'Jatuh tempo hari ini!', isOverdue: true };
  } else if (diffDays === 1) {
    return { text: 'Jatuh tempo besok', isOverdue: false };
  } else {
    return { text: `${diffDays} hari lagi`, isOverdue: false };
  }
}

export default function DebtsPage() {
  const { debts, accounts, deleteDebt, formatAmount } = useDompetKu();

  // Modals state
  const [isDebtModalOpen, setIsDebtModalOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
  const [defaultModalType, setDefaultModalType] = useState<DebtType>('receivable');

  const [paymentTargetDebt, setPaymentTargetDebt] = useState<Debt | null>(null);
  const [waReminderDebt, setWaReminderDebt] = useState<Debt | null>(null);
  const [debtToDelete, setDebtToDelete] = useState<Debt | null>(null);

  // Expanded payments history state (stores debt ids)
  const [expandedHistories, setExpandedHistories] = useState<Record<string, boolean>>({});

  // Filter & Search states
  const [typeFilter, setTypeFilter] = useState<'all' | 'receivable' | 'debt'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Summary Metrics
  const metrics = useMemo(() => {
    let totalReceivables = 0;
    let totalReceivablesPaid = 0;
    let totalDebts = 0;
    let totalDebtsPaid = 0;
    let overdueCount = 0;

    debts.forEach((d) => {
      const remaining = Math.max(0, d.total_amount - d.paid_amount);
      const status = getDebtStatus(d);
      if (status === 'overdue') overdueCount++;

      if (d.type === 'receivable') {
        totalReceivables += remaining;
        totalReceivablesPaid += d.paid_amount;
      } else {
        totalDebts += remaining;
        totalDebtsPaid += d.paid_amount;
      }
    });

    const netPosition = totalReceivables - totalDebts;

    return {
      totalReceivables,
      totalReceivablesPaid,
      totalDebts,
      totalDebtsPaid,
      netPosition,
      overdueCount,
    };
  }, [debts]);

  // Filtered List
  const filteredDebts = useMemo(() => {
    return debts.filter((d) => {
      // Type Filter
      if (typeFilter !== 'all' && d.type !== typeFilter) return false;

      // Status Filter
      const status = getDebtStatus(d);
      if (statusFilter !== 'all' && status !== statusFilter) return false;

      // Search Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = d.person_name.toLowerCase().includes(q);
        const matchesNotes = d.notes?.toLowerCase().includes(q) || false;
        const matchesPhone = d.phone_number?.includes(q) || false;
        if (!matchesName && !matchesNotes && !matchesPhone) return false;
      }

      return true;
    });
  }, [debts, typeFilter, statusFilter, searchQuery]);

  const toggleHistory = (id: string) => {
    setExpandedHistories((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleOpenAddModal = (type: DebtType = 'receivable') => {
    setEditingDebt(null);
    setDefaultModalType(type);
    setIsDebtModalOpen(true);
  };

  const handleOpenEditModal = (debt: Debt) => {
    setEditingDebt(debt);
    setDefaultModalType(debt.type);
    setIsDebtModalOpen(true);
  };

  const getAccountName = (accId?: string | null) => {
    if (!accId) return null;
    return accounts.find((a) => a.id === accId)?.name || null;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-950 dark:text-white flex items-center gap-2">
            <HandCoins className="h-6 w-6 text-amber-500" />
            <span>Utang & Piutang</span>
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Pantau hak tagih piutang Anda dan kelola kewajiban utang secara transparan.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => handleOpenAddModal('receivable')}
            variant="secondary"
            size="sm"
            className="text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60"
          >
            <ArrowDownLeft className="h-3.5 w-3.5 mr-1 text-emerald-500" />
            <span>+ Piutang Baru</span>
          </Button>

          <Button
            onClick={() => handleOpenAddModal('debt')}
            variant="primary"
            size="sm"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            <span>+ Catat Pinjaman</span>
          </Button>
        </div>
      </div>

      {/* KPI Stat Cards (Filament Style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Piutang Aktif */}
        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                Total Piutang (Hak Tagih)
              </span>
              <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                <ArrowDownLeft className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2">
              <p className="text-xl font-bold text-zinc-950 dark:text-white tracking-tight">
                {formatAmount(metrics.totalReceivables)}
              </p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                Uang Anda yang belum kembali
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Total Utang Aktif */}
        <Card className="border-l-4 border-l-rose-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                Total Utang (Kewajiban)
              </span>
              <div className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400">
                <ArrowUpRight className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2">
              <p className="text-xl font-bold text-zinc-950 dark:text-white tracking-tight">
                {formatAmount(metrics.totalDebts)}
              </p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                Kewajiban yang harus dibayarkan
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Posisi Bersih */}
        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                Posisi Keuangan Bersih
              </span>
              <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
                <Scale className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2">
              <p
                className={cn(
                  'text-xl font-bold tracking-tight',
                  metrics.netPosition >= 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                )}
              >
                {metrics.netPosition >= 0 ? '+' : ''}
                {formatAmount(metrics.netPosition)}
              </p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                {metrics.netPosition >= 0 ? 'Surplus piutang bersih' : 'Defisit (lebih banyak utang)'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Perlu Ditindaklanjuti */}
        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                Lewat Jatuh Tempo
              </span>
              <div className="p-1.5 rounded-lg bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400">
                <AlertTriangle className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2">
              <p className="text-xl font-bold text-zinc-950 dark:text-white tracking-tight">
                {metrics.overdueCount}{' '}
                <span className="text-xs font-normal text-zinc-500">tagihan</span>
              </p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                {metrics.overdueCount > 0 ? 'Perlu segera ditindaklanjuti' : 'Semua tagihan tepat waktu'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Area */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs overflow-hidden">
        {/* Filter and Toolbar Header */}
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 space-y-3 bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Type Segmented Buttons */}
            <div className="flex items-center gap-1.5 bg-zinc-200/70 dark:bg-zinc-800 p-1 rounded-lg self-start">
              <button
                type="button"
                onClick={() => setTypeFilter('all')}
                className={cn(
                  'px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer',
                  typeFilter === 'all'
                    ? 'bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                )}
              >
                Semua ({debts.length})
              </button>
              <button
                type="button"
                onClick={() => setTypeFilter('receivable')}
                className={cn(
                  'px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer flex items-center gap-1.5',
                  typeFilter === 'receivable'
                    ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                )}
              >
                <ArrowDownLeft className="h-3.5 w-3.5 text-emerald-500" />
                <span>Piutang ({debts.filter((d) => d.type === 'receivable').length})</span>
              </button>
              <button
                type="button"
                onClick={() => setTypeFilter('debt')}
                className={cn(
                  'px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer flex items-center gap-1.5',
                  typeFilter === 'debt'
                    ? 'bg-white dark:bg-zinc-900 text-rose-600 dark:text-rose-400 shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                )}
              >
                <ArrowUpRight className="h-3.5 w-3.5 text-rose-500" />
                <span>Utang ({debts.filter((d) => d.type === 'debt').length})</span>
              </button>
            </div>

            {/* Status Select Filter */}
            <div className="w-full sm:w-52">
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { label: 'Semua Status Tagihan', value: 'all' },
                  { label: 'Belum Lunas', value: 'unpaid' },
                  { label: 'Dicicil Sebagian', value: 'partial' },
                  { label: 'Sudah Lunas', value: 'paid' },
                  { label: 'Lewat Jatuh Tempo', value: 'overdue' },
                ]}
              />
            </div>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Input
              placeholder="Cari berdasarkan nama pihak, nomor telepon, atau catatan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leadingIcon={<Search className="h-3.5 w-3.5" />}
              className="text-xs py-1.5"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                aria-label="Hapus pencarian"
                className="absolute right-2.5 top-2.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* List of Debts */}
        {filteredDebts.length === 0 ? (
          <div className="p-12 text-center">
            <div className="h-12 w-12 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400 mx-auto flex items-center justify-center mb-3">
              <HandCoins className="h-6 w-6" />
            </div>
            <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Tidak ada data utang atau piutang ditemukan
            </h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
              {searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
                ? 'Coba atur ulang kata kunci pencarian atau filter status Anda.'
                : 'Mulai catat peminjaman uang ke rekan atau utang cicilan Anda agar keuangan selalu terkendali.'}
            </p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <Button onClick={() => handleOpenAddModal('receivable')} size="sm" variant="primary">
                <Plus className="h-3.5 w-3.5 mr-1" />
                <span>Tambah Catatan Baru</span>
              </Button>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {filteredDebts.map((item) => {
              const status = getDebtStatus(item);
              const remaining = Math.max(0, item.total_amount - item.paid_amount);
              const progressPct =
                item.total_amount > 0 ? (item.paid_amount / item.total_amount) * 100 : 0;
              const dueInfo = getDueDateRelativeText(item.due_date);
              const isReceivable = item.type === 'receivable';
              const accountName = getAccountName(item.account_id);
              const hasHistory = item.payments && item.payments.length > 0;
              const isHistoryOpen = Boolean(expandedHistories[item.id]);

              return (
                <div key={item.id} className="p-4 sm:p-5 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Left: Info Pihak & Detail */}
                    <div className="flex items-start gap-3.5 min-w-0 flex-1">
                      <div
                        className={cn(
                          'h-10 w-10 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs',
                          isReceivable
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                        )}
                      >
                        {isReceivable ? (
                          <ArrowDownLeft className="h-5 w-5" />
                        ) : (
                          <ArrowUpRight className="h-5 w-5" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-bold text-zinc-950 dark:text-white truncate">
                            {item.person_name}
                          </h3>

                          {/* Badge Jenis */}
                          <Badge
                            variant={isReceivable ? 'success' : 'danger'}
                            className="text-[10px] uppercase font-bold"
                          >
                            {isReceivable ? 'Piutang' : 'Utang'}
                          </Badge>

                          {/* Badge Status */}
                          {status === 'paid' && (
                            <Badge variant="success" className="text-[10px]">
                              Lunas
                            </Badge>
                          )}
                          {status === 'partial' && (
                            <Badge variant="warning" className="text-[10px]">
                              Dicicil Sebagian
                            </Badge>
                          )}
                          {status === 'unpaid' && (
                            <Badge variant="default" className="text-[10px]">
                              Belum Lunas
                            </Badge>
                          )}
                          {status === 'overdue' && (
                            <Badge variant="danger" className="text-[10px] flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              <span>Lewat Tempo</span>
                            </Badge>
                          )}
                        </div>

                        {/* Sub-info: due date, phone, account, notes */}
                        <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-zinc-500 dark:text-zinc-400">
                          {item.due_date && (
                            <span
                              className={cn(
                                'flex items-center gap-1',
                                dueInfo.isOverdue && status !== 'paid'
                                  ? 'text-rose-600 dark:text-rose-400 font-semibold'
                                  : ''
                              )}
                            >
                              <Calendar className="h-3.5 w-3.5" />
                              <span>
                                {formatTanggal(item.due_date)} ({dueInfo.text})
                              </span>
                            </span>
                          )}

                          {item.phone_number && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3.5 w-3.5" />
                              <span>{item.phone_number}</span>
                            </span>
                          )}

                          {accountName && (
                            <span className="flex items-center gap-1">
                              <Wallet className="h-3.5 w-3.5" />
                              <span>{accountName}</span>
                            </span>
                          )}
                        </div>

                        {item.notes && (
                          <p className="text-xs text-zinc-600 dark:text-zinc-400 italic">
                            &quot;{item.notes}&quot;
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right: Nominal & Action Buttons */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between lg:justify-end gap-3 min-w-[280px]">
                      {/* Financial Numbers & Progress */}
                      <div className="text-left sm:text-right space-y-1.5 flex-1">
                        <div className="flex sm:flex-col justify-between items-baseline sm:items-end">
                          <span className="text-[11px] text-zinc-400 font-medium">Sisa Tagihan:</span>
                          <span
                            className={cn(
                              'text-base font-bold font-mono tracking-tight',
                              status === 'paid'
                                ? 'text-zinc-400 line-through'
                                : isReceivable
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-rose-600 dark:text-rose-400'
                            )}
                          >
                            {formatAmount(remaining)}
                          </span>
                        </div>

                        <div className="w-full sm:w-44 ml-auto">
                          <ProgressBar
                            value={progressPct}
                            variant={status === 'paid' ? 'emerald' : isReceivable ? 'emerald' : 'rose'}
                          />
                          <div className="flex justify-between text-[10px] text-zinc-400 mt-1">
                            <span>Dibayar: {formatAmount(item.paid_amount)}</span>
                            <span>Total: {formatAmount(item.total_amount)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5 self-end sm:self-center">
                        {/* Quick Pay Button */}
                        {status !== 'paid' && (
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => setPaymentTargetDebt(item)}
                            className="text-xs px-2.5 py-1.5 font-semibold gap-1"
                            title={isReceivable ? 'Terima Pembayaran' : 'Bayar Cicilan'}
                          >
                            <Coins className="h-3.5 w-3.5" />
                            <span>{isReceivable ? 'Terima' : 'Bayar'}</span>
                          </Button>
                        )}

                        {/* WhatsApp reminder button for receivables */}
                        {isReceivable && status !== 'paid' && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => setWaReminderDebt(item)}
                            className="text-xs px-2.5 py-1.5 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800"
                            title="Kirim Pengingat WhatsApp"
                          >
                            <MessageSquare className="h-3.5 w-3.5" />
                          </Button>
                        )}

                        {/* Edit button */}
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(item)}
                          className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg cursor-pointer transition-colors"
                          title="Ubah Catatan"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>

                        {/* Delete button */}
                        <button
                          type="button"
                          onClick={() => setDebtToDelete(item)}
                          className="p-1.5 text-zinc-400 hover:text-rose-600 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
                          title="Hapus Catatan"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Payment History Accordion Toggle */}
                  {hasHistory && (
                    <div className="mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-800/80">
                      <button
                        type="button"
                        onClick={() => toggleHistory(item.id)}
                        className="text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 flex items-center gap-1.5 cursor-pointer"
                      >
                        <History className="h-3.5 w-3.5 text-amber-500" />
                        <span>Riwayat Pembayaran ({item.payments?.length} transaksi)</span>
                        {isHistoryOpen ? (
                          <ChevronUp className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5" />
                        )}
                      </button>

                      {isHistoryOpen && (
                        <div className="mt-2.5 space-y-1.5 pl-5 border-l-2 border-amber-500/30">
                          {item.payments?.map((p) => {
                            const accPName = getAccountName(p.account_id);
                            return (
                              <div
                                key={p.id}
                                className="flex flex-col sm:flex-row sm:items-center justify-between text-xs py-1 text-zinc-600 dark:text-zinc-400"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-zinc-800 dark:text-zinc-200">
                                    {formatTanggal(p.payment_date)}
                                  </span>
                                  {accPName && (
                                    <span className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-[10px]">
                                      {accPName}
                                    </span>
                                  )}
                                  {p.notes && <span className="text-zinc-400 italic">({p.notes})</span>}
                                </div>
                                <span className="font-semibold font-mono text-emerald-600 dark:text-emerald-400">
                                  +{formatAmount(p.amount)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Debt Add/Edit Modal */}
      <DebtModal
        isOpen={isDebtModalOpen}
        onClose={() => setIsDebtModalOpen(false)}
        debtToEdit={editingDebt}
        defaultType={defaultModalType}
      />

      {/* Debt Payment Modal */}
      <DebtPaymentModal
        isOpen={Boolean(paymentTargetDebt)}
        onClose={() => setPaymentTargetDebt(null)}
        debt={paymentTargetDebt}
      />

      {/* WhatsApp Reminder Modal */}
      <WhatsAppReminderModal
        isOpen={Boolean(waReminderDebt)}
        onClose={() => setWaReminderDebt(null)}
        debt={waReminderDebt}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={Boolean(debtToDelete)}
        onClose={() => setDebtToDelete(null)}
        onConfirm={() => {
          if (debtToDelete) {
            deleteDebt(debtToDelete.id);
            setDebtToDelete(null);
          }
        }}
        title="Hapus Catatan Utang / Piutang"
        description={`Apakah Anda yakin ingin menghapus catatan pinjaman untuk ${debtToDelete?.person_name}? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus Catatan"
        variant="danger"
      />
    </div>
  );
}
