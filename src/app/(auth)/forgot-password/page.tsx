'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Wallet,
  ArrowLeft,
  CheckCircle2,
  Mail,
  Sun,
  Moon,
  ArrowRight,
  KeyRound,
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
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col justify-between transition-colors">
      {/* Top Clean Minimal Navbar */}
      <header className="w-full px-5 py-4 sm:px-8 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center">
            <Wallet className="h-4 w-4 stroke-[2.2]" />
          </div>
          <span className="text-base font-bold tracking-tight text-zinc-950 dark:text-white">
            DompetKu
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Kembali ke Halaman Masuk</span>
          </Link>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Ganti tema tampilan"
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 transition-colors cursor-pointer"
            title={isDarkMode ? 'Mode Terang' : 'Mode Gelap'}
          >
            {isDarkMode ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <div className="w-full max-w-md">
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-8 space-y-5">
            
            {isSubmitted ? (
              <div className="text-center space-y-4 py-3">
                <div className="h-12 w-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-zinc-950 dark:text-white">
                    Tautan Terkirim
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 max-w-xs mx-auto leading-relaxed">
                    Petunjuk pengaturan ulang kata sandi telah dikirim ke{' '}
                    <strong className="text-zinc-900 dark:text-zinc-100 font-mono">{email}</strong>.
                  </p>
                </div>
                <Link href="/login" className="block w-full pt-2">
                  <button
                    type="button"
                    className="w-full h-10 rounded-lg font-medium text-xs border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 transition-colors cursor-pointer"
                  >
                    Kembali ke Halaman Masuk
                  </button>
                </Link>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white flex items-center justify-center shrink-0">
                    <KeyRound className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold tracking-tight text-zinc-950 dark:text-white">
                      Lupa Kata Sandi?
                    </h2>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                      Masukkan email Anda untuk pemulihan kata sandi.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                      Alamat Email <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <Mail className="absolute left-3 h-4 w-4 text-zinc-400 dark:text-zinc-500 pointer-events-none" />
                      <input
                        type="email"
                        required
                        placeholder="nama@email.com"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (error) setError('');
                        }}
                        className={`w-full rounded-lg border pl-9 pr-3 py-2 text-xs sm:text-sm bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-950 dark:focus:ring-white focus:border-zinc-950 dark:focus:border-white transition-colors ${
                          error
                            ? 'border-rose-500'
                            : 'border-zinc-300 dark:border-zinc-700'
                        }`}
                      />
                    </div>
                    {error && (
                      <p className="text-[11px] text-rose-600 dark:text-rose-400">
                        {error}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-10 rounded-lg font-semibold text-xs sm:text-sm text-white dark:text-zinc-950 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Kirim Tautan Atur Ulang</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>

                <div className="pt-1 text-center text-xs text-zinc-500 dark:text-zinc-400 border-t border-zinc-100 dark:border-zinc-800">
                  Ingat kata sandi Anda?{' '}
                  <Link
                    href="/login"
                    className="text-zinc-900 dark:text-white font-semibold hover:underline ml-1"
                  >
                    Masuk di sini
                  </Link>
                </div>
              </>
            )}

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full px-5 py-3.5 text-center text-[11px] text-zinc-400 dark:text-zinc-500 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        © 2026 DompetKu • Pelacak Keuangan Pribadi
      </footer>
    </div>
  );
}
