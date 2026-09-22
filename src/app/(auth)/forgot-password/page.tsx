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
  ShieldCheck,
  AlertCircle,
  KeyRound,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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
    }, 500);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col justify-between transition-colors relative overflow-hidden">
      {/* Background Atmosphere Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[550px] h-[550px] rounded-full bg-gradient-to-tl from-emerald-500/15 via-teal-500/10 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#d4d4d8_1px,transparent_1px)] dark:bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-60" />

      {/* Top Glassmorphic Navigation Bar */}
      <header className="relative z-10 w-full px-5 py-3.5 sm:px-8 sm:py-4 flex items-center justify-between border-b border-zinc-200/70 dark:border-zinc-800/70 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 flex items-center justify-center text-white shadow-md shadow-amber-500/20 group-hover:scale-105 transition-all">
            <Wallet className="h-4.5 w-4.5 stroke-[2.5]" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold tracking-tight text-zinc-950 dark:text-white">
              DompetKu
            </span>
            <span className="text-[10px] font-semibold font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/25">
              PRO
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Kembali ke Halaman Masuk</span>
          </Link>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Ganti tema tampilan"
            className="p-2 rounded-xl text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xs transition-all shadow-xs cursor-pointer active:scale-95"
            title={isDarkMode ? 'Mode Terang' : 'Mode Gelap'}
          >
            {isDarkMode ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-zinc-600" />
            )}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <div className="w-full max-w-md">
          <div className="rounded-3xl border border-zinc-200/90 dark:border-zinc-800/90 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl p-6 sm:p-8 shadow-2xl shadow-zinc-950/5 dark:shadow-black/50 space-y-6">
            
            {isSubmitted ? (
              <div className="text-center space-y-5 py-3">
                <div className="h-14 w-14 rounded-3xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 flex items-center justify-center mx-auto shadow-md shadow-emerald-500/15">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-zinc-950 dark:text-white">
                    Tautan Terkirim! 📬
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 max-w-xs mx-auto leading-relaxed">
                    Petunjuk pengaturan ulang kata sandi telah dikirim ke alamat{' '}
                    <strong className="text-zinc-900 dark:text-zinc-100 font-mono">{email}</strong>. Silakan periksa kotak masuk atau folder spam Anda.
                  </p>
                </div>
                <Link href="/login" className="block w-full pt-2">
                  <Button
                    variant="secondary"
                    className="w-full h-11 text-xs font-bold rounded-2xl"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    <span>Kembali ke Halaman Masuk</span>
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <KeyRound className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
                      Lupa Kata Sandi?
                    </h2>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                      Pulihkan akses akun DompetKu Anda dengan mudah.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-200">
                      Alamat Email Terdaftar <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative flex items-center group">
                      <Mail className="absolute left-3.5 h-4 w-4 text-zinc-400 dark:text-zinc-500 group-focus-within:text-amber-500 transition-colors pointer-events-none" />
                      <input
                        type="email"
                        required
                        placeholder="nama@email.com"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (error) setError('');
                        }}
                        className={`w-full rounded-2xl border pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 shadow-xs transition-all ${
                          error
                            ? 'border-rose-500 dark:border-rose-500'
                            : 'border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600'
                        }`}
                      />
                    </div>
                    {error && (
                      <p className="text-[11px] font-medium text-rose-600 dark:text-rose-400">
                        {error}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-11 rounded-2xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 shadow-lg shadow-amber-500/25 hover:shadow-amber-500/35 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Kirim Tautan Atur Ulang</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>

                <div className="pt-2 text-center text-xs text-zinc-500 dark:text-zinc-400 border-t border-zinc-100 dark:border-zinc-800/80">
                  Ingat kata sandi akun Anda?{' '}
                  <Link
                    href="/login"
                    className="text-amber-600 dark:text-amber-400 font-bold hover:underline ml-1"
                  >
                    Masuk sekarang
                  </Link>
                </div>
              </>
            )}

          </div>
        </div>
      </main>

      {/* Bottom Footer Note */}
      <footer className="relative z-10 w-full px-5 py-3.5 text-center text-[11px] text-zinc-400 dark:text-zinc-500 border-t border-zinc-200/70 dark:border-zinc-800/70 bg-white/40 dark:bg-zinc-950/40 backdrop-blur-xs">
        © 2026 DompetKu Financial Intelligence • Terenkripsi, Privat, dan Tanpa Pelacak Pihak Ketiga
      </footer>
    </div>
  );
}
