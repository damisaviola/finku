'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Wallet,
  Sun,
  Moon,
  AlertCircle,
  Loader2,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react';
import { useDompetKu } from '@/lib/store';

export default function ForgotPasswordPage() {
  const { showToast, isDarkMode, toggleTheme } = useDompetKu();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError('Masukkan alamat email yang valid.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
      showToast('Tautan atur ulang kata sandi telah dikirim ke email Anda.', 'success');
    }, 400);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col justify-between">
      {/* Top Bar with Minimal Theme Switch */}
      <div className="w-full max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-amber-500 flex items-center justify-center text-white">
            <Wallet className="h-4 w-4 stroke-[2.5]" />
          </div>
          <span className="text-base font-bold tracking-tight text-zinc-950 dark:text-white">
            DompetKu
          </span>
        </Link>

        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Ganti tema tampilan"
          className="p-2 rounded-lg text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
          title={isDarkMode ? 'Mode Terang' : 'Mode Gelap'}
        >
          {isDarkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
        </button>
      </div>

      {/* Centered Box */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm space-y-6">
          
          {/* Header Copy */}
          <div className="space-y-1.5 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
              Atur ulang kata sandi
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Masukkan email yang terdaftar untuk menerima tautan pemulihan.
            </p>
          </div>

          {/* Form Card */}
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-xs space-y-5">
            {isSubmitted ? (
              <div className="py-4 text-center space-y-3">
                <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <h2 className="text-base font-semibold text-zinc-950 dark:text-white">
                  Tautan Terkirim
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto">
                  Instruksi pengaturan ulang sandi telah dikirim ke <strong className="text-zinc-900 dark:text-white font-medium">{email}</strong>.
                </p>
                <Link
                  href="/login"
                  className="inline-block mt-2 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline"
                >
                  Kembali ke halaman masuk
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0 text-rose-500 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError('');
                    }}
                    className={`w-full h-10 px-3 rounded-lg border text-sm bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-colors ${
                      error ? 'border-rose-500' : 'border-zinc-300 dark:border-zinc-700'
                    }`}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-10 rounded-lg font-semibold text-sm text-white bg-amber-500 hover:bg-amber-400 active:bg-amber-600 shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                  ) : (
                    <span>Kirim Tautan Atur Ulang</span>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Back link */}
          <div className="text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Kembali ke halaman masuk</span>
            </Link>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 text-center text-xs text-zinc-400 dark:text-zinc-500">
        © 2026 DompetKu • Pelacak Keuangan Pribadi
      </footer>
    </div>
  );
}
