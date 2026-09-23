'use client';

import React from 'react';
import { Dialog, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Key, Database, ExternalLink, CheckCircle2 } from 'lucide-react';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SupabaseConfigModal({
  isOpen,
  onClose,
}: SupabaseConfigModalProps) {
  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      icon={<Key className="h-5 w-5" />}
      iconVariant="amber"
      badge="Setup Diperlukan"
      title="Konfigurasi Supabase OAuth"
      description="Langkah menghubungkan autentikasi Google asli ke proyek Supabase Anda."
      maxWidth="md"
    >
      <div className="space-y-4 py-1 text-xs">
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300">
          <p className="font-semibold text-xs mb-1">
            Kredensial Supabase Belum Terhubung
          </p>
          <p className="text-[11px] leading-relaxed text-zinc-600 dark:text-zinc-300">
            Aplikasi mendeteksi bahwa berkas <code className="px-1 py-0.5 rounded bg-amber-500/20 font-mono text-[10px]">.env.local</code> masih menggunakan kredensial contoh.
          </p>
        </div>

        {/* 3 Step Setup Guide */}
        <div className="space-y-2.5">
          <p className="font-semibold text-zinc-950 dark:text-white text-xs">
            Panduan 3 Langkah Menghubungkan Google ke Supabase:
          </p>

          <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 space-y-1.5">
            <div className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-zinc-100">
              <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px]">
                1
              </span>
              <span>Atur Environment Variables di .env.local</span>
            </div>
            <p className="text-zinc-500 dark:text-zinc-400 pl-7 text-[11px]">
              Dapatkan URL & Anon Key dari <strong>Supabase Dashboard → Project Settings → API</strong>:
            </p>
            <pre className="ml-7 p-2 rounded-lg bg-zinc-900 text-amber-400 font-mono text-[10px] overflow-x-auto">
              {`NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co\nNEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...`}
            </pre>
          </div>

          <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 space-y-1.5">
            <div className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-zinc-100">
              <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px]">
                2
              </span>
              <span>Aktifkan Google Provider di Supabase</span>
            </div>
            <p className="text-zinc-500 dark:text-zinc-400 pl-7 text-[11px]">
              Buka <strong>Authentication → Providers → Google</strong>, centang <em>Enable</em>, lalu masukkan <strong>Client ID</strong> dan <strong>Client Secret</strong> dari Google Cloud Console.
            </p>
          </div>

          <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 space-y-1.5">
            <div className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-zinc-100">
              <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px]">
                3
              </span>
              <span>Eksekusi Trigger Schema Database</span>
            </div>
            <p className="text-zinc-500 dark:text-zinc-400 pl-7 text-[11px]">
              Salin dan jalankan skrip <code className="px-1 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 font-mono text-[10px]">supabase/schema.sql</code> di <strong>SQL Editor</strong> Supabase untuk mengaktifkan trigger sinkronisasi otomatis <code className="text-[10px] font-mono">handle_new_user()</code> ke tabel <code className="text-[10px] font-mono">public.users</code>.
            </p>
          </div>
        </div>
      </div>

      <DialogFooter className="justify-end sm:justify-end">
        <Button type="button" variant="primary" onClick={onClose} className="text-xs">
          Mengerti, Tutup
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
