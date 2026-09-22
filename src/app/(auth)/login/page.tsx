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
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  FileText,
  CreditCard,
  Wifi,
  Star,
  Check,
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
  const [rememberMe, setRememberMe] = useState(true);
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
      }, 400);
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
    }, 400);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col justify-between transition-colors relative overflow-hidden">
      {/* Dynamic Background Atmosphere Orbs */}
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
          <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <span>Belum memiliki akun?</span>
            <Link
              href="/register"
              className="font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 hover:underline transition-colors"
            >
              Daftar sekarang
            </Link>
          </div>

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

      {/* Main Content Showcase */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-10 my-auto">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
          
          {/* Left Column: Visual Fintech Experience (Desktop Showcase) */}
          <div className="hidden lg:flex lg:col-span-6 flex-col justify-center space-y-7 pr-2">
            
            {/* Tag Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/25 shadow-xs w-fit">
              <Sparkles className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
              <span>Platform Manajemen Keuangan Terpadu</span>
            </div>

            {/* Headline */}
            <div className="space-y-3">
              <h1 className="text-3xl xl:text-4xl font-extrabold tracking-tight text-zinc-950 dark:text-white leading-[1.18]">
                Kendalikan Arus Kas Pribadi dengan{' '}
                <span className="bg-gradient-to-r from-amber-600 via-amber-500 to-emerald-500 bg-clip-text text-transparent">
                  Presisi Penuh
                </span>.
              </h1>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-lg">
                Satu aplikasi cerdas untuk mengelola seluruh rekening bank, dompet digital, anggaran bulanan, target tabungan, hingga ekspor rekening koran PDF resmi.
              </p>
            </div>

            {/* Interactive Fintech Card Mockup */}
            <div className="relative pt-2 pb-3">
              {/* Premium Debit/Wallet Card */}
              <div className="relative z-10 w-full max-w-md rounded-3xl p-6 bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 text-white border border-white/10 shadow-2xl shadow-zinc-950/20 overflow-hidden group hover:scale-[1.01] transition-transform duration-300">
                {/* Light reflection effect */}
                <div className="absolute -top-12 -right-12 w-40 h-40 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                      <CreditCard className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-bold tracking-wider uppercase text-zinc-300">
                      BCA Platinum Priority
                    </span>
                  </div>
                  <Wifi className="h-5 w-5 text-zinc-400 rotate-90" />
                </div>

                <div className="mt-6 mb-4">
                  <p className="text-[11px] font-medium text-zinc-400 tracking-wide">
                    Saldo Aktif Berjalan
                  </p>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-2xl xl:text-3xl font-extrabold tracking-tight text-white font-mono">
                      Rp 48.250.000
                    </span>
                    <span className="inline-flex items-center text-[10px] font-semibold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      <TrendingUp className="h-3 w-3 mr-0.5" /> +18.4%
                    </span>
                  </div>
                </div>

                <div className="flex items-end justify-between pt-2 border-t border-zinc-800/80 text-xs">
                  <div>
                    <p className="text-[9px] uppercase tracking-wider text-zinc-500 font-semibold">
                      Pemilik Rekening
                    </p>
                    <p className="font-semibold text-zinc-200 mt-0.5">Budi Santoso</p>
                  </div>
                  <div className="text-right font-mono text-[11px] text-zinc-400 tracking-wider">
                    •••• 8920
                  </div>
                </div>
              </div>

              {/* Overlapping Floating Micro Widget: Real-time Cashflow */}
              <div className="absolute -bottom-2 right-2 sm:right-6 z-20 rounded-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md p-3.5 border border-zinc-200/80 dark:border-zinc-800 shadow-xl shadow-zinc-950/10 flex items-center gap-3 animate-bounce-subtle">
                <div className="h-9 w-9 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div className="pr-1">
                  <p className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400">
                    Pemasukan Gaji Terverifikasi
                  </p>
                  <p className="text-xs font-bold text-zinc-950 dark:text-white font-mono">
                    +Rp 15.000.000
                  </p>
                </div>
              </div>

              {/* Overlapping Floating Micro Widget: Statement PDF */}
              <div className="absolute -top-3 -left-3 z-20 rounded-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md px-3.5 py-2.5 border border-zinc-200/80 dark:border-zinc-800 shadow-xl shadow-zinc-950/10 flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <FileText className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-zinc-900 dark:text-zinc-100">
                    Rekening Koran Bank-Grade
                  </p>
                  <p className="text-[9px] text-zinc-500 dark:text-zinc-400">
                    Ekspor PDF Instan & Resmi
                  </p>
                </div>
              </div>
            </div>

            {/* Trust and Social Proof Footprint */}
            <div className="pt-2 flex items-center gap-6 text-xs text-zinc-500 dark:text-zinc-400">
              <div className="flex items-center gap-1.5">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-current" />
                  ))}
                </div>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">4.9/5</span>
                <span>(10k+ pengguna)</span>
              </div>

              <div className="flex items-center gap-1.5 border-l border-zinc-300 dark:border-zinc-800 pl-4">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <span>100% Privat & Tanpa Iklan</span>
              </div>
            </div>

          </div>

          {/* Right Column: High-End Auth Card */}
          <div className="w-full max-w-md mx-auto lg:col-span-6">
            <div className="rounded-3xl border border-zinc-200/90 dark:border-zinc-800/90 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl p-6 sm:p-8 shadow-2xl shadow-zinc-950/5 dark:shadow-black/50 space-y-6">
              
              {/* Segmented Auth Navigation Control */}
              <div className="p-1 rounded-2xl bg-zinc-100 dark:bg-zinc-800/70 border border-zinc-200/70 dark:border-zinc-700/60 grid grid-cols-2 gap-1 text-xs font-semibold">
                <div className="py-2 text-center rounded-xl bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white shadow-xs font-bold transition-all">
                  Masuk Akun
                </div>
                <Link
                  href="/register"
                  className="py-2 text-center rounded-xl text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-all"
                >
                  Daftar Baru
                </Link>
              </div>

              {/* Form Title & Greeting */}
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
                  Selamat Datang Kembali 👋
                </h2>
                <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                  Akses dasbor finansial dan kelola mutasi kas harian Anda.
                </p>
              </div>

              {/* Alert Error Box */}
              {errors.form && (
                <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5 animate-shake">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-500 mt-0.5" />
                  <span className="leading-snug">{errors.form}</span>
                </div>
              )}

              {/* Main Login Form */}
              <form onSubmit={handleSubmit} autoComplete="on" className="space-y-4">
                {/* Email Field */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-200">
                    Alamat Email <span className="text-rose-500">*</span>
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
                        if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                      }}
                      className={`w-full rounded-2xl border pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 shadow-xs transition-all ${
                        errors.email
                          ? 'border-rose-500 dark:border-rose-500'
                          : 'border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600'
                      }`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-[11px] font-medium text-rose-600 dark:text-rose-400">
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-200">
                      Kata Sandi <span className="text-rose-500">*</span>
                    </label>
                    <Link
                      href="/forgot-password"
                      className="text-xs text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 hover:underline font-semibold transition-colors"
                    >
                      Lupa kata sandi?
                    </Link>
                  </div>
                  <div className="relative flex items-center group">
                    <Lock className="absolute left-3.5 h-4 w-4 text-zinc-400 dark:text-zinc-500 group-focus-within:text-amber-500 transition-colors pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
                      }}
                      className={`w-full rounded-2xl border pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 shadow-xs transition-all ${
                        errors.password
                          ? 'border-rose-500 dark:border-rose-500'
                          : 'border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                      className="absolute right-3.5 p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer"
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

                {/* Remember Me Checkbox */}
                <div className="flex items-center pt-0.5">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-600 dark:text-zinc-400 select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-zinc-300 dark:border-zinc-700 text-amber-500 focus:ring-amber-500/30"
                    />
                    <span>Ingat sesi masuk saya</span>
                  </label>
                </div>

                {/* Submit Button with Glow Effect */}
                <button
                  type="submit"
                  disabled={isLoading || isGoogleLoading}
                  className="w-full h-11 rounded-2xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 shadow-lg shadow-amber-500/25 hover:shadow-amber-500/35 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Masuk ke Dashboard</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Or Divider */}
              <div className="relative flex items-center py-0.5">
                <div className="flex-grow border-t border-zinc-200 dark:border-zinc-800" />
                <span className="flex-shrink mx-3 text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                  atau lanjutkan dengan
                </span>
                <div className="flex-grow border-t border-zinc-200 dark:border-zinc-800" />
              </div>

              {/* Google OAuth Button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading || isGoogleLoading}
                className="w-full flex items-center justify-center gap-3 h-10.5 px-4 rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-100 font-semibold text-xs sm:text-sm shadow-xs hover:border-zinc-400 dark:hover:border-zinc-600 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
              >
                {isGoogleLoading ? (
                  <div className="h-4 w-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <GoogleIcon className="h-4 w-4 shrink-0" />
                )}
                <span>Masuk dengan Google</span>
              </button>

              {/* Demo Account Quick Access Box */}
              <div className="rounded-2xl p-3.5 border border-amber-500/25 bg-amber-500/5 dark:bg-amber-500/10 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-zinc-950 dark:text-white text-xs">
                      Uji Coba Demo Instan
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
                  className="px-3 py-1.5 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-white shadow-xs transition-colors shrink-0 cursor-pointer active:scale-95"
                >
                  Masuk Demo
                </button>
              </div>

              {/* Bottom Sign-Up Link */}
              <div className="pt-1 text-center text-xs text-zinc-500 dark:text-zinc-400 border-t border-zinc-100 dark:border-zinc-800/80">
                Belum memiliki akun?{' '}
                <Link
                  href="/register"
                  className="text-amber-600 dark:text-amber-400 font-bold hover:underline ml-1"
                >
                  Daftar akun gratis
                </Link>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* Bottom Footer Note */}
      <footer className="relative z-10 w-full px-5 py-3.5 text-center text-[11px] text-zinc-400 dark:text-zinc-500 border-t border-zinc-200/70 dark:border-zinc-800/70 bg-white/40 dark:bg-zinc-950/40 backdrop-blur-xs">
        © 2026 DompetKu Financial Intelligence • Terenkripsi, Privat, dan Tanpa Pelacak Pihak Ketiga
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
