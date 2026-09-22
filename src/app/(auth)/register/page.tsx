'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Wallet,
  ArrowRight,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  CheckCircle2,
  ShieldCheck,
  Sun,
  Moon,
  PiggyBank,
  Sparkles,
  AlertCircle,
  TrendingUp,
  Target,
  FileCheck2,
  Star,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDompetKu } from '@/lib/store';
import { signInWithGoogle, registerUserWithEmail } from '@/lib/supabase/auth';
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

export default function RegisterPage() {
  const router = useRouter();
  const { setCleanUserSession, showToast, isDarkMode, toggleTheme } = useDompetKu();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [terms, setTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);

  // Kalkulasi Kekuatan Kata Sandi Secara Real-time
  const passwordCriteria = useMemo(() => {
    return {
      hasMinLength: password.length >= 8,
      hasUpperAndLower: /[a-z]/.test(password) && /[A-Z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSymbol: /[^A-Za-z0-9]/.test(password),
    };
  }, [password]);

  const passwordScore = useMemo(() => {
    let score = 0;
    if (passwordCriteria.hasMinLength) score++;
    if (passwordCriteria.hasUpperAndLower) score++;
    if (passwordCriteria.hasNumber) score++;
    if (passwordCriteria.hasSymbol) score++;
    return score;
  }, [passwordCriteria]);

  const strengthConfig = useMemo(() => {
    if (password.length === 0) return { label: 'Belum diisi', color: 'bg-zinc-200 dark:bg-zinc-800', textColor: 'text-zinc-400' };
    if (passwordScore <= 1) return { label: 'Sangat Lemah', color: 'bg-rose-500', textColor: 'text-rose-500' };
    if (passwordScore === 2) return { label: 'Cukup', color: 'bg-amber-500', textColor: 'text-amber-500' };
    if (passwordScore === 3) return { label: 'Kuat', color: 'bg-blue-500', textColor: 'text-blue-500' };
    return { label: 'Sangat Kuat', color: 'bg-emerald-500', textColor: 'text-emerald-500' };
  }, [password.length, passwordScore]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Nama lengkap wajib diisi.';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Nama lengkap minimal 2 karakter.';
    } else if (name.trim().length > 100) {
      newErrors.name = 'Nama lengkap maksimal 100 karakter.';
    }

    if (!email.trim()) {
      newErrors.email = 'Masukkan alamat email yang valid.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Masukkan alamat email yang valid.';
    }

    if (!password) {
      newErrors.password = 'Kata sandi wajib diisi.';
    } else if (password.length < 8) {
      newErrors.password = 'Kata sandi minimal 8 karakter.';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Konfirmasi kata sandi tidak cocok.';
    }

    if (!terms) {
      newErrors.terms = 'Anda harus menyetujui syarat dan ketentuan layanan.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const { error, user, accounts } = await registerUserWithEmail(name, email, password);

      if (error) {
        setIsLoading(false);
        setErrors({ form: error.message });
        showToast(error.message, 'error');
        return;
      }

      if (user) {
        setCleanUserSession(user, accounts as any);
        setIsLoading(false);
        setIsSuccess(true);
        showToast('Registrasi berhasil! Akun Anda aktif di database Supabase.', 'success');
        setTimeout(() => {
          router.push('/dashboard');
        }, 1200);
      }
    } catch (err) {
      setIsLoading(false);
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan saat registrasi.';
      setErrors({ form: msg });
      showToast(msg, 'error');
    }
  };

  const handleGoogleRegister = async () => {
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

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col justify-between transition-colors relative overflow-hidden">
      {/* Background Atmosphere Orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-bl from-amber-500/15 via-orange-500/10 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[550px] h-[550px] rounded-full bg-gradient-to-tr from-emerald-500/15 via-teal-500/10 to-transparent blur-3xl pointer-events-none" />
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
            <span>Sudah memiliki akun?</span>
            <Link
              href="/login"
              className="font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 hover:underline transition-colors"
            >
              Masuk di sini
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
          
          {/* Left Column: Visual Fintech Features Showcase */}
          <div className="hidden lg:flex lg:col-span-6 flex-col justify-center space-y-7 pr-2">
            
            {/* Tag Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/25 shadow-xs w-fit">
              <Sparkles className="h-3.5 w-3.5 text-emerald-500 animate-pulse" />
              <span>Mulai Rencana Finansial Impian Anda</span>
            </div>

            {/* Headline */}
            <div className="space-y-3">
              <h1 className="text-3xl xl:text-4xl font-extrabold tracking-tight text-zinc-950 dark:text-white leading-[1.18]">
                Bebaskan Pikiran dari Beban{' '}
                <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-amber-500 bg-clip-text text-transparent">
                  Pengeluaran Liar
                </span>.
              </h1>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-lg">
                Catat setiap rupiah dengan mudah, susun target tabungan impian dengan tenggat waktu jelas, dan miliki kendali penuh atas kekayaan Anda.
              </p>
            </div>

            {/* Interactive Showcase: Financial Goal & Budget Cards */}
            <div className="space-y-3.5 pt-1">
              
              {/* Card 1: Goal Progress Widget */}
              <div className="rounded-2xl p-4.5 border border-zinc-200/90 dark:border-zinc-800/90 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md shadow-lg shadow-zinc-950/5 group hover:border-amber-500/40 transition-all">
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                      <Target className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-zinc-950 dark:text-white">
                        Target Tabungan Dana Darurat
                      </h4>
                      <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">
                        Target: Rp 30.000.000 • Sisa 3 Bulan
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400 font-mono">
                    81%
                  </span>
                </div>
                {/* Progress bar */}
                <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-600 w-[81%]" />
                </div>
                <div className="flex items-center justify-between mt-2 text-[10px] text-zinc-500 dark:text-zinc-400">
                  <span>Terkumpul: Rp 24.500.000</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">+Rp 2.000.000 bulan ini</span>
                </div>
              </div>

              {/* Card 2: Monthly Budget Alert Widget */}
              <div className="rounded-2xl p-4.5 border border-zinc-200/90 dark:border-zinc-800/90 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md shadow-lg shadow-zinc-950/5 group hover:border-emerald-500/40 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <PiggyBank className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-zinc-950 dark:text-white">
                        Pagu Anggaran Belanja Bulanan
                      </h4>
                      <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                        Status Aman: Hemat Rp 1.450.000 dari batas limit
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 px-2.5 py-1 rounded-full border border-emerald-500/25">
                    Terkendali
                  </span>
                </div>
              </div>

              {/* Card 3: Security & Privacy */}
              <div className="rounded-2xl p-4.5 border border-zinc-200/90 dark:border-zinc-800/90 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md shadow-lg shadow-zinc-950/5 flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-950 dark:text-white">
                    Proteksi Validasi Defisit Saldo
                  </h4>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                    Sistem otomatis memblokir transaksi jika saldo rekening sumber tidak mencukupi.
                  </p>
                </div>
              </div>

            </div>

            {/* Trust and Social Proof Footprint */}
            <div className="pt-1 flex items-center gap-6 text-xs text-zinc-500 dark:text-zinc-400">
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
                <FileCheck2 className="h-4 w-4 text-emerald-500" />
                <span>Format Standar Perbankan PDF</span>
              </div>
            </div>

          </div>

          {/* Right Column: Register Form Card */}
          <div className="w-full max-w-md mx-auto lg:col-span-6">
            {isSuccess ? (
              <div className="rounded-3xl border border-zinc-200/90 dark:border-zinc-800/90 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl p-8 shadow-2xl shadow-zinc-950/5 dark:shadow-black/50 text-center space-y-5 animate-scale-in">
                <div className="h-14 w-14 rounded-3xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 flex items-center justify-center mx-auto shadow-md shadow-emerald-500/15">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-zinc-950 dark:text-white">
                    Pendaftaran Berhasil! 🎉
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 max-w-xs mx-auto leading-relaxed">
                    Akun Anda telah tersimpan dan diamankan. Anda sedang dialihkan langsung ke dashboard...
                  </p>
                </div>
                <Button
                  variant="primary"
                  className="w-full h-11 font-bold rounded-2xl shadow-lg shadow-amber-500/25"
                  onClick={() => router.push('/dashboard')}
                >
                  <span>Buka Dashboard Sekarang</span>
                  <ArrowRight className="h-4 w-4 ml-1.5" />
                </Button>
              </div>
            ) : (
              <div className="rounded-3xl border border-zinc-200/90 dark:border-zinc-800/90 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl p-6 sm:p-8 shadow-2xl shadow-zinc-950/5 dark:shadow-black/50 space-y-5">
                
                {/* Segmented Auth Navigation Control */}
                <div className="p-1 rounded-2xl bg-zinc-100 dark:bg-zinc-800/70 border border-zinc-200/70 dark:border-zinc-700/60 grid grid-cols-2 gap-1 text-xs font-semibold">
                  <Link
                    href="/login"
                    className="py-2 text-center rounded-xl text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-all"
                  >
                    Masuk Akun
                  </Link>
                  <div className="py-2 text-center rounded-xl bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white shadow-xs font-bold transition-all">
                    Daftar Baru
                  </div>
                </div>

                {/* Form Title */}
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
                    Buat Akun DompetKu
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                    Mulai perjalanan finansial Anda dalam hitungan detik.
                  </p>
                </div>

                {/* Alert Error Box */}
                {errors.form && (
                  <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5 animate-shake">
                    <AlertCircle className="h-4 w-4 shrink-0 text-rose-500 mt-0.5" />
                    <span className="leading-snug">{errors.form}</span>
                  </div>
                )}

                {/* Registration Form */}
                <form onSubmit={handleSubmit} autoComplete="on" className="space-y-3.5">
                  {/* Name Field */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-200">
                      Nama Lengkap <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative flex items-center group">
                      <User className="absolute left-3.5 h-4 w-4 text-zinc-400 dark:text-zinc-500 group-focus-within:text-amber-500 transition-colors pointer-events-none" />
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Budi Santoso"
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
                        }}
                        className={`w-full rounded-2xl border pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 shadow-xs transition-all ${
                          errors.name
                            ? 'border-rose-500 dark:border-rose-500'
                            : 'border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600'
                        }`}
                      />
                    </div>
                    {errors.name && (
                      <p className="text-[11px] font-medium text-rose-600 dark:text-rose-400">
                        {errors.name}
                      </p>
                    )}
                  </div>

                  {/* Email Field */}
                  <div className="space-y-1">
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
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-200">
                      Kata Sandi <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative flex items-center group">
                      <Lock className="absolute left-3.5 h-4 w-4 text-zinc-400 dark:text-zinc-500 group-focus-within:text-amber-500 transition-colors pointer-events-none" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="Minimal 8 karakter"
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

                    {/* Password Strength Real-time Bar Meter */}
                    {password.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-zinc-500 dark:text-zinc-400">Kekuatan Sandi:</span>
                          <span className={`font-bold ${strengthConfig.textColor}`}>
                            {strengthConfig.label}
                          </span>
                        </div>
                        <div className="grid grid-cols-4 gap-1.5 h-1.5">
                          {[1, 2, 3, 4].map((step) => (
                            <div
                              key={step}
                              className={`h-full rounded-full transition-all duration-300 ${
                                passwordScore >= step
                                  ? strengthConfig.color
                                  : 'bg-zinc-200 dark:bg-zinc-800'
                              }`}
                            />
                          ))}
                        </div>

                        {/* Interactive Requirements Checklist */}
                        <div className="grid grid-cols-2 gap-1 pt-1 text-[10px] text-zinc-500 dark:text-zinc-400">
                          <span className={`flex items-center gap-1 ${passwordCriteria.hasMinLength ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : ''}`}>
                            <Check className={`h-3 w-3 ${passwordCriteria.hasMinLength ? 'opacity-100' : 'opacity-30'}`} />
                            Min. 8 karakter
                          </span>
                          <span className={`flex items-center gap-1 ${passwordCriteria.hasUpperAndLower ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : ''}`}>
                            <Check className={`h-3 w-3 ${passwordCriteria.hasUpperAndLower ? 'opacity-100' : 'opacity-30'}`} />
                            Huruf besar & kecil
                          </span>
                          <span className={`flex items-center gap-1 ${passwordCriteria.hasNumber ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : ''}`}>
                            <Check className={`h-3 w-3 ${passwordCriteria.hasNumber ? 'opacity-100' : 'opacity-30'}`} />
                            Mengandung angka
                          </span>
                          <span className={`flex items-center gap-1 ${passwordCriteria.hasSymbol ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : ''}`}>
                            <Check className={`h-3 w-3 ${passwordCriteria.hasSymbol ? 'opacity-100' : 'opacity-30'}`} />
                            Simbol khusus
                          </span>
                        </div>
                      </div>
                    )}

                    {errors.password && (
                      <p className="text-[11px] font-medium text-rose-600 dark:text-rose-400">
                        {errors.password}
                      </p>
                    )}
                  </div>

                  {/* Confirm Password Field */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-200">
                      Konfirmasi Kata Sandi <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative flex items-center group">
                      <Lock className="absolute left-3.5 h-4 w-4 text-zinc-400 dark:text-zinc-500 group-focus-within:text-amber-500 transition-colors pointer-events-none" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        placeholder="Ulangi kata sandi"
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          if (errors.confirmPassword) {
                            setErrors((prev) => ({ ...prev, confirmPassword: '' }));
                          }
                        }}
                        className={`w-full rounded-2xl border pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 shadow-xs transition-all ${
                          errors.confirmPassword
                            ? 'border-rose-500 dark:border-rose-500'
                            : 'border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        aria-label={showConfirmPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                        className="absolute right-3.5 p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-[11px] font-medium text-rose-600 dark:text-rose-400">
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>

                  {/* Terms Checkbox */}
                  <div className="space-y-1 pt-1">
                    <label className="flex items-start gap-2.5 cursor-pointer text-xs text-zinc-600 dark:text-zinc-400 select-none">
                      <input
                        type="checkbox"
                        checked={terms}
                        onChange={(e) => {
                          setTerms(e.target.checked);
                          if (errors.terms) setErrors((prev) => ({ ...prev, terms: '' }));
                        }}
                        className="mt-0.5 rounded border-zinc-300 dark:border-zinc-700 text-amber-500 focus:ring-amber-500/30"
                      />
                      <span className="leading-snug">
                        Saya menyetujui syarat layanan dan kebijakan privasi perlindungan data pribadi DompetKu.
                      </span>
                    </label>
                    {errors.terms && (
                      <p className="text-[11px] font-medium text-rose-600 dark:text-rose-400">
                        {errors.terms}
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading || isGoogleLoading}
                    className="w-full h-11 rounded-2xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 shadow-lg shadow-amber-500/25 hover:shadow-amber-500/35 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-1"
                  >
                    {isLoading ? (
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Daftar Akun Baru</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>

                {/* Or Divider */}
                <div className="relative flex items-center py-0.5">
                  <div className="flex-grow border-t border-zinc-200 dark:border-zinc-800" />
                  <span className="flex-shrink mx-3 text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                    atau daftar dengan
                  </span>
                  <div className="flex-grow border-t border-zinc-200 dark:border-zinc-800" />
                </div>

                {/* Google OAuth Button */}
                <button
                  type="button"
                  onClick={handleGoogleRegister}
                  disabled={isLoading || isGoogleLoading}
                  className="w-full flex items-center justify-center gap-3 h-10.5 px-4 rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-100 font-semibold text-xs sm:text-sm shadow-xs hover:border-zinc-400 dark:hover:border-zinc-600 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
                >
                  {isGoogleLoading ? (
                    <div className="h-4 w-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <GoogleIcon className="h-4 w-4 shrink-0" />
                  )}
                  <span>Daftar dengan Google</span>
                </button>

                {/* Bottom Sign-In Link */}
                <div className="pt-1 text-center text-xs text-zinc-500 dark:text-zinc-400 border-t border-zinc-100 dark:border-zinc-800/80">
                  Sudah memiliki akun?{' '}
                  <Link
                    href="/login"
                    className="text-amber-600 dark:text-amber-400 font-bold hover:underline ml-1"
                  >
                    Masuk di sini
                  </Link>
                </div>

              </div>
            )}
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
        onUseDemo={() => router.push('/dashboard')}
      />
    </div>
  );
}
