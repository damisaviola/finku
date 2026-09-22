'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Wallet,
  ArrowRight,
  Sparkles,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  Sun,
  Moon,
  CheckCircle2,
  FileText,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDompetKu } from '@/lib/store';
import { signInWithGoogle, loginUserWithEmail } from '@/lib/supabase/auth';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { SupabaseConfigModal } from '@/components/auth/supabase-config-modal';

function GoogleIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { setCleanUserSession, resetToDemoData, showToast, isDarkMode, toggleTheme } = useDompetKu();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!email.trim()) {
      newErrors.email = 'Alamat email wajib diisi.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Masukkan alamat email yang valid.';
    }

    if (!password) {
      newErrors.password = 'Kata sandi wajib diisi.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    // Cek jika akun demo default
    const normalizedEmail = email.trim().toLowerCase();
    if (normalizedEmail === 'budi.santoso@example.com') {
      setTimeout(() => {
        resetToDemoData();
        setIsLoading(false);
        showToast('Masuk sebagai Akun Demo (Budi Santoso)', 'success');
        router.push('/dashboard');
      }, 350);
      return;
    }

    try {
      const { error, user, accounts } = await loginUserWithEmail(normalizedEmail, password);

      if (error) {
        setIsLoading(false);
        setErrors({ form: error.message });
        showToast(error.message, 'error');
        return;
      }

      if (user) {
        setCleanUserSession(user, accounts as any);
        setIsLoading(false);
        showToast('Selamat datang kembali di DompetKu!', 'success');
        router.push('/dashboard');
      }
    } catch (err) {
      setIsLoading(false);
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan saat masuk.';
      setErrors({ form: msg });
      showToast(msg, 'error');
    }
  };

  const handleGoogleLogin = async () => {
    if (!isSupabaseConfigured) {
      setShowConfigModal(true);
      return;
    }

    setIsGoogleLoading(true);
    const { error } = await signInWithGoogle();
    if (error) {
      setIsGoogleLoading(false);
      showToast(error.message, 'error');
    }
    // If successful, Supabase redirects the browser to Google OAuth consent
  };

  const handleQuickDemoLogin = () => {
    setEmail('budi.santoso@example.com');
    setPassword('DemoPassword123');
    setIsLoading(true);
    setTimeout(() => {
      resetToDemoData();
      setIsLoading(false);
      showToast('Masuk sebagai Akun Demo (Budi Santoso)', 'success');
      router.push('/dashboard');
    }, 350);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col justify-between transition-colors">
      {/* Top Header Bar */}
      <header className="w-full px-5 py-4 sm:px-8 sm:py-5 flex items-center justify-between border-b border-zinc-200/60 dark:border-zinc-800/60">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
            <Wallet className="h-4 w-4 stroke-[2.5]" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-base font-bold tracking-tight text-zinc-950 dark:text-white">
              DompetKu
            </span>
            <span className="text-[10px] font-semibold font-mono px-1.5 py-0.2 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
              v1.0
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline text-xs text-zinc-500 dark:text-zinc-400">
            Belum punya akun?
          </span>
          <Link
            href="/register"
            className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:border-amber-500/50 shadow-xs transition-colors"
          >
            Daftar Akun
          </Link>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Ganti tema tampilan"
            className="p-1.5 rounded-xl text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 transition-colors shadow-xs cursor-pointer"
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
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-10">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Minimalist Editorial Showcase (Desktop Only) */}
          <div className="hidden lg:flex lg:col-span-6 flex-col justify-center space-y-6 pr-4">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 w-fit">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Penyimpanan Lokal Privat & Bebas Iklan</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-zinc-950 dark:text-white leading-tight">
                Pencatatan keuangan presisi, tanpa kompromi.
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Kelola mutasi multi-rekening, kendalikan pagu anggaran bulanan, pantau target tabungan, dan cetak rekening koran resmi PDF langsung dari peramban Anda.
              </p>
            </div>

            {/* Feature Cards Micro Showcase */}
            <div className="space-y-2.5 pt-2">
              <div className="p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-xs flex items-start gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
                  <FileText className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-xs font-semibold text-zinc-900 dark:text-white">
                    Rekening Koran Otomatis
                  </h2>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Kalkulasi saldo berjalan (*running balance*) instan dengan format PDF perbankan resmi.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-xs flex items-start gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-xs font-semibold text-zinc-900 dark:text-white">
                    Proteksi Validasi Saldo Defisit
                  </h2>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Mencegah saldo negatif dan memastikan setiap pengeluaran tercatat akurat.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-xs flex items-start gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-xs font-semibold text-zinc-900 dark:text-white">
                    Keamanan & Privasi Maksimal
                  </h2>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Data tersimpan aman di peramban Anda tanpa pengiriman ke pelacak pihak ketiga.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Sleek Minimalist Login Form Card */}
          <div className="w-full max-w-md mx-auto lg:col-span-6">
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-8 shadow-xs ring-1 ring-zinc-950/5 dark:ring-white/5 space-y-5">
              {/* Form Title & Subtitle */}
              <div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
                  Masuk ke Akun
                </h2>
                <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                  Masukkan alamat email dan kata sandi Anda untuk mengelola keuangan.
                </p>
              </div>

              {errors.form && (
                <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2.5">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
                  <span>{errors.form}</span>
                </div>
              )}

              {/* Formulir Email & Sandi */}
              <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4">
                {/* Kolom Email */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-200">
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
                        if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                      }}
                      className={`w-full rounded-xl border pl-9 pr-3.5 py-2 text-xs sm:text-sm bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 shadow-xs transition-colors ${
                        errors.email
                          ? 'border-rose-500 dark:border-rose-500'
                          : 'border-zinc-300 dark:border-zinc-700'
                      }`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-[11px] font-medium text-rose-600 dark:text-rose-400">
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Kolom Kata Sandi */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-200">
                      Kata Sandi <span className="text-rose-500">*</span>
                    </label>
                    <Link
                      href="/forgot-password"
                      className="text-xs text-amber-600 dark:text-amber-400 hover:underline font-medium"
                    >
                      Lupa sandi?
                    </Link>
                  </div>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-3 h-4 w-4 text-zinc-400 dark:text-zinc-500 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
                      }}
                      className={`w-full rounded-xl border pl-9 pr-10 py-2 text-xs sm:text-sm bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 shadow-xs transition-colors ${
                        errors.password
                          ? 'border-rose-500 dark:border-rose-500'
                          : 'border-zinc-300 dark:border-zinc-700'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                      className="absolute right-3 p-0.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-[11px] font-medium text-rose-600 dark:text-rose-400">
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Tombol Utama Masuk */}
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full h-10 font-semibold shadow-xs"
                  isLoading={isLoading}
                  disabled={isGoogleLoading}
                >
                  <span>Masuk ke Akun</span>
                  <ArrowRight className="h-4 w-4 ml-1.5" />
                </Button>
              </form>

              {/* Pemisah Garis Formal */}
              <div className="relative flex items-center py-1">
                <div className="flex-grow border-t border-zinc-200 dark:border-zinc-800" />
                <span className="flex-shrink mx-3 text-[11px] font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                  atau masuk dengan
                </span>
                <div className="flex-grow border-t border-zinc-200 dark:border-zinc-800" />
              </div>

              {/* Tombol Google (Di Bawah Form) */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading || isGoogleLoading}
                className="w-full flex items-center justify-center gap-2.5 h-10 px-4 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-100 font-semibold text-xs sm:text-sm shadow-xs hover:border-zinc-400 dark:hover:border-zinc-600 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
              >
                {isGoogleLoading ? (
                  <div className="h-4 w-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <GoogleIcon className="h-4 w-4 shrink-0" />
                )}
                <span>Masuk dengan Google</span>
              </button>

              {/* Kartu Pintas Akun Demo (Estetis & Praktis) */}
              <div className="rounded-xl p-3 border border-amber-500/25 bg-amber-500/5 dark:bg-amber-500/10 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0">
                    <Sparkles className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-zinc-900 dark:text-zinc-100 text-[11px]">
                      Mode Uji Coba Demo
                    </p>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono truncate">
                      budi.santoso@example.com
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleQuickDemoLogin}
                  disabled={isLoading || isGoogleLoading}
                  className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-amber-500 hover:bg-amber-600 text-white shadow-xs transition-colors shrink-0 cursor-pointer active:scale-95"
                >
                  Isi & Masuk
                </button>
              </div>

              {/* Footer Tautan Registrasi */}
              <div className="pt-2 text-center text-xs text-zinc-500 dark:text-zinc-400 border-t border-zinc-100 dark:divide-zinc-800 dark:border-zinc-800/80">
                Belum memiliki akun?{' '}
                <Link
                  href="/register"
                  className="text-amber-600 dark:text-amber-400 font-semibold hover:underline ml-1"
                >
                  Daftar sekarang gratis
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Footer Note */}
      <footer className="w-full px-5 py-3 text-center text-[11px] text-zinc-400 dark:text-zinc-500 border-t border-zinc-200/60 dark:border-zinc-800/60">
        © 2026 DompetKu Financial Services • Aman, Privat, dan Tanpa Pelacak
      </footer>

      {/* Supabase OAuth Setup Guide Modal */}
      <SupabaseConfigModal
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        onUseDemo={handleQuickDemoLogin}
      />
    </div>
  );
}
