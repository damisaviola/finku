'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Wallet, Loader2 } from 'lucide-react';
import { useDompetKu } from '@/lib/store';

export default function HomePage() {
  const router = useRouter();
  const { user, isClient } = useDompetKu();

  useEffect(() => {
    if (!isClient) return;

    if (user) {
      router.replace('/dashboard');
    } else {
      router.replace('/login');
    }
  }, [isClient, user, router]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-amber-500 flex items-center justify-center text-white shadow-xs animate-pulse">
          <Wallet className="h-5 w-5 stroke-[2.5]" />
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-500" />
          <span>Memuat DompetKu...</span>
        </div>
      </div>
    </div>
  );
}
