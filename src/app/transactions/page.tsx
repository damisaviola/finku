'use client';

import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Trash2,
  Edit2,
  X,
  SlidersHorizontal,
  FileSpreadsheet,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useDompetKu } from '@/lib/store';
import { Transaction } from '@/types';
import { formatRupiah, formatTanggal } from '@/lib/utils/formatters';

export default function TransactionsPage() {
  const {
    transactions,
    accounts,
    categories,
    openTransactionModal,
    deleteTransaction,
    formatAmount,
  } = useDompetKu();

  // Filters state (PRD Bagian 26)
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [accountFilter, setAccountFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Delete modal state (PRD Bagian 44)
  const [txToDelete, setTxToDelete] = useState<Transaction | null>(null);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesDesc = t.description.toLowerCase().includes(query);
        const matchesNotes = t.notes?.toLowerCase().includes(query) || false;
        if (!matchesDesc && !matchesNotes) return false;
      }

      // Type filter
      if (typeFilter !== 'all' && t.type !== typeFilter) {
        return false;
      }

      // Account filter
      if (accountFilter !== 'all') {
        if (t.account_id !== accountFilter && t.destination_account_id !== accountFilter) {
          return false;
        }
      }

      // Category filter
      if (categoryFilter !== 'all') {
        if (t.category_id !== categoryFilter) {
          return false;
        }
      }

      return true;
    });
  }, [transactions, searchQuery, typeFilter, accountFilter, categoryFilter]);

  const activeFilterCount =
    (typeFilter !== 'all' ? 1 : 0) +
    (accountFilter !== 'all' ? 1 : 0) +
    (categoryFilter !== 'all' ? 1 : 0);

  const handleResetFilters = () => {
    setSearchQuery('');
    setTypeFilter('all');
    setAccountFilter('all');
    setCategoryFilter('all');
  };

  return (
    <div className="space-y-5">
      {/* Filament Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-950 dark:text-white">
            Daftar Transaksi
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Kelola dan pantau seluruh catatan pemasukan, pengeluaran, serta transfer Anda.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => openTransactionModal('expense')}
            variant="primary"
            size="sm"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            <span>Tambah Transaksi</span>
          </Button>
        </div>
      </div>

      {/* Filament Table Container */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs ring-1 ring-zinc-950/5 dark:ring-white/5 overflow-hidden">
        {/* Filament Table Toolbar */}
        <div className="p-3 sm:p-4 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-2.5 flex-1 max-w-md">
            <div className="relative flex-1">
              <Input
                placeholder="Cari transaksi berdasarkan nama atau catatan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leadingIcon={<Search className="h-3.5 w-3.5" />}
                className="text-xs py-1.5"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  aria-label="Hapus pencarian"
                  className="absolute right-2.5 top-2.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <Button
              variant={activeFilterCount > 0 ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="text-xs font-semibold gap-1.5"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>Filter</span>
              {activeFilterCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-white/30 text-white text-[10px] font-bold">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </div>

          {activeFilterCount > 0 && (
            <button
              onClick={handleResetFilters}
              className="text-xs font-medium text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 self-start sm:self-auto"
            >
              <X className="h-3.5 w-3.5" />
              <span>Hapus Semua Filter</span>
            </button>
          )}
        </div>

        {/* Collapsible Filter Panel */}
        {isFilterOpen && (
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-in fade-in duration-150">
            <div>
              <Select
                label="Jenis Transaksi"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="all">Semua Jenis</option>
                <option value="income">Pemasukan</option>
                <option value="expense">Pengeluaran</option>
                <option value="transfer">Transfer Antar Rekening</option>
              </Select>
            </div>

            <div>
              <Select
                label="Rekening"
                value={accountFilter}
                onChange={(e) => setAccountFilter(e.target.value)}
              >
                <option value="all">Semua Rekening</option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Select
                label="Kategori"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">Semua Kategori</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} ({cat.type === 'income' ? 'Pemasukan' : 'Pengeluaran'})
                  </option>
                ))}
              </Select>
            </div>
          </div>
        )}

        {/* Filament Table View */}
        {filteredTransactions.length === 0 ? (
          <div className="py-12 px-4 text-center space-y-3">
            <div className="h-10 w-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center mx-auto">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                Tidak ada catatan transaksi yang cocok
              </p>
              <p className="text-xs text-zinc-400 mt-0.5">
                Coba sesuaikan kata kunci pencarian atau bersihkan filter Anda.
              </p>
            </div>
            {activeFilterCount > 0 && (
              <Button variant="outline" size="sm" onClick={handleResetFilters}>
                Bersihkan Filter
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="px-5 py-3">Tanggal</th>
                  <th className="px-5 py-3">Status / Jenis</th>
                  <th className="px-5 py-3">Keterangan</th>
                  <th className="px-5 py-3">Kategori</th>
                  <th className="px-5 py-3">Rekening</th>
                  <th className="px-5 py-3 text-right">Jumlah</th>
                  <th className="px-5 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                {filteredTransactions.map((t) => {
                  const acc = accounts.find((a) => a.id === t.account_id);
                  const destAcc = t.destination_account_id
                    ? accounts.find((a) => a.id === t.destination_account_id)
                    : null;
                  const cat = categories.find((c) => c.id === t.category_id);

                  return (
                    <tr
                      key={t.id}
                      className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/50 transition-colors"
                    >
                      <td className="px-5 py-3 text-zinc-500 font-mono whitespace-nowrap">
                        {formatTanggal(t.date)}
                      </td>
                      <td className="px-5 py-3 whitespace-nowrap">
                        {t.type === 'income' && (
                          <Badge variant="success" size="sm">
                            Pemasukan
                          </Badge>
                        )}
                        {t.type === 'expense' && (
                          <Badge variant="danger" size="sm">
                            Pengeluaran
                          </Badge>
                        )}
                        {t.type === 'transfer' && (
                          <Badge variant="default" size="sm">
                            Transfer
                          </Badge>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <p className="font-semibold text-zinc-950 dark:text-white">
                          {t.description}
                        </p>
                        {t.notes && (
                          <p className="text-[11px] text-zinc-400 line-clamp-1">
                            {t.notes}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-3 text-zinc-600 dark:text-zinc-400">
                        {t.type === 'transfer' ? (
                          <span className="text-zinc-400">-</span>
                        ) : (
                          <span>{cat?.name || 'Umum'}</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
                        {t.type === 'transfer'
                          ? `${acc?.name || '-'} → ${destAcc?.name || '-'}`
                          : acc?.name || '-'}
                      </td>
                      <td className="px-5 py-3 text-right font-mono font-bold whitespace-nowrap">
                        <span
                          className={
                            t.type === 'income'
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : t.type === 'expense'
                              ? 'text-rose-600 dark:text-rose-400'
                              : 'text-zinc-700 dark:text-zinc-300'
                          }
                        >
                          {t.type === 'income' && `+${formatAmount(t.amount)}`}
                          {t.type === 'expense' && `-${formatAmount(t.amount)}`}
                          {t.type === 'transfer' && formatAmount(t.amount)}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openTransactionModal(t.type, t)}
                            aria-label="Ubah transaksi"
                            className="p-1 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setTxToDelete(t)}
                            aria-label="Hapus transaksi"
                            className="p-1 rounded text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Filament Table Pagination Footer */}
        <div className="px-5 py-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500 bg-zinc-50/50 dark:bg-zinc-900/50">
          <span>
            Menampilkan {filteredTransactions.length} dari {transactions.length} hasil
          </span>
          <span className="font-mono text-zinc-400 text-[11px]">
            Halaman 1 dari 1
          </span>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {txToDelete && (
        <ConfirmDialog
          isOpen={!!txToDelete}
          onClose={() => setTxToDelete(null)}
          onConfirm={() => {
            deleteTransaction(txToDelete.id);
            setTxToDelete(null);
          }}
          title="Hapus Transaksi?"
          description={
            <span>
              Transaksi <strong>&quot;{txToDelete.description}&quot;</strong> sebesar{' '}
              <strong>{formatRupiah(txToDelete.amount)}</strong> akan dihapus dari buku kas.
            </span>
          }
          confirmText="Hapus"
          cancelText="Batal"
        />
      )}
    </div>
  );
}
