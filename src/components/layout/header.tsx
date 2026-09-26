'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Plus, ChevronRight, Calendar, Sun, Moon, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDompetKu } from '@/lib/store';
import { formatBulan } from '@/lib/utils/formatters';

export function Header() {
  const pathname = usePathname();
  const { openTransactionModal, activeMonth, isDarkMode, toggleTheme, isPrivacyMode, togglePrivacyMode, isSyncing } = useDompetKu();

  const getBreadcrumbs = () => {
    if (pathname.startsWith('/dashboard')) {
      return [{ label: 'Ringkasan', href: '/dashboard' }, { label: 'Beranda' }];
    }
    if (pathname.startsWith('/calendar')) {
      return [{ label: 'Ringkasan', href: '/calendar' }, { label: 'Kalender Keuangan' }];
    }
    if (pathname.startsWith('/transactions')) {
      return [{ label: 'Keuangan', href: '/transactions' }, { label: 'Transaksi' }];
    }
    if (pathname.startsWith('/accounts')) {
      return [{ label: 'Keuangan', href: '/accounts' }, { label: 'Rekening Saya' }];
    }
    if (pathname.startsWith('/budgets')) {
      return [{ label: 'Perencanaan', href: '/budgets' }, { label: 'Anggaran Bulanan' }];
    }
    if (pathname.startsWith('/goals')) {
      return [{ label: 'Perencanaan', href: '/goals' }, { label: 'Target Tabungan' }];
    }
    if (pathname.startsWith('/reports')) {
      return [{ label: 'Ringkasan', href: '/reports' }, { label: 'Laporan Keuangan' }];
    }
    if (pathname.startsWith('/categories')) {
      return [{ label: 'Keuangan', href: '/categories' }, { label: 'Kategori Transaksi' }];
    }
    if (pathname.startsWith('/settings')) {
      return [{ label: 'Sistem', href: '/settings' }, { label: 'Pengaturan' }];
    }
    return [{ label: 'DompetKu' }];
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="sticky top-0 z-20 h-16 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xs px-4 sm:px-8 flex items-center justify-between transition-colors">
      {/* Filament Breadcrumbs Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs">
        {breadcrumbs.map((crumb, idx) => {
          const isLast = idx === breadcrumbs.length - 1;
          return (
            <React.Fragment key={idx}>
              {idx > 0 && <ChevronRight className="h-3.5 w-3.5 text-zinc-400" />}
              {crumb.href && !isLast ? (
                <Link
                  href={crumb.href}
                  className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white font-medium"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="font-semibold text-zinc-950 dark:text-white">
                  {crumb.label}
                </span>
              )}
            </React.Fragment>
          );
        })}
      </nav>

      {/* Right Action Tools */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Active Month Indicator Pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-xs font-medium border border-zinc-200 dark:border-zinc-700">
          <Calendar className="h-3.5 w-3.5 text-amber-500" />
          <span>{formatBulan(activeMonth)}</span>
        </div>

        {/* Live Database Syncing Badge */}
        {isSyncing && (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-medium border border-amber-500/20 animate-pulse">
            <RefreshCw className="h-3 w-3 animate-spin" />
            <span className="hidden sm:inline">Sinkron...</span>
          </div>
        )}

        {/* Privacy Mode (Sensor Saldo) Button */}
        <button
          onClick={togglePrivacyMode}
          type="button"
          aria-label={isPrivacyMode ? 'Tampilkan nominal saldo' : 'Sembunyikan nominal saldo (Mode Privasi)'}
          title={isPrivacyMode ? 'Mode Privasi Aktif: Klik untuk tampilkan saldo' : 'Sembunyikan Saldo (Mode Privasi)'}
          className={`p-2 rounded-lg transition-colors shadow-xs cursor-pointer ${isPrivacyMode
              ? 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/30'
              : 'text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/80'
            }`}
        >
          {isPrivacyMode ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>

        {/* Filament Theme Switcher Button */}
        <button
          onClick={toggleTheme}
          type="button"
          aria-label={isDarkMode ? 'Beralih ke mode terang' : 'Beralih ke mode gelap'}
          title={isDarkMode ? 'Mode Terang' : 'Mode Gelap'}
          className="p-2 rounded-lg text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/80 transition-colors shadow-xs"
        >
          {isDarkMode ? (
            <Sun className="h-4 w-4 text-amber-400" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </button>

        {/* Quick Add Transaction Button */}
        <Button
          onClick={() => openTransactionModal('expense')}
          variant="primary"
          size="sm"
          className="font-semibold shadow-xs"
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          <span className="hidden xs:inline">Tambah Transaksi</span>
          <span className="xs:hidden">Transaksi</span>
        </Button>
      </div>
    </header>
  );
}
