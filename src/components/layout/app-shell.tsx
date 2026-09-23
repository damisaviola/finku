'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Wallet, Loader2 } from 'lucide-react';
import { useDompetKu } from '@/lib/store';
import { Sidebar } from './sidebar';
import { BottomNav } from './bottom-nav';
import { Header } from './header';
import { TransactionModal } from '@/components/transactions/transaction-modal';
import { ToastContainer } from '@/components/ui/toast';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isClient } = useDompetKu();

  const isAuthPage =
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/reset-password');

  useEffect(() => {
    if (!isClient) return;

    // Jika pengguna TIDAK mempunyai riwayat login dan mencoba mengakses rute terproteksi
    if (!user && !isAuthPage) {
      router.replace('/login');
    }

    // Jika pengguna SUDAH mempunyai riwayat login dan mencoba membuka halaman login/register
    if (user && (pathname === '/login' || pathname === '/register')) {
      router.replace('/dashboard');
    }
  }, [isClient, user, isAuthPage, pathname, router]);

  // Loading state awal saat client memeriksa localStorage
  if (!isClient) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-amber-500 flex items-center justify-center text-white shadow-xs animate-pulse">
            <Wallet className="h-5 w-5 stroke-[2.5]" />
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-500" />
            <span>Memeriksa sesi pengguna...</span>
          </div>
        </div>
      </div>
    );
  }

  // Tahan render dan tampilkan status pengalihan jika belum login di halaman terproteksi
  if (!user && !isAuthPage) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-amber-500 flex items-center justify-center text-white shadow-xs">
            <Wallet className="h-5 w-5 stroke-[2.5]" />
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-500" />
            <span>Mengarahkan ke halaman masuk...</span>
          </div>
        </div>
      </div>
    );
  }

  // Tahan render jika sudah login dan masih di halaman login / register
  if (user && (pathname === '/login' || pathname === '/register')) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-amber-500 flex items-center justify-center text-white shadow-xs">
            <Wallet className="h-5 w-5 stroke-[2.5]" />
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-500" />
            <span>Mengarahkan ke dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  // Tampilan halaman auth (login, register, forgot-password, reset-password)
  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col">
        {children}
        <ToastContainer />
      </div>
    );
  }

  // Tampilan halaman terproteksi (dashboard, transaksi, rekening, dll.)
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-24 lg:pb-10">
        <Header />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />

      {/* Global Modals & Notifications */}
      <TransactionModal />
      <ToastContainer />
    </div>
  );
}
