'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  PieChart,
  Target,
  BarChart3,
  Tags,
  Settings,
  LogOut,
  ChevronRight,
  Layers,
  FileText,
  CalendarDays,
} from 'lucide-react';
import { cn } from '@/lib/utils/formatters';
import { useDompetKu } from '@/lib/store';

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, transactions, budgets, goals, accounts, logout } = useDompetKu();

  const navigationGroups = [
    {
      title: 'RINGKASAN',
      items: [
        { label: 'Beranda', href: '/dashboard', icon: LayoutDashboard },
        { label: 'Kalender', href: '/calendar', icon: CalendarDays },
        { label: 'Laporan', href: '/reports', icon: BarChart3 },
      ],
    },
    {
      title: 'KEUANGAN',
      items: [
        {
          label: 'Transaksi',
          href: '/transactions',
          icon: ArrowLeftRight,
          badge: transactions.length > 0 ? String(transactions.length) : undefined,
        },
        {
          label: 'Rekening',
          href: '/accounts',
          icon: Wallet,
          badge: accounts.length > 0 ? String(accounts.length) : undefined,
        },
        {
          label: 'Rekening Koran',
          href: '/statement',
          icon: FileText,
        },
        { label: 'Kategori', href: '/categories', icon: Tags },
      ],
    },
    {
      title: 'PERENCANAAN',
      items: [
        {
          label: 'Anggaran',
          href: '/budgets',
          icon: PieChart,
          badge: budgets.length > 0 ? String(budgets.length) : undefined,
        },
        {
          label: 'Target Tabungan',
          href: '/goals',
          icon: Target,
          badge: goals.length > 0 ? String(goals.length) : undefined,
        },
      ],
    },
    {
      title: 'SISTEM',
      items: [
        { label: 'Pengaturan', href: '/settings', icon: Settings },
      ],
    },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 h-screen sticky top-0 z-30 select-none">
      {/* Filament Panel Brand Header */}
      <div className="h-16 px-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-amber-500 flex items-center justify-center text-white shadow-xs">
            <Wallet className="h-4 w-4 stroke-[2.5]" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-zinc-950 dark:text-white leading-none">
              DompetKu
            </span>
            <span className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mt-0.5">
              Panel Keuangan
            </span>
          </div>
        </Link>
        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
          v1.0
        </span>
      </div>

      {/* Filament Grouped Navigation Links */}
      <div className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
        {navigationGroups.map((group) => (
          <div key={group.title} className="space-y-1">
            <div className="px-3 pb-1 text-[11px] font-bold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase">
              {group.title}
            </div>
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== '/dashboard' && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors',
                    isActive
                      ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 font-semibold'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/70 hover:text-zinc-950 dark:hover:text-zinc-100'
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon
                      className={cn(
                        'h-4 w-4 shrink-0',
                        isActive
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-zinc-400 dark:text-zinc-500'
                      )}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={cn(
                        'px-1.5 py-0.5 text-[10px] font-bold rounded-md',
                        isActive
                          ? 'bg-amber-500 text-white'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700'
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Filament User Footer Profile */}
      <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
        <div className="flex items-center justify-between p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-8 w-8 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold flex items-center justify-center text-xs shrink-0">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'DK'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-zinc-900 dark:text-white truncate leading-tight">
                {user?.name || 'Pengguna'}
              </p>
              <p className="text-[11px] text-zinc-400 dark:text-zinc-500 truncate leading-tight">
                {user?.email || 'Belum masuk'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={async () => {
              await logout();
              router.push('/login');
            }}
            aria-label="Keluar dari akun"
            className="p-1.5 text-zinc-400 hover:text-rose-600 rounded-md hover:bg-white dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
