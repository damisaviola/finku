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
  Sun,
  Moon,
  AlertCircle,
  Target,
  Check,
} from 'lucide-react';
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
    if (password.length === 0) return { label: 'Belum diisi', color: 'bg-zinc-200 dark:bg-zinc-800' };
    if (passwordScore <= 1) return { label: 'Lemah', color: 'bg-zinc-400 dark:bg-zinc-600' };
    if (passwordScore === 2) return { label: 'Cukup', color: 'bg-zinc-600 dark:bg-zinc-400' };
    if (passwordScore === 3) return { label: 'Kuat', color: 'bg-zinc-800 dark:bg-zinc-200' };
    return { label: 'Sangat Kuat', color: 'bg-zinc-950 dark:bg-white' };
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
        }, 1000);
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
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
            <span>Sudah punya akun?</span>
            <Link
              href="/login"
              className="font-medium text-zinc-900 dark:text-white hover:underline transition-colors"
            >
              Masuk
            </Link>
          </div>

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
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-10 my-auto">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Clean Editorial Overview */}
          <div className="hidden lg:flex lg:col-span-6 flex-col justify-center space-y-6 pr-4">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 w-fit">
                <span>Pendaftaran Akun Baru</span>
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-zinc-950 dark:text-white leading-tight">
                Mulai kelola keuangan pribadi dengan rapi dan terencana.
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Catat setiap transaksi dengan validasi saldo, tetapkan pagu anggaran pengeluaran, dan pantau target tabungan impian Anda secara mandiri.
              </p>
            </div>

            {/* Clean Feature Overview Card (No glossy effects) */}
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-zinc-500" />
                  <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                    Target Tabungan: Dana Darurat
                  </span>
                </div>
                <span className="text-xs font-mono font-medium text-zinc-500">
                  80% tercapai
                </span>
              </div>

              <div>
                <div className="flex items-baseline justify-between text-xs mb-1.5">
                  <span className="text-zinc-500">Terkumpul</span>
                  <span className="font-mono font-bold text-zinc-950 dark:text-white">
                    Rp 24.000.000 / Rp 30.000.000
                  </span>
                </div>
                {/* Flat clean progress bar */}
                <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                  <div className="h-full bg-zinc-900 dark:bg-white w-[80%] rounded-full" />
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
                <span>Pagu Anggaran Bulanan</span>
                <span className="text-zinc-900 dark:text-white font-medium">Status Terkendali</span>
              </div>
            </div>

            {/* Simple Value Props */}
            <div className="grid grid-cols-2 gap-3 pt-1 text-xs text-zinc-600 dark:text-zinc-400">
              <div className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-zinc-900 dark:text-white shrink-0" />
                <span>Format Standar Bank PDF</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-zinc-900 dark:text-white shrink-0" />
                <span>Proteksi Defisit Saldo</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-zinc-900 dark:text-white shrink-0" />
                <span>Tanpa Iklan Pihak Ketiga</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-zinc-900 dark:text-white shrink-0" />
                <span>Penyimpanan Data Privat</span>
              </div>
            </div>
          </div>

          {/* Right Column: Register Form Card */}
          <div className="w-full max-w-md mx-auto lg:col-span-6">
            {isSuccess ? (
              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 text-center space-y-4">
                <div className="h-12 w-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-zinc-950 dark:text-white">
                    Pendaftaran Berhasil
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-xs mx-auto">
                    Akun Anda telah dibuat. Mengalihkan Anda langsung ke dashboard...
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => router.push('/dashboard')}
                  className="w-full h-10 rounded-lg font-semibold text-xs text-white dark:text-zinc-950 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Buka Dashboard</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-8 space-y-5">
                
                {/* Clean Segmented Tab Switcher */}
                <div className="p-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 grid grid-cols-2 gap-1 text-xs font-medium">
                  <Link
                    href="/login"
                    className="py-1.5 text-center rounded-md text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white transition-colors"
                  >
                    Masuk Akun
                  </Link>
                  <div className="py-1.5 text-center rounded-md bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white font-semibold border border-zinc-200/50 dark:border-zinc-700/50">
                    Daftar Baru
                  </div>
                </div>

                {/* Title */}
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-zinc-950 dark:text-white">
                    Buat Akun Baru
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    Isi rincian informasi di bawah untuk mendaftarkan akun.
                  </p>
                </div>

                {/* Alert Error Box */}
                {errors.form && (
                  <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0 text-rose-500 mt-0.5" />
                    <span>{errors.form}</span>
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} autoComplete="on" className="space-y-3.5">
                  {/* Name */}
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                      Nama Lengkap <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <User className="absolute left-3 h-4 w-4 text-zinc-400 dark:text-zinc-500 pointer-events-none" />
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Budi Santoso"
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
                        }}
                        className={`w-full rounded-lg border pl-9 pr-3 py-2 text-xs sm:text-sm bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-950 dark:focus:ring-white focus:border-zinc-950 dark:focus:border-white transition-colors ${
                          errors.name
                            ? 'border-rose-500'
                            : 'border-zinc-300 dark:border-zinc-700'
                        }`}
                      />
                    </div>
                    {errors.name && (
                      <p className="text-[11px] text-rose-600 dark:text-rose-400">
                        {errors.name}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-1">
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
                          if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                        }}
                        className={`w-full rounded-lg border pl-9 pr-3 py-2 text-xs sm:text-sm bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-950 dark:focus:ring-white focus:border-zinc-950 dark:focus:border-white transition-colors ${
                          errors.email
                            ? 'border-rose-500'
                            : 'border-zinc-300 dark:border-zinc-700'
                        }`}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-[11px] text-rose-600 dark:text-rose-400">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Password */}
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                      Kata Sandi <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <Lock className="absolute left-3 h-4 w-4 text-zinc-400 dark:text-zinc-500 pointer-events-none" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="Minimal 8 karakter"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
                        }}
                        className={`w-full rounded-lg border pl-9 pr-10 py-2 text-xs sm:text-sm bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-950 dark:focus:ring-white focus:border-zinc-950 dark:focus:border-white transition-colors ${
                          errors.password
                            ? 'border-rose-500'
                            : 'border-zinc-300 dark:border-zinc-700'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                        className="absolute right-3 p-0.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>

                    {/* Password Strength Indicator (Monochrome / Neutral) */}
                    {password.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center justify-between text-[11px] text-zinc-500">
                          <span>Kekuatan sandi:</span>
                          <span className="font-medium text-zinc-900 dark:text-zinc-100">
                            {strengthConfig.label}
                          </span>
                        </div>
                        <div className="grid grid-cols-4 gap-1 h-1">
                          {[1, 2, 3, 4].map((step) => (
                            <div
                              key={step}
                              className={`h-full rounded-full transition-all ${
                                passwordScore >= step
                                  ? strengthConfig.color
                                  : 'bg-zinc-200 dark:bg-zinc-800'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {errors.password && (
                      <p className="text-[11px] text-rose-600 dark:text-rose-400">
                        {errors.password}
                      </p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                      Konfirmasi Kata Sandi <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <Lock className="absolute left-3 h-4 w-4 text-zinc-400 dark:text-zinc-500 pointer-events-none" />
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
                        className={`w-full rounded-lg border pl-9 pr-10 py-2 text-xs sm:text-sm bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-950 dark:focus:ring-white focus:border-zinc-950 dark:focus:border-white transition-colors ${
                          errors.confirmPassword
                            ? 'border-rose-500'
                            : 'border-zinc-300 dark:border-zinc-700'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        aria-label={showConfirmPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                        className="absolute right-3 p-0.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-[11px] text-rose-600 dark:text-rose-400">
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>

                  {/* Terms */}
                  <div className="space-y-1 pt-0.5">
                    <label className="flex items-start gap-2 cursor-pointer text-xs text-zinc-600 dark:text-zinc-400 select-none">
                      <input
                        type="checkbox"
                        checked={terms}
                        onChange={(e) => {
                          setTerms(e.target.checked);
                          if (errors.terms) setErrors((prev) => ({ ...prev, terms: '' }));
                        }}
                        className="mt-0.5 rounded border-zinc-300 dark:border-zinc-700 text-zinc-900 focus:ring-zinc-900 dark:focus:ring-white"
                      />
                      <span className="leading-snug">
                        Saya menyetujui syarat layanan dan kebijakan privasi data DompetKu.
                      </span>
                    </label>
                    {errors.terms && (
                      <p className="text-[11px] text-rose-600 dark:text-rose-400">
                        {errors.terms}
                      </p>
                    )}
                  </div>

                  {/* Clean Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading || isGoogleLoading}
                    className="w-full h-10 rounded-lg font-semibold text-xs sm:text-sm text-white dark:text-zinc-950 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-1"
                  >
                    {isLoading ? (
                      <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
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
                  <span className="flex-shrink mx-3 text-[10px] font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                    atau
                  </span>
                  <div className="flex-grow border-t border-zinc-200 dark:border-zinc-800" />
                </div>

                {/* Google Button */}
                <button
                  type="button"
                  onClick={handleGoogleRegister}
                  disabled={isLoading || isGoogleLoading}
                  className="w-full flex items-center justify-center gap-2.5 h-10 px-4 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-800 dark:text-zinc-100 font-medium text-xs sm:text-sm transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isGoogleLoading ? (
                    <div className="h-4 w-4 border-2 border-zinc-900 dark:border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <GoogleIcon className="h-4 w-4 shrink-0" />
                  )}
                  <span>Daftar dengan Google</span>
                </button>

                {/* Sign In Link */}
                <div className="pt-1 text-center text-xs text-zinc-500 dark:text-zinc-400 border-t border-zinc-100 dark:border-zinc-800">
                  Sudah memiliki akun?{' '}
                  <Link
                    href="/login"
                    className="text-zinc-900 dark:text-white font-semibold hover:underline ml-1"
                  >
                    Masuk di sini
                  </Link>
                </div>

              </div>
            )}
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full px-5 py-3.5 text-center text-[11px] text-zinc-400 dark:text-zinc-500 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        © 2026 DompetKu • Pelacak Keuangan Pribadi
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
