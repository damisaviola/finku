'use client';

import React, { useState } from 'react';
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
  Receipt,
  Sparkles,
  AlertCircle,
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
  const [terms, setTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);

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
      newErrors.terms = 'Anda harus menyetujui syarat dan ketentuan.';
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
        showToast('Registrasi berhasil! Data Anda tersimpan di database Supabase.', 'success');
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
    // If successful, Supabase redirects to Google OAuth
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
            Sudah punya akun?
          </span>
          <Link
            href="/login"
            className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:border-amber-500/50 shadow-xs transition-colors"
          >
            Masuk
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
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 w-fit">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Bergabung Bersama DompetKu</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-zinc-950 dark:text-white leading-tight">
                Mulai kendali penuh atas finansial pribadi Anda.
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Platform pencatatan keuangan modern yang dirancang untuk kecepatan, kejelasan, dan privasi penuh tanpa ketergantungan pihak ketiga.
              </p>
            </div>

            {/* Micro Feature List */}
            <div className="space-y-2.5 pt-2">
              <div className="p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-xs flex items-start gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
                  <PiggyBank className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-xs font-semibold text-zinc-900 dark:text-white">
                    Pagu Anggaran & Sasaran Menabung
                  </h2>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Alokasikan batas belanja per kategori dan lacak target tabungan impian Anda.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-xs flex items-start gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                  <Receipt className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-xs font-semibold text-zinc-900 dark:text-white">
                    Format Ribuan & Terbilang Otomatis
                  </h2>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Input angka langsung terkonversi ke rupiah dan teks terbilang resmi secara dinamis.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-xs flex items-start gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-xs font-semibold text-zinc-900 dark:text-white">
                    Privat & Mandiri
                  </h2>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Semua transaksi, rekening, dan mutasi dikelola langsung di perangkat Anda.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Sleek Minimalist Register Form Card */}
          <div className="w-full max-w-md mx-auto lg:col-span-6">
            {isSuccess ? (
              <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-8 shadow-xs ring-1 ring-zinc-950/5 dark:ring-white/5 text-center space-y-4">
                <div className="h-12 w-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center mx-auto shadow-xs">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-zinc-950 dark:text-white">
                    Akun Berhasil Didaftarkan!
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-xs mx-auto">
                    Selamat datang di DompetKu. Akun Anda telah siap digunakan untuk mencatat dan mengelola keuangan.
                  </p>
                </div>
                <Button
                  variant="primary"
                  className="w-full h-10 font-semibold"
                  onClick={() => router.push('/dashboard')}
                >
                  <span>Masuk ke Dashboard</span>
                  <ArrowRight className="h-4 w-4 ml-1.5" />
                </Button>
              </div>
            ) : (
              <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-8 shadow-xs ring-1 ring-zinc-950/5 dark:ring-white/5 space-y-5">
                {/* Form Header */}
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
                    Buat Akun Baru
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                    Isi informasi di bawah untuk memulai pencatatan keuangan Anda.
                  </p>
                </div>

                {errors.form && (
                  <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2.5">
                    <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
                    <span>{errors.form}</span>
                  </div>
                )}

                {/* Formulir Pendaftaran */}
                <form onSubmit={handleSubmit} autoComplete="off" className="space-y-3.5">
                  {/* Kolom Nama */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-200">
                      Nama Lengkap <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <User className="absolute left-3 h-4 w-4 text-zinc-400 dark:text-zinc-500 pointer-events-none" />
                      <input
                        type="text"
                        required
                        placeholder="Nama lengkap Anda"
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
                        }}
                        className={`w-full rounded-xl border pl-9 pr-3.5 py-2 text-xs sm:text-sm bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 shadow-xs transition-colors ${
                          errors.name
                            ? 'border-rose-500 dark:border-rose-500'
                            : 'border-zinc-300 dark:border-zinc-700'
                        }`}
                      />
                    </div>
                    {errors.name && (
                      <p className="text-[11px] font-medium text-rose-600 dark:text-rose-400">
                        {errors.name}
                      </p>
                    )}
                  </div>

                  {/* Kolom Email */}
                  <div className="space-y-1">
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
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-200">
                      Kata Sandi <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <Lock className="absolute left-3 h-4 w-4 text-zinc-400 dark:text-zinc-500 pointer-events-none" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="Min. 8 karakter"
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

                  {/* Kolom Konfirmasi Kata Sandi */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-200">
                      Konfirmasi Kata Sandi <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <Lock className="absolute left-3 h-4 w-4 text-zinc-400 dark:text-zinc-500 pointer-events-none" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="Ulangi kata sandi"
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          if (errors.confirmPassword) {
                            setErrors((prev) => ({ ...prev, confirmPassword: '' }));
                          }
                        }}
                        className={`w-full rounded-xl border pl-9 pr-3.5 py-2 text-xs sm:text-sm bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 shadow-xs transition-colors ${
                          errors.confirmPassword
                            ? 'border-rose-500 dark:border-rose-500'
                            : 'border-zinc-300 dark:border-zinc-700'
                        }`}
                      />
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-[11px] font-medium text-rose-600 dark:text-rose-400">
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>

                  {/* Ketentuan Layanan */}
                  <div className="space-y-1 pt-0.5">
                    <label className="flex items-start gap-2.5 cursor-pointer text-xs text-zinc-600 dark:text-zinc-300 select-none">
                      <input
                        type="checkbox"
                        checked={terms}
                        onChange={(e) => {
                          setTerms(e.target.checked);
                          if (errors.terms) setErrors((prev) => ({ ...prev, terms: '' }));
                        }}
                        className="mt-0.5 rounded border-zinc-300 dark:border-zinc-700 text-amber-600 focus:ring-amber-500"
                      />
                      <span className="leading-snug">
                        Saya menyetujui syarat layanan dan kebijakan privasi data lokal DompetKu.
                      </span>
                    </label>
                    {errors.terms && (
                      <p className="text-[11px] font-medium text-rose-600 dark:text-rose-400">
                        {errors.terms}
                      </p>
                    )}
                  </div>

                  {/* Tombol Submit Form */}
                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full h-10 font-semibold shadow-xs mt-1"
                    isLoading={isLoading}
                    disabled={isGoogleLoading}
                  >
                    <span>Daftar Akun Baru</span>
                    <ArrowRight className="h-4 w-4 ml-1.5" />
                  </Button>
                </form>

                {/* Pemisah Garis Formal */}
                <div className="relative flex items-center py-1">
                  <div className="flex-grow border-t border-zinc-200 dark:border-zinc-800" />
                  <span className="flex-shrink mx-3 text-[11px] font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                    atau daftar dengan
                  </span>
                  <div className="flex-grow border-t border-zinc-200 dark:border-zinc-800" />
                </div>

                {/* Tombol Google (Di Bawah Form) */}
                <button
                  type="button"
                  onClick={handleGoogleRegister}
                  disabled={isLoading || isGoogleLoading}
                  className="w-full flex items-center justify-center gap-2.5 h-10 px-4 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-100 font-semibold text-xs sm:text-sm shadow-xs hover:border-zinc-400 dark:hover:border-zinc-600 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
                >
                  {isGoogleLoading ? (
                    <div className="h-4 w-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <GoogleIcon className="h-4 w-4 shrink-0" />
                  )}
                  <span>Daftar dengan Google</span>
                </button>

                {/* Footer Tautan Masuk */}
                <div className="pt-2 text-center text-xs text-zinc-500 dark:text-zinc-400 border-t border-zinc-100 dark:border-zinc-800/80">
                  Sudah memiliki akun?{' '}
                  <Link
                    href="/login"
                    className="text-amber-600 dark:text-amber-400 font-semibold hover:underline ml-1"
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
      <footer className="w-full px-5 py-3 text-center text-[11px] text-zinc-400 dark:text-zinc-500 border-t border-zinc-200/60 dark:border-zinc-800/60">
        © 2026 DompetKu Financial Services • Aman, Privat, dan Tanpa Pelacak
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
