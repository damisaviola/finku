'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Wallet,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sun,
  Moon,
  AlertCircle,
  Loader2,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { useDompetKu } from '@/lib/store';
import { signInWithGoogle, registerUserWithEmail } from '@/lib/supabase/auth';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { SupabaseConfigModal } from '@/components/auth/supabase-config-modal';
import { formatUserFriendlyError } from '@/lib/utils/error-handler';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Nama lengkap wajib diisi.';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Nama minimal 2 karakter.';
    }

    if (!email.trim()) {
      newErrors.email = 'Alamat email wajib diisi.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Format email tidak valid.';
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
      newErrors.terms = 'Anda harus menyetujui syarat layanan.';
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
        const friendly = formatUserFriendlyError(error.message, 'Gagal mendaftar akun. Silakan coba kembali.');
        setErrors({ form: friendly });
        showToast(friendly, 'error');
        return;
      }

      if (user) {
        setCleanUserSession(user, accounts as any);
        setIsLoading(false);
        setIsSuccess(true);
        showToast('Akun berhasil dibuat!', 'success');
        setTimeout(() => {
          router.push('/dashboard');
        }, 1000);
      }
    } catch (err) {
      setIsLoading(false);
      const friendly = formatUserFriendlyError(err, 'Terjadi kesalahan saat registrasi.');
      setErrors({ form: friendly });
      showToast(friendly, 'error');
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
      const friendly = formatUserFriendlyError(error.message, 'Gagal menghubungkan ke akun Google.');
      showToast(friendly, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col justify-between">
      {/* Top Bar */}
      <div className="w-full max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="h-8 w-8 rounded-lg bg-amber-500 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
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
          className="p-2 rounded-xl text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 transition-colors cursor-pointer"
          title={isDarkMode ? 'Mode Terang' : 'Mode Gelap'}
        >
          {isDarkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
        </button>
      </div>

      {/* Centered Register Box */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-[390px] space-y-6">
          
          {/* Header */}
          <div className="space-y-1.5 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
              Buat akun baru
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Mulai catat dan kelola keuangan pribadi Anda.
            </p>
          </div>

          {/* Form Card */}
          <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/90 p-6 sm:p-7 shadow-xs ring-1 ring-zinc-950/5 dark:ring-white/5 space-y-5">
            {isSuccess ? (
              <div className="py-6 text-center space-y-3">
                <div className="h-11 w-11 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h2 className="text-base font-semibold text-zinc-950 dark:text-white">
                  Pendaftaran Berhasil!
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto">
                  Akun Anda telah dibuat. Mengalihkan ke dashboard...
                </p>
              </div>
            ) : (
              <>
                {/* Error */}
                {errors.form && (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5">
                    <AlertCircle className="h-4 w-4 shrink-0 text-rose-500 mt-0.5" />
                    <span>{errors.form}</span>
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} autoComplete="on" className="space-y-3.5">
                  
                  {/* Name */}
                  <div className="space-y-1.5">
                    <label className="block text-[13px] font-medium text-zinc-700 dark:text-zinc-300">
                      Nama Lengkap
                    </label>
                    <div
                      className={`relative flex items-center rounded-xl border h-11 transition-all duration-200 group ${
                        errors.name
                          ? 'border-rose-400 dark:border-rose-600 focus-within:border-rose-500 focus-within:ring-4 focus-within:ring-rose-500/10'
                          : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 hover:border-zinc-300 dark:hover:border-zinc-700 focus-within:border-amber-500 focus-within:ring-4 focus-within:ring-amber-500/10 dark:focus-within:ring-amber-500/15 focus-within:bg-white dark:focus-within:bg-zinc-950'
                      }`}
                    >
                      <User className="absolute left-3.5 h-4 w-4 text-zinc-400 dark:text-zinc-500 group-focus-within:text-amber-500 dark:group-focus-within:text-amber-400 transition-colors pointer-events-none" />
                      <input
                        type="text"
                        required
                        placeholder="Budi Santoso"
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
                        }}
                        className="w-full h-full pl-10 pr-3.5 bg-transparent border-0 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-0"
                      />
                    </div>
                    {errors.name && (
                      <p className="text-[11px] font-medium text-rose-600 dark:text-rose-400 pl-0.5">
                        {errors.name}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="block text-[13px] font-medium text-zinc-700 dark:text-zinc-300">
                      Email
                    </label>
                    <div
                      className={`relative flex items-center rounded-xl border h-11 transition-all duration-200 group ${
                        errors.email
                          ? 'border-rose-400 dark:border-rose-600 focus-within:border-rose-500 focus-within:ring-4 focus-within:ring-rose-500/10'
                          : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 hover:border-zinc-300 dark:hover:border-zinc-700 focus-within:border-amber-500 focus-within:ring-4 focus-within:ring-amber-500/10 dark:focus-within:ring-amber-500/15 focus-within:bg-white dark:focus-within:bg-zinc-950'
                      }`}
                    >
                      <Mail className="absolute left-3.5 h-4 w-4 text-zinc-400 dark:text-zinc-500 group-focus-within:text-amber-500 dark:group-focus-within:text-amber-400 transition-colors pointer-events-none" />
                      <input
                        type="email"
                        required
                        placeholder="nama@email.com"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                        }}
                        className="w-full h-full pl-10 pr-3.5 bg-transparent border-0 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-0"
                      />
                    </div>
                    {errors.email && (
                      <p className="text-[11px] font-medium text-rose-600 dark:text-rose-400 pl-0.5">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Password */}
                  <div className="space-y-1.5">
                    <label className="block text-[13px] font-medium text-zinc-700 dark:text-zinc-300">
                      Kata Sandi
                    </label>
                    <div
                      className={`relative flex items-center rounded-xl border h-11 transition-all duration-200 group ${
                        errors.password
                          ? 'border-rose-400 dark:border-rose-600 focus-within:border-rose-500 focus-within:ring-4 focus-within:ring-rose-500/10'
                          : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 hover:border-zinc-300 dark:hover:border-zinc-700 focus-within:border-amber-500 focus-within:ring-4 focus-within:ring-amber-500/10 dark:focus-within:ring-amber-500/15 focus-within:bg-white dark:focus-within:bg-zinc-950'
                      }`}
                    >
                      <Lock className="absolute left-3.5 h-4 w-4 text-zinc-400 dark:text-zinc-500 group-focus-within:text-amber-500 dark:group-focus-within:text-amber-400 transition-colors pointer-events-none" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="Minimal 8 karakter"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
                        }}
                        className="w-full h-full pl-10 pr-10 bg-transparent border-0 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-0"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                        className="absolute right-2 h-7 w-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-[11px] font-medium text-rose-600 dark:text-rose-400 pl-0.5">
                        {errors.password}
                      </p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1.5">
                    <label className="block text-[13px] font-medium text-zinc-700 dark:text-zinc-300">
                      Konfirmasi Kata Sandi
                    </label>
                    <div
                      className={`relative flex items-center rounded-xl border h-11 transition-all duration-200 group ${
                        errors.confirmPassword
                          ? 'border-rose-400 dark:border-rose-600 focus-within:border-rose-500 focus-within:ring-4 focus-within:ring-rose-500/10'
                          : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 hover:border-zinc-300 dark:hover:border-zinc-700 focus-within:border-amber-500 focus-within:ring-4 focus-within:ring-amber-500/10 dark:focus-within:ring-amber-500/15 focus-within:bg-white dark:focus-within:bg-zinc-950'
                      }`}
                    >
                      <Lock className="absolute left-3.5 h-4 w-4 text-zinc-400 dark:text-zinc-500 group-focus-within:text-amber-500 dark:group-focus-within:text-amber-400 transition-colors pointer-events-none" />
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
                        className="w-full h-full pl-10 pr-10 bg-transparent border-0 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-0"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        aria-label={showConfirmPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                        className="absolute right-2 h-7 w-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-[11px] font-medium text-rose-600 dark:text-rose-400 pl-0.5">
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>

                  {/* Terms */}
                  <div className="space-y-1 pt-1">
                    <label className="flex items-start gap-2.5 cursor-pointer text-xs text-zinc-600 dark:text-zinc-400 select-none">
                      <input
                        type="checkbox"
                        checked={terms}
                        onChange={(e) => {
                          setTerms(e.target.checked);
                          if (errors.terms) setErrors((prev) => ({ ...prev, terms: '' }));
                        }}
                        className="mt-0.5 h-4 w-4 rounded-md border-zinc-300 dark:border-zinc-700 text-amber-500 focus:ring-amber-500/20 cursor-pointer"
                      />
                      <span className="leading-snug">
                        Saya menyetujui syarat layanan dan kebijakan privasi data.
                      </span>
                    </label>
                    {errors.terms && (
                      <p className="text-[11px] font-medium text-rose-600 dark:text-rose-400 pl-0.5">
                        {errors.terms}
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading || isGoogleLoading}
                    className="w-full h-11 rounded-xl font-semibold text-sm text-white bg-amber-500 hover:bg-amber-400 active:bg-amber-600 shadow-xs hover:shadow-sm active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin text-white" />
                    ) : (
                      <>
                        <span>Daftar Akun</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>

                {/* Divider */}
                <div className="relative my-1">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-zinc-200 dark:border-zinc-800" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-white dark:bg-zinc-900 px-2.5 text-zinc-400 font-medium">
                      atau
                    </span>
                  </div>
                </div>

                {/* Google OAuth (At the bottom) */}
                <button
                  type="button"
                  onClick={handleGoogleRegister}
                  disabled={isLoading || isGoogleLoading}
                  className="w-full flex items-center justify-center gap-2.5 h-11 px-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-700 dark:text-zinc-200 font-medium text-sm active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50 shadow-2xs"
                >
                  {isGoogleLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-zinc-500" />
                  ) : (
                    <GoogleIcon className="h-4 w-4 shrink-0" />
                  )}
                  <span>Daftar dengan Google</span>
                </button>
              </>
            )}
          </div>

          {/* Login Link Footer */}
          <p className="text-center text-xs text-zinc-500 dark:text-zinc-400">
            Sudah memiliki akun?{' '}
            <Link
              href="/login"
              className="font-semibold text-zinc-900 dark:text-white hover:text-amber-600 dark:hover:text-amber-400 transition-colors ml-0.5"
            >
              Masuk di sini
            </Link>
          </p>

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 text-center text-xs text-zinc-400 dark:text-zinc-500">
        © 2026 DompetKu • Pelacak Keuangan Pribadi
      </footer>

      {/* Supabase OAuth Setup Guide Modal */}
      <SupabaseConfigModal
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
      />
    </div>
  );
}
