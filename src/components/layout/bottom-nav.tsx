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
  ChevronRight,
  Sparkles,
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
    { label: 'Anggaran', href: '/budgets', icon: PieChart },
    { label: 'Target Tabungan', href: '/goals', icon: Target },
    { label: 'Kalender', href: '/calendar', icon: CalendarDays },
    { label: 'Laporan', href: '/reports', icon: BarChart3 },
    { label: 'Rekening Koran', href: '/statement', icon: FileText },
    { label: 'Kategori', href: '/categories', icon: Tags },
    { label: 'Pengaturan', href: '/settings', icon: Settings },
  ];

  const isMoreActive =
    isMoreDrawerOpen ||
    ['/debts', '/budgets', '/goals', '/calendar', '/reports', '/statement', '/categories', '/settings'].some(
      (path) => pathname.startsWith(path)
    );

  return (
    <>
      {/* Quick Add Bottom Sheet */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
          <div
            className="fixed inset-0 bg-zinc-950/60 dark:bg-zinc-950/80 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setIsMenuOpen(false)}
          />
          <div className="relative z-10 bg-white dark:bg-zinc-900 rounded-t-[32px] p-5 pt-3 pb-[max(env(safe-area-inset-bottom),1.5rem)] border-t border-zinc-200/80 dark:border-zinc-800 shadow-2xl animate-in slide-in-from-bottom duration-250">
            {/* Native Sheet Pill Drag Handle */}
            <div className="flex justify-center pb-3">
              <div className="w-10 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
            </div>

            {/* Sheet Header */}
            <div className="flex items-center justify-between pb-3.5 mb-3 border-b border-zinc-100 dark:border-zinc-800/80">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-zinc-950 dark:text-white text-sm">
                    Catat Transaksi Baru
                  </h3>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Pilih jenis pencatatan keuangan kamu
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMenuOpen(false)}
                className="h-8 w-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 active:scale-95 transition-all cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Action Cards List */}
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  openTransactionModal('expense');
                }}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-rose-200/70 dark:border-rose-900/40 bg-rose-500/[0.04] hover:bg-rose-500/[0.08] active:scale-[0.98] transition-all cursor-pointer text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-sm shadow-rose-500/25 shrink-0">
                    <TrendingDown className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-950 dark:text-white">
                      Pengeluaran
                    </h4>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      Belanja, tagihan bulanan, & jajan
                    </p>
                  </div>
                </div>
                <div className="h-7 w-7 rounded-lg flex items-center justify-center text-rose-500 dark:text-rose-400 group-hover:translate-x-0.5 transition-transform">
                  <ChevronRight className="h-4 w-4" />
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  openTransactionModal('income');
                }}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-emerald-200/70 dark:border-emerald-900/40 bg-emerald-500/[0.04] hover:bg-emerald-500/[0.08] active:scale-[0.98] transition-all cursor-pointer text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-sm shadow-emerald-500/25 shrink-0">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-950 dark:text-white">
                      Pemasukan
                    </h4>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      Gaji, bonus, profit, & kiriman dana
                    </p>
                  </div>
                </div>
                <div className="h-7 w-7 rounded-lg flex items-center justify-center text-emerald-500 dark:text-emerald-400 group-hover:translate-x-0.5 transition-transform">
                  <ChevronRight className="h-4 w-4" />
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  openTransactionModal('transfer');
                }}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-amber-200/70 dark:border-amber-900/40 bg-amber-500/[0.04] hover:bg-amber-500/[0.08] active:scale-[0.98] transition-all cursor-pointer text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 text-zinc-950 flex items-center justify-center shadow-sm shadow-amber-500/25 shrink-0">
                    <ArrowLeftRight className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-950 dark:text-white">
                      Transfer Antar Rekening
                    </h4>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      Pindah saldo antar bank & dompet digital
                    </p>
                  </div>
                </div>
                <div className="h-7 w-7 rounded-lg flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:translate-x-0.5 transition-transform">
                  <ChevronRight className="h-4 w-4" />
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* More Items Drawer */}
      {isMoreDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
          <div
            className="fixed inset-0 bg-zinc-950/60 dark:bg-zinc-950/80 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setIsMoreDrawerOpen(false)}
          />
          <div className="relative z-10 bg-white dark:bg-zinc-900 rounded-t-[32px] p-5 pt-3 pb-[max(env(safe-area-inset-bottom),1.5rem)] border-t border-zinc-200/80 dark:border-zinc-800 shadow-2xl animate-in slide-in-from-bottom duration-250">
            {/* Native Sheet Pill Drag Handle */}
            <div className="flex justify-center pb-3">
              <div className="w-10 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between pb-3.5 mb-3 border-b border-zinc-100 dark:border-zinc-800/80">
              <div>
                <h3 className="font-bold text-zinc-950 dark:text-white text-sm">
                  Menu & Modul Keuangan
                </h3>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Akses cepat seluruh fitur aplikasi DompetKu
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsMoreDrawerOpen(false)}
                className="h-8 w-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 active:scale-95 transition-all cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* 4x2 Grid of Module Squircles */}
            <div className="grid grid-cols-4 gap-2.5 py-1">
              {moreItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMoreDrawerOpen(false)}
                    className="flex flex-col items-center gap-1.5 p-1.5 rounded-2xl active:scale-95 transition-all text-center group cursor-pointer"
                  >
                    <div
                      className={cn(
                        'w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-xs',
                        isActive
                          ? 'bg-amber-500 text-zinc-950 shadow-sm shadow-amber-500/25 ring-2 ring-amber-500/40'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 group-hover:bg-zinc-200 dark:group-hover:bg-zinc-700/80'
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <span
                      className={cn(
                        'text-[10px] leading-tight line-clamp-2',
                        isActive
                          ? 'font-bold text-amber-600 dark:text-amber-400'
                          : 'font-medium text-zinc-600 dark:text-zinc-400'
                      )}
                    >
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>

            {/* User Profile & Logout Bar */}
            <div className="mt-4 pt-3.5 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 text-zinc-950 font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
                  {user?.name ? user.name.slice(0, 2).toUpperCase() : 'DK'}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-zinc-950 dark:text-white truncate">
                    {user?.name || 'Pengguna DompetKu'}
                  </p>
                  <p className="text-[11px] text-zinc-400 dark:text-zinc-500 truncate font-mono">
                    {user?.email || 'Akun aktif'}
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

      {/* Modern Frosted Mobile Bottom Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/85 dark:bg-zinc-950/85 backdrop-blur-xl border-t border-zinc-200/80 dark:border-zinc-800/80 px-2 pt-1 pb-[max(env(safe-area-inset-bottom),0.625rem)] shadow-[0_-4px_24px_rgba(0,0,0,0.05)] dark:shadow-[0_-4px_24px_rgba(0,0,0,0.35)]">
        <div className="max-w-md mx-auto grid grid-cols-5 items-end justify-items-center">
          {/* Tab 1: Beranda */}
          <Link
            href="/dashboard"
            className="flex flex-col items-center justify-center w-full py-1 text-center select-none cursor-pointer group active:scale-90 transition-transform"
          >
            <div
              className={cn(
                'relative flex items-center justify-center w-10 h-7 rounded-full transition-all duration-200',
                pathname === '/dashboard'
                  ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                  : 'text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200'
              )}
            >
              <LayoutDashboard
                className={cn(
                  'h-5 w-5 transition-transform duration-150',
                  pathname === '/dashboard' ? 'stroke-[2.25] scale-105' : 'stroke-[1.75]'
                )}
              />
            </div>
            <span
              className={cn(
                'text-[10px] tracking-tight leading-none mt-1 transition-colors',
                pathname === '/dashboard'
                  ? 'font-bold text-amber-600 dark:text-amber-400'
                  : 'font-medium text-zinc-500 dark:text-zinc-400'
              )}
            >
              Beranda
            </span>
          </Link>

          {/* Tab 2: Transaksi */}
          <Link
            href="/transactions"
            className="flex flex-col items-center justify-center w-full py-1 text-center select-none cursor-pointer group active:scale-90 transition-transform"
          >
            <div
              className={cn(
                'relative flex items-center justify-center w-10 h-7 rounded-full transition-all duration-200',
                pathname.startsWith('/transactions')
                  ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                  : 'text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200'
              )}
            >
              <ArrowLeftRight
                className={cn(
                  'h-5 w-5 transition-transform duration-150',
                  pathname.startsWith('/transactions') ? 'stroke-[2.25] scale-105' : 'stroke-[1.75]'
                )}
              />
            </div>
            <span
              className={cn(
                'text-[10px] tracking-tight leading-none mt-1 transition-colors',
                pathname.startsWith('/transactions')
                  ? 'font-bold text-amber-600 dark:text-amber-400'
                  : 'font-medium text-zinc-500 dark:text-zinc-400'
              )}
            >
              Transaksi
            </span>
          </Link>

          {/* Center Floating Action Button: Catat (+) */}
          <div className="flex flex-col items-center justify-center w-full relative">
            <button
              type="button"
              onClick={() => setIsMenuOpen(true)}
              aria-label="Catat Transaksi Baru"
              className="relative -mt-5 h-12 w-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-500 text-zinc-950 flex items-center justify-center shadow-lg shadow-amber-500/35 ring-4 ring-white dark:ring-zinc-950 active:scale-90 active:shadow-md transition-all duration-200 cursor-pointer group"
            >
              <Plus className="h-6 w-6 stroke-[2.5] transition-transform duration-200 group-hover:rotate-90 group-active:rotate-90 text-zinc-950" />
            </button>
            <span className="text-[10px] font-bold text-zinc-700 dark:text-zinc-300 mt-1">
              Catat
            </span>
          </div>

          {/* Tab 4: Rekening */}
          <Link
            href="/accounts"
            className="flex flex-col items-center justify-center w-full py-1 text-center select-none cursor-pointer group active:scale-90 transition-transform"
          >
            <div
              className={cn(
                'relative flex items-center justify-center w-10 h-7 rounded-full transition-all duration-200',
                pathname.startsWith('/accounts')
                  ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                  : 'text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200'
              )}
            >
              <Wallet
                className={cn(
                  'h-5 w-5 transition-transform duration-150',
                  pathname.startsWith('/accounts') ? 'stroke-[2.25] scale-105' : 'stroke-[1.75]'
                )}
              />
            </div>
            <span
              className={cn(
                'text-[10px] tracking-tight leading-none mt-1 transition-colors',
                pathname.startsWith('/accounts')
                  ? 'font-bold text-amber-600 dark:text-amber-400'
                  : 'font-medium text-zinc-500 dark:text-zinc-400'
              )}
            >
              Rekening
            </span>
          </Link>

          {/* Tab 5: Lainnya */}
          <button
            type="button"
            onClick={() => setIsMoreDrawerOpen(true)}
            className="flex flex-col items-center justify-center w-full py-1 text-center select-none cursor-pointer group active:scale-90 transition-transform"
          >
            <div
              className={cn(
                'relative flex items-center justify-center w-10 h-7 rounded-full transition-all duration-200',
                isMoreActive
                  ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                  : 'text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200'
              )}
            >
              <MoreHorizontal
                className={cn(
                  'h-5 w-5 transition-transform duration-150',
                  isMoreActive ? 'stroke-[2.25] scale-105' : 'stroke-[1.75]'
                )}
              />
            </div>
            <span
              className={cn(
                'text-[10px] tracking-tight leading-none mt-1 transition-colors',
                isMoreActive
                  ? 'font-bold text-amber-600 dark:text-amber-400'
                  : 'font-medium text-zinc-500 dark:text-zinc-400'
              )}
            >
              Lainnya
            </span>
          </button>
        </div>
      </nav>
    </>
  );
}

  
