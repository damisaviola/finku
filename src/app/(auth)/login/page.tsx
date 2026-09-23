'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Wallet,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sun,
  Moon,
  AlertCircle,
  Loader2,
  ArrowRight,
} from 'lucide-react';
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
  const { setCleanUserSession, showToast, isDarkMode, toggleTheme } = useDompetKu();

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
      newErrors.email = 'Format email tidak valid.';
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

    const normalizedEmail = email.trim().toLowerCase();

    try {
      const { error, user, accounts, categories, transactions, budgets, goals, debts } =
        await loginUserWithEmail(normalizedEmail, password);

      if (error) {
        setIsLoading(false);
        setErrors({ form: error.message });
        showToast(error.message, 'error');
        return;
      }

      if (user) {
        setCleanUserSession(user, accounts, categories, transactions, budgets, goals, debts || []);
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

      {/* Centered Login Box */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-[390px] space-y-6">
          
          {/* Header */}
          <div className="space-y-1.5 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
              Masuk ke akun Anda
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Kelola catatan transaksi dan seluruh rekening Anda.
            </p>
          </div>

          {/* Form Card */}
          <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/90 p-6 sm:p-7 shadow-xs ring-1 ring-zinc-950/5 dark:ring-white/5 space-y-5">
            
            {/* Error Message */}
            {errors.form && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-500 mt-0.5" />
                <span>{errors.form}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} autoComplete="on" className="space-y-4">
              
              {/* Modern Input: Email */}
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

              {/* Modern Input: Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-[13px] font-medium text-zinc-700 dark:text-zinc-300">
                    Kata Sandi
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-amber-600 dark:text-amber-400 hover:underline font-medium transition-colors"
                  >
                    Lupa sandi?
                  </Link>
                </div>
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
                    placeholder="••••••••"
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

              {/* Remember Me */}
              <div className="flex items-center pt-0.5">
                <label className="flex items-center gap-2.5 cursor-pointer text-xs text-zinc-600 dark:text-zinc-400 select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded-md border-zinc-300 dark:border-zinc-700 text-amber-500 focus:ring-amber-500/20 cursor-pointer"
                  />
                  <span>Ingat saya di perangkat ini</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || isGoogleLoading}
                className="w-full h-11 rounded-xl font-semibold text-sm text-white bg-amber-500 hover:bg-amber-400 active:bg-amber-600 shadow-xs hover:shadow-sm active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                ) : (
                  <>
                    <span>Masuk ke Dashboard</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative py-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-200 dark:border-zinc-800" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white dark:bg-zinc-900 px-2.5 text-zinc-400 font-medium">
                  atau
                </span>
              </div>
            </div>

            {/* Google OAuth Login */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading || isGoogleLoading}
              className="w-full flex items-center justify-center gap-2.5 h-11 px-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-700 dark:text-zinc-200 font-medium text-sm active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50 shadow-2xs"
            >
              {isGoogleLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-zinc-500" />
              ) : (
                <GoogleIcon className="h-4 w-4 shrink-0" />
              )}
              <span>Masuk dengan Google</span>
            </button>
          </div>

          {/* Registration Link Footer */}
          <p className="text-center text-xs text-zinc-500 dark:text-zinc-400">
            Belum memiliki akun?{' '}
            <Link
              href="/register"
              className="font-semibold text-zinc-900 dark:text-white hover:text-amber-600 dark:hover:text-amber-400 transition-colors ml-0.5"
            >
              Daftar sekarang
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
