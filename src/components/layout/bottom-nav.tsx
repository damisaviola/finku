'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Plus,
  Wallet,
  MoreHorizontal,
  PieChart,
  Target,
  BarChart3,
  Settings,
  Tags,
  FileText,
  TrendingUp,
  TrendingDown,
  LogOut,
  CalendarDays,
  X,
  HandCoins,
} from 'lucide-react';
import { cn } from '@/lib/utils/formatters';
import { useDompetKu } from '@/lib/store';

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { openTransactionModal, user, logout } = useDompetKu();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMoreDrawerOpen, setIsMoreDrawerOpen] = useState(false);

  const moreItems = [
    { label: 'Utang & Piutang', href: '/debts', icon: HandCoins },
    { label: 'Kalender', href: '/calendar', icon: CalendarDays },
    { label: 'Anggaran', href: '/budgets', icon: PieChart },
    { label: 'Target Tabungan', href: '/goals', icon: Target },
    { label: 'Rekening Koran', href: '/statement', icon: FileText },
    { label: 'Laporan', href: '/reports', icon: BarChart3 },
    { label: 'Kategori', href: '/categories', icon: Tags },
    { label: 'Pengaturan', href: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Quick Add Bottom Sheet (Filament style) */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
          <div
            className="fixed inset-0 bg-zinc-950/60 dark:bg-zinc-950/75 backdrop-blur-[3px] animate-in fade-in duration-200"
            onClick={() => setIsMenuOpen(false)}
          />
          <div className="relative z-10 bg-white dark:bg-zinc-900 rounded-t-[28px] p-5 pb-[max(env(safe-area-inset-bottom),1.25rem)] border-t border-zinc-200/90 dark:border-zinc-800 shadow-2xl animate-in slide-in-from-bottom duration-200">
            {/* Mobile Capsule Drag Handle */}
            <div className="flex justify-center pb-3">
              <div className="w-11 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700/80" />
            </div>

            <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-100 dark:border-zinc-800/80">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Plus className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-zinc-950 dark:text-white text-sm">
                    Catat Transaksi Baru
                  </h3>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Pilih jenis transaksi untuk dicatat</p>
                </div>
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="rounded-xl p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 active:scale-95 transition-all cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  openTransactionModal('expense');
                }}
                className="flex flex-col items-center gap-2 p-3.5 rounded-xl border border-rose-200/60 dark:border-rose-900/40 bg-rose-500/[0.04] hover:bg-rose-500/[0.08] active:scale-[0.98] transition-all cursor-pointer"
              >
                <div className="h-9 w-9 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                  <TrendingDown className="h-5 w-5" />
                </div>
                <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                  Pengeluaran
                </span>
              </button>

              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  openTransactionModal('income');
                }}
                className="flex flex-col items-center gap-2 p-3.5 rounded-xl border border-emerald-200/60 dark:border-emerald-900/40 bg-emerald-500/[0.04] hover:bg-emerald-500/[0.08] active:scale-[0.98] transition-all cursor-pointer"
              >
                <div className="h-9 w-9 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                  Pemasukan
                </span>
              </button>

              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  openTransactionModal('transfer');
                }}
                className="flex flex-col items-center gap-2 p-3.5 rounded-xl border border-amber-200/60 dark:border-amber-900/40 bg-amber-500/[0.04] hover:bg-amber-500/[0.08] active:scale-[0.98] transition-all cursor-pointer"
              >
                <div className="h-9 w-9 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <ArrowLeftRight className="h-5 w-5" />
                </div>
                <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                  Transfer
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* More Items Drawer */}
      {isMoreDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
          <div
            className="fixed inset-0 bg-zinc-950/60 dark:bg-zinc-950/75 backdrop-blur-[3px] animate-in fade-in duration-200"
            onClick={() => setIsMoreDrawerOpen(false)}
          />
          <div className="relative z-10 bg-white dark:bg-zinc-900 rounded-t-[28px] p-5 pb-[max(env(safe-area-inset-bottom),1.25rem)] border-t border-zinc-200/90 dark:border-zinc-800 shadow-2xl animate-in slide-in-from-bottom duration-200">
            {/* Mobile Capsule Drag Handle */}
            <div className="flex justify-center pb-3">
              <div className="w-11 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700/80" />
            </div>

            <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-100 dark:border-zinc-800/80">
              <div>
                <h3 className="font-bold text-zinc-950 dark:text-white text-sm">
                  Navigasi Panel
                </h3>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Akses modul keuangan DompetKu</p>
              </div>
              <button
                onClick={() => setIsMoreDrawerOpen(false)}
                className="rounded-xl p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 active:scale-95 transition-all cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {moreItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMoreDrawerOpen(false)}
                    className={cn(
                      'flex items-center gap-2.5 p-3 rounded-xl border text-xs font-semibold transition-all active:scale-[0.98]',
                      isActive
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400'
                        : 'border-zinc-200/80 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/60'
                    )}
                  >
                    <Icon className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* User Profile & Logout Section (Mobile Drawer) */}
            <div className="mt-4 pt-3.5 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="h-9 w-9 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
                  {user?.name ? user.name.slice(0, 2).toUpperCase() : 'DK'}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-zinc-950 dark:text-white truncate">
                    {user?.name || 'Pengguna'}
                  </p>
                  <p className="text-[11px] text-zinc-400 dark:text-zinc-500 truncate font-mono">
                    {user?.email || 'Belum masuk'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={async () => {
                  setIsMoreDrawerOpen(false);
                  await logout();
                  router.push('/login');
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 active:scale-95 border border-rose-500/20 transition-all cursor-pointer shrink-0"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Keluar</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Compact Filament Mobile Bottom Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 px-3 py-1.5 flex items-center justify-around shadow-sm">
        <Link
          href="/dashboard"
          className={cn(
            'flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-lg text-[10px] font-medium transition-colors',
            pathname === '/dashboard'
              ? 'text-amber-600 dark:text-amber-400 font-bold'
              : 'text-zinc-500 dark:text-zinc-400'
          )}
        >
          <LayoutDashboard className="h-4 w-4" />
          <span>Beranda</span>
        </Link>

        <Link
          href="/transactions"
          className={cn(
            'flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-lg text-[10px] font-medium transition-colors',
            pathname.startsWith('/transactions')
              ? 'text-amber-600 dark:text-amber-400 font-bold'
              : 'text-zinc-500 dark:text-zinc-400'
          )}
        >
          <ArrowLeftRight className="h-4 w-4" />
          <span>Transaksi</span>
        </Link>

        <button
          onClick={() => setIsMenuOpen(true)}
          aria-label="Tambah Transaksi"
          className="h-10 w-10 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-xs hover:bg-amber-400 transition-colors"
        >
          <Plus className="h-5 w-5 stroke-[2.5]" />
        </button>

        <Link
          href="/accounts"
          className={cn(
            'flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-lg text-[10px] font-medium transition-colors',
            pathname.startsWith('/accounts')
              ? 'text-amber-600 dark:text-amber-400 font-bold'
              : 'text-zinc-500 dark:text-zinc-400'
          )}
        >
          <Wallet className="h-4 w-4" />
          <span>Rekening</span>
        </Link>

        <button
          onClick={() => setIsMoreDrawerOpen(true)}
          className={cn(
            'flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-lg text-[10px] font-medium transition-colors',
            isMoreDrawerOpen || ['/calendar', '/budgets', '/goals', '/statement', '/reports', '/categories', '/settings'].some((p) =>
              pathname.startsWith(p)
            )
              ? 'text-amber-600 dark:text-amber-400 font-bold'
              : 'text-zinc-500 dark:text-zinc-400'
          )}
        >
          <MoreHorizontal className="h-4 w-4" />
          <span>Lainnya</span>
        </button>
      </nav>
    </>
  );
}
