'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Wallet, Loader2, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { syncUserProfile } from '@/lib/supabase/auth';
import { useDompetKu } from '@/lib/store';
import { Button } from '@/components/ui/button';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setCleanUserSession, showToast } = useDompetKu();

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    let isMounted = true;

    async function handleAuthCallback() {
      // 1. Check for error parameters from OAuth provider
      const errorParam = searchParams.get('error');
      const errorDesc = searchParams.get('error_description');
      if (errorParam) {
        if (!isMounted) return;
        setStatus('error');
        setErrorMessage(errorDesc || 'Otorisasi Google dibatalkan atau terjadi kesalahan.');
        return;
      }

      if (!isSupabaseConfigured || !supabase) {
        if (!isMounted) return;
        setStatus('error');
        setErrorMessage(
          'Konfigurasi Supabase belum lengkap di lingkungan aplikasi ini. Pastikan NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY telah diatur di .env.local'
        );
        return;
      }

      try {
        const code = searchParams.get('code');

        // 2. If PKCE authorization code exists, exchange it for a session
        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            console.error('Error exchanging code for session:', exchangeError);
            // Don't fail immediately, continue to check if session already set
          }
        }

        // 3. Retrieve the current active session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session?.user) {
          // Check hash fragment fallback (implicit flow)
          if (typeof window !== 'undefined' && window.location.hash.includes('access_token')) {
            // Wait brief moment for supabase-js detectSessionInUrl to parse hash
            await new Promise((r) => setTimeout(r, 500));
            const { data: hashData } = await supabase.auth.getSession();
            if (hashData?.session?.user) {
              await processUserSession(hashData.session);
              return;
            }
          }

          if (!isMounted) return;
          setStatus('error');
          setErrorMessage(sessionError?.message || 'Sesi otorisasi Google tidak ditemukan. Silakan coba masuk kembali.');
          return;
        }

        await processUserSession(session);
      } catch (err: unknown) {
        if (!isMounted) return;
        setStatus('error');
        setErrorMessage(err instanceof Error ? err.message : 'Terjadi kesalahan saat memproses login Google.');
      }
    }

    async function processUserSession(session: import('@supabase/supabase-js').Session) {
      const authUser = session.user;
      const meta = authUser.user_metadata || {};
      const resolvedName = meta.full_name || meta.name || authUser.email?.split('@')[0] || 'Pengguna DompetKu';
      const resolvedAvatar = meta.avatar_url || meta.picture || undefined;

      if (!isMounted) return;
      setUserName(resolvedName);
      setStatus('success');

      // Initialize clean local context store session
      setCleanUserSession({
        id: authUser.id,
        name: resolvedName,
        email: authUser.email || '',
        avatar_url: resolvedAvatar,
        provider: 'google',
        currency: 'IDR',
        timezone: 'Asia/Jakarta',
        theme: 'system',
        fontSize: 'normal',
      });

      // Sync to public.users table in Supabase
      await syncUserProfile({
        id: authUser.id,
        name: resolvedName,
        email: authUser.email || '',
        avatar_url: resolvedAvatar,
        currency: 'IDR',
        timezone: 'Asia/Jakarta',
        theme: 'system',
      });

      showToast(`Selamat datang, ${resolvedName}! Berhasil masuk dengan akun Google.`, 'success');

      // Redirect smoothly to dashboard
      setTimeout(() => {
        router.push('/dashboard');
      }, 1200);
    }

    handleAuthCallback();

    return () => {
      isMounted = false;
    };
  }, [searchParams, router, setCleanUserSession, showToast]);

  return (
    <div className="w-full max-w-md p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 shadow-2xl text-center space-y-5">
      {/* Brand Icon */}
      <div className="mx-auto w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-xs">
        <Wallet className="h-7 w-7" />
      </div>

      {status === 'loading' && (
        <div className="space-y-3 animate-in fade-in duration-300">
          <div className="flex items-center justify-center gap-2 text-amber-600 dark:text-amber-400">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
          <h2 className="text-lg font-bold text-zinc-950 dark:text-white">
            Memverifikasi Akun Google...
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-xs mx-auto">
            Menyinkronkan kredensial Supabase Auth dan menyiapkan buku kas finansial Anda.
          </p>
        </div>
      )}

      {status === 'success' && (
        <div className="space-y-3 animate-in fade-in duration-300">
          <div className="mx-auto w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-bold text-zinc-950 dark:text-white">
            Autentikasi Berhasil!
          </h2>
          <p className="text-xs text-zinc-600 dark:text-zinc-300">
            Halo, <strong className="text-zinc-950 dark:text-white">{userName}</strong>. Mengalihkan ke dasbor DompetKu...
          </p>
        </div>
      )}

      {status === 'error' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="mx-auto w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-zinc-950 dark:text-white">
              Gagal Masuk dengan Google
            </h2>
            <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded-xl border border-rose-200 dark:border-rose-900/60 leading-relaxed text-left">
              {errorMessage}
            </p>
          </div>
          <div className="pt-2 flex justify-center">
            <Button
              variant="primary"
              onClick={() => router.push('/login')}
              className="inline-flex items-center gap-2"
            >
              <span>Kembali ke Halaman Masuk</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-4">
      <Suspense
        fallback={
          <div className="w-full max-w-md p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-center space-y-3">
            <Loader2 className="h-6 w-6 animate-spin text-amber-500 mx-auto" />
            <p className="text-xs text-zinc-500">Memuat status otorisasi...</p>
          </div>
        }
      >
        <CallbackContent />
      </Suspense>
    </div>
  );
}
