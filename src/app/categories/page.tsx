'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  X,
  Tag,
  ArrowDownLeft,
  ArrowUpRight,
  Palette,
  Check,
  Layers,
  FolderOpen,
  ChevronLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Dialog, DialogFooter } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useDompetKu } from '@/lib/store';
import { Category, CategoryType } from '@/types';

const PRESET_COLORS = [
  { name: 'Amber', hex: '#f59e0b' },
  { name: 'Oranye', hex: '#f97316' },
  { name: 'Mawar', hex: '#f43f5e' },
  { name: 'Merah', hex: '#ef4444' },
  { name: 'Zamrud', hex: '#10b981' },
  { name: 'Teal', hex: '#14b8a6' },
  { name: 'Sian', hex: '#06b6d4' },
  { name: 'Biru', hex: '#3b82f6' },
  { name: 'Nila', hex: '#6366f1' },
  { name: 'Ungu', hex: '#8b5cf6' },
  { name: 'Merah Muda', hex: '#ec4899' },
  { name: 'Abu-abu', hex: '#71717a' },
];

export default function CategoriesPage() {
  const {
    categories,
    transactions,
    addCategory,
    updateCategory,
    deleteCategory,
  } = useDompetKu();

  const [activeTab, setActiveTab] = useState<CategoryType>('expense');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [type, setType] = useState<CategoryType>('expense');
  const [color, setColor] = useState('#f97316');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Hitung jumlah transaksi per kategori untuk informasi frekuensi pemakaian
  const usageCountMap = useMemo(() => {
    const map = new Map<string, number>();
    transactions.forEach((t) => {
      if (t.category_id) {
        map.set(t.category_id, (map.get(t.category_id) || 0) + 1);
      }
    });
    return map;
  }, [transactions]);

  const handleOpenModal = (cat?: Category) => {
    setErrors({});
    setIsSaving(false);
    if (cat) {
      setEditingCategory(cat);
      setName(cat.name);
      setType(cat.type);
      setColor(cat.color || '#f97316');
    } else {
      setEditingCategory(null);
      setName('');
      setType(activeTab);
      setColor(activeTab === 'expense' ? '#f97316' : '#10b981');
    }
    setIsModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrors({ name: 'Nama kategori wajib diisi.' });
      return;
    }

    setIsSaving(true);
    try {
      if (editingCategory) {
        const success = await updateCategory(editingCategory.id, {
          name: name.trim(),
          type,
          color,
        });
        if (!success) return;
      } else {
        const success = await addCategory({
          name: name.trim(),
          type,
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

  const expenseCount = categories.filter((c) => c.type === 'expense').length;
  const incomeCount = categories.filter((c) => c.type === 'income').length;

  const filteredCategories = useMemo(() => {
    return categories
      .filter((c) => c.type === activeTab)
      .filter((c) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return c.name.toLowerCase().includes(q) || (c.color && c.color.toLowerCase().includes(q));
      });
  }, [categories, activeTab, searchQuery]);

  const txUsingCatToDelete = categoryToDelete
    ? usageCountMap.get(categoryToDelete.id) || 0
    : 0;

  return (
    <div className="space-y-5">
      {/* ========================================================= */}
      {/* MOBILE VIEW (BRImo-style Responsive Design: visible on < lg) */}
      {/* ========================================================= */}
      <div className="lg:hidden -mx-4 -mt-4 pb-8 space-y-4">
        {/* 1. Mobile Sunset Gradient Hero Header */}
        <div className="relative bg-gradient-to-b from-[#8b2d18] via-[#c65324] to-[#0a4d92] px-4 pt-4 pb-14 text-white overflow-hidden">
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
                  Kategori Transaksi
                </h1>
                <p className="text-[11px] text-white/80 font-medium leading-none mt-0.5">
                  {categories.length} Pos Terdaftar
                </p>
              </div>
            </div>

            <button
              onClick={() => handleOpenModal()}
              type="button"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-400 text-zinc-950 font-bold text-xs shadow-md hover:bg-amber-300 active:scale-95 transition-all"
            >
              <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>Kategori</span>
            </button>
          </div>
        </div>

        {/* 2. Floating Mobile Hero Summary Card */}
        <div className="relative z-20 px-4 -mt-10">
          <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-lg shadow-zinc-950/5 dark:shadow-black/20 space-y-3">
            <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
              Klasifikasi Pos Transaksi
            </span>

            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-zinc-100 dark:border-zinc-800/80">
              <div className="p-2.5 rounded-xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40">
                <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 text-xs font-semibold">
                  <ArrowDownLeft className="h-4 w-4" />
                  <span>Pengeluaran</span>
                </div>
                <p className="text-lg font-black font-mono text-zinc-950 dark:text-white mt-1">
                  {expenseCount}{' '}
                  <span className="text-xs font-normal text-zinc-400">pos</span>
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                  <ArrowUpRight className="h-4 w-4" />
                  <span>Pemasukan</span>
                </div>
                <p className="text-lg font-black font-mono text-zinc-950 dark:text-white mt-1">
                  {incomeCount}{' '}
                  <span className="text-xs font-normal text-zinc-400">pos</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Horizontal Filter Tabs */}
        <div className="px-4">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {[
              { id: 'expense', label: 'Pengeluaran', count: expenseCount },
              { id: 'income', label: 'Pemasukan', count: incomeCount },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as CategoryType)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 shadow-xs'
                      : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive
                        ? 'bg-white/20 dark:bg-zinc-950/20'
                        : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Touch Search Bar */}
        <div className="px-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Cari kategori..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* 5. Mobile Native Category Card List */}
        <div className="px-4 space-y-2.5">
          {filteredCategories.length === 0 ? (
            <div className="py-10 px-4 text-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-2.5">
              <div className="h-10 w-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center mx-auto">
                <Tag className="h-5 w-5" />
              </div>
              <p className="text-xs font-semibold text-zinc-900 dark:text-white">
                Tidak ada kategori ditemukan
              </p>
              <Button onClick={() => handleOpenModal()} size="sm" variant="primary">
                Tambah Kategori
              </Button>
            </div>
          ) : (
            filteredCategories.map((cat) => {
              const txCount = usageCountMap.get(cat.id) || 0;

              return (
                <div
                  key={cat.id}
                  className="rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3.5 shadow-xs flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 text-white font-bold text-xs shadow-xs"
                      style={{ backgroundColor: cat.color || '#f97316' }}
                    >
                      <Tag className="h-5 w-5" />
                    </div>

                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-zinc-950 dark:text-white truncate">
                        {cat.name}
                      </h4>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        {txCount > 0 ? `Digunakan pada ${txCount} transaksi` : 'Belum digunakan'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleOpenModal(cat)}
                      aria-label={`Ubah kategori ${cat.name}`}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    {filteredCategories.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setCategoryToDelete(cat)}
                        aria-label={`Hapus kategori ${cat.name}`}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
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
        {/* Filament Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-200/80 dark:border-zinc-800">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-950 dark:text-white flex items-center gap-2">
            <span>Kategori Transaksi</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
              {categories.length} Total Pos
            </span>
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Kelola pos klasifikasi pemasukan dan pengeluaran agar laporan keuangan terstruktur rapi.
          </p>
        </div>

        <Button
          onClick={() => handleOpenModal()}
          variant="primary"
          size="sm"
          className="self-stretch sm:self-auto justify-center shadow-xs"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          <span>Tambah Kategori</span>
        </Button>
      </div>

      {/* Toolbar: Navigation Tabs & Search Input */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Filament Tabs */}
        <div className="inline-flex p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800/70 border border-zinc-200/60 dark:border-zinc-700/60 self-stretch sm:self-start">
          <button
            type="button"
            onClick={() => setActiveTab('expense')}
            className={`flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'expense'
                ? 'bg-white dark:bg-zinc-900 text-rose-600 dark:text-rose-400 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
            }`}
          >
            <ArrowDownLeft className="h-3.5 w-3.5 text-rose-500" />
            <span>Pengeluaran</span>
            <span
              className={`ml-1 px-1.5 py-0.2 rounded-md text-[10px] ${
                activeTab === 'expense'
                  ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                  : 'bg-zinc-200/60 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400'
              }`}
            >
              {expenseCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('income')}
            className={`flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'income'
                ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
            }`}
          >
            <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" />
            <span>Pemasukan</span>
            <span
              className={`ml-1 px-1.5 py-0.2 rounded-md text-[10px] ${
                activeTab === 'income'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                  : 'bg-zinc-200/60 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400'
              }`}
            >
              {incomeCount}
            </span>
          </button>
        </div>

        {/* Pencarian Kategori Cepat */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari kategori..."
            className="w-full pl-8 pr-7 py-1.5 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 shadow-xs transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* KONTEN RESPONSIF: LIST CARD UNTUK MOBILE & TABEL UNTUK DESKTOP */}
      {filteredCategories.length === 0 ? (
        /* Empty State */
        <div className="py-12 px-4 text-center rounded-xl border border-dashed border-zinc-300 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 space-y-3">
          <div className="h-11 w-11 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center mx-auto shadow-xs">
            <FolderOpen className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-900 dark:text-white">
              {searchQuery
                ? `Tidak ada kategori yang cocok dengan "${searchQuery}"`
                : `Belum ada pos kategori ${activeTab === 'expense' ? 'pengeluaran' : 'pemasukan'}`}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
              {searchQuery
                ? 'Periksa kembali ejaan kata kunci atau hapus pencarian untuk menampilkan seluruh kategori.'
                : 'Buat pos baru untuk memudahkan pelaporan dan pencatatan transaksi Anda.'}
            </p>
          </div>
          {searchQuery ? (
            <Button variant="outline" size="sm" onClick={() => setSearchQuery('')}>
              Bersihkan Pencarian
            </Button>
          ) : (
            <Button variant="primary" size="sm" onClick={() => handleOpenModal()}>
              <Plus className="h-3.5 w-3.5 mr-1" />
              <span>Tambah Kategori Sekarang</span>
            </Button>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs ring-1 ring-zinc-950/5 dark:ring-white/5 overflow-hidden">
          {/* ======================================================== */}
          {/* 1. TAMPILAN MOBILE: KARTU LIST RESPONSIF (sm:hidden)    */}
          {/* ======================================================== */}
          <div className="block sm:hidden divide-y divide-zinc-100 dark:divide-zinc-800/80">
            {filteredCategories.map((cat) => {
              const txCount = usageCountMap.get(cat.id) || 0;
              const isExpense = cat.type === 'expense';

              return (
                <div
                  key={cat.id}
                  className="p-3.5 flex items-center justify-between gap-3 hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                >
                  {/* Sisi Kiri: Avatar Warna & Informasi Kategori */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Lingkaran Avatar Aksen Warna Kategori */}
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs"
                      style={{
                        backgroundColor: `${cat.color || '#a1a1aa'}20`,
                        border: `1px solid ${cat.color || '#a1a1aa'}40`,
                      }}
                    >
                      <Tag
                        className="h-4 w-4"
                        style={{ color: cat.color || '#a1a1aa' }}
                      />
                    </div>

                    {/* Rincian Teks */}
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-sm text-zinc-950 dark:text-white truncate">
                        {cat.name}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        {/* Label Tipe */}
                        <span
                          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold border ${
                            isExpense
                              ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border-rose-200/60 dark:border-rose-900/50'
                              : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-900/50'
                          }`}
                        >
                          {isExpense ? (
                            <ArrowDownLeft className="h-2.5 w-2.5" />
                          ) : (
                            <ArrowUpRight className="h-2.5 w-2.5" />
                          )}
                          <span>{isExpense ? 'Pengeluaran' : 'Pemasukan'}</span>
                        </span>

                        {/* Kode Warna Hex */}
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: cat.color || '#a1a1aa' }}
                          />
                          <span>{cat.color || '#a1a1aa'}</span>
                        </span>

                        {/* Jumlah Transaksi */}
                        <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                          {txCount} transaksi
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Sisi Kanan: Tombol Aksi Ramah Sentuhan (Mobile Friendly Touch Targets) */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleOpenModal(cat)}
                      aria-label={`Ubah kategori ${cat.name}`}
                      className="min-h-[38px] min-w-[38px] p-2 rounded-xl text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
                      title="Ubah Kategori"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    {filteredCategories.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setCategoryToDelete(cat)}
                        aria-label={`Hapus kategori ${cat.name}`}
                        className="min-h-[38px] min-w-[38px] p-2 rounded-xl text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
                        title="Hapus Kategori"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ======================================================== */}
          {/* 2. TAMPILAN DESKTOP: TABEL FILAMENT RESMI (hidden sm:block) */}
          {/* ======================================================== */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="px-5 py-3">Nama Pos Kategori</th>
                  <th className="px-5 py-3">Tipe</th>
                  <th className="px-5 py-3">Warna Label</th>
                  <th className="px-5 py-3">Pemakaian</th>
                  <th className="px-5 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                {filteredCategories.map((cat) => {
                  const txCount = usageCountMap.get(cat.id) || 0;
                  const isExpense = cat.type === 'expense';

                  return (
                    <tr
                      key={cat.id}
                      className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors"
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <span
                            className="w-3 h-3 rounded-full shrink-0 shadow-xs"
                            style={{ backgroundColor: cat.color || '#a1a1aa' }}
                          />
                          <span className="font-semibold text-zinc-950 dark:text-white">
                            {cat.name}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${
                            isExpense
                              ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border-rose-200/60 dark:border-rose-900/50'
                              : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-900/50'
                          }`}
                        >
                          {isExpense ? (
                            <ArrowDownLeft className="h-3 w-3" />
                          ) : (
                            <ArrowUpRight className="h-3 w-3" />
                          )}
                          <span>{isExpense ? 'Pengeluaran' : 'Pemasukan'}</span>
                        </span>
                      </td>

                      <td className="px-5 py-3">
                        <div className="inline-flex items-center gap-1.5 font-mono text-[11px] text-zinc-600 dark:text-zinc-400 px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: cat.color || '#a1a1aa' }}
                          />
                          <span>{cat.color || '#a1a1aa'}</span>
                        </div>
                      </td>

                      <td className="px-5 py-3 text-zinc-500 dark:text-zinc-400 text-xs">
                        <span className="font-medium text-zinc-900 dark:text-zinc-200">
                          {txCount}
                        </span>{' '}
                        transaksi tercatat
                      </td>

                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenModal(cat)}
                            aria-label={`Ubah kategori ${cat.name}`}
                            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                            title="Ubah Kategori"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          {filteredCategories.length > 1 && (
                            <button
                              type="button"
                              onClick={() => setCategoryToDelete(cat)}
                              aria-label={`Hapus kategori ${cat.name}`}
                              className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                              title="Hapus Kategori"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
      </div>

      {/* Modal Tambah / Edit Kategori dengan Palet Warna Lengkap */}
      <Dialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        icon={<Tag className="h-5 w-5" />}
        iconVariant={type === 'expense' ? 'rose' : 'emerald'}
        badge={editingCategory ? 'Edit' : 'Baru'}
        title={editingCategory ? 'Ubah Kategori' : 'Tambah Kategori Baru'}
        description="Klasifikasikan pos transaksi untuk pelaporan keuangan yang akurat."
        maxWidth="sm"
      >
        <form onSubmit={handleSaveCategory} className="space-y-4">
          <Input
            label="Nama Pos Kategori"
            placeholder="Contoh: Belanja Online, Bahan Makanan, Gaji"
            required
            leadingIcon={<Tag className="h-4 w-4" />}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) setErrors({});
            }}
            error={errors.name}
          />

          <Select
            label="Tipe Kategori"
            required
            leadingIcon={
              type === 'expense' ? (
                <ArrowDownLeft className="h-4 w-4 text-rose-500" />
              ) : (
                <ArrowUpRight className="h-4 w-4 text-emerald-500" />
              )
            }
            value={type}
            onChange={(e) => setType(e.target.value as CategoryType)}
          >
            <option value="expense">Pengeluaran</option>
            <option value="income">Pemasukan</option>
          </Select>

          {/* Pemilihan Warna Label Kategori */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <Palette className="h-3.5 w-3.5 text-amber-500" />
                <span>Pilihan Warna Label</span>
              </label>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[11px] font-mono text-zinc-600 dark:text-zinc-300">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span>{color}</span>
              </div>
            </div>

            {/* Grid Palet Warna Siap Pakai */}
            <div className="grid grid-cols-6 gap-2 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40">
              {PRESET_COLORS.map((c) => {
                const isSelected = color.toLowerCase() === c.hex.toLowerCase();
                return (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setColor(c.hex)}
                    title={c.name}
                    className={`h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                      isSelected
                        ? 'ring-2 ring-zinc-950 dark:ring-white scale-105 shadow-xs'
                        : 'hover:scale-105 opacity-85 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: c.hex }}
                  >
                    {isSelected && <Check className="h-4 w-4 text-white drop-shadow-sm" />}
                  </button>
                );
              })}
            </div>

            {/* Input Custom Color Picker */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-8 h-8 rounded-lg border border-zinc-300 dark:border-zinc-700 cursor-pointer p-0 bg-transparent"
                title="Pilih Warna Bebas"
              />
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Gunakan pemilih warna untuk memilih kode warna kustom lainnya.
              </span>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary" disabled={isSaving} isLoading={isSaving}>
              Simpan Kategori
            </Button>
          </DialogFooter>
        </form>
      </Dialog>

      {/* Dialog Konfirmasi Hapus Kategori */}
      {categoryToDelete && (
        <ConfirmDialog
          isOpen={!!categoryToDelete}
          onClose={() => setCategoryToDelete(null)}
          onConfirm={async () => {
            await deleteCategory(categoryToDelete.id);
            setCategoryToDelete(null);
          }}
          title="Hapus Kategori?"
          description={
            <div className="space-y-2">
              <p>
                Kategori <strong>&quot;{categoryToDelete.name}&quot;</strong> akan dihapus dari sistem.
              </p>
              {txUsingCatToDelete > 0 && (
                <p className="text-[11px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 p-2 rounded-lg border border-amber-200 dark:border-amber-800">
                  ⚠️ Perhatian: Terdapat <strong>{txUsingCatToDelete} transaksi</strong> yang menggunakan kategori ini.
                </p>
              )}
            </div>
          }
          confirmText="Hapus"
          cancelText="Batal"
        />
      )}
    </div>
  );
}
