'use client';

import React, { useEffect, useState } from 'react';
import { Download, X, Smartphone, WifiOff, CheckCircle2 } from 'lucide-react';
import { useDompetKu } from '@/lib/store';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function PwaRegister() {
  const { showToast } = useDompetKu();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  // 1. Register Service Worker & Listen for offline/online
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if running in standalone mode (already installed as PWA)
    const isInStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsStandalone(Boolean(isInStandaloneMode));

    // Service Worker Management: Only run in production on actual domains.
    // In local development, automatically unregister any stale service workers & clear caches to prevent chunk mismatch errors.
    if ('serviceWorker' in navigator) {
      const isLocalhost =
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.hostname.endsWith('.local');

      if (process.env.NODE_ENV !== 'production' || isLocalhost) {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (const registration of registrations) {
            registration.unregister().then((success) => {
              if (success) {
                console.log('PWA Service Worker unregistered for local development');
              }
            });
          }
        });

        if ('caches' in window) {
          caches.keys().then((keys) => {
            for (const key of keys) {
              caches.delete(key);
            }
          });
        }
      } else {
        window.addEventListener('load', () => {
          navigator.serviceWorker
            .register('/sw.js')
            .then((registration) => {
              console.log('PWA Service Worker terdaftar dengan scope:', registration.scope);
            })
            .catch((error) => {
              console.warn('PWA Service Worker gagal didaftarkan:', error);
            });
        });
      }
    }

    // Network status listener
    const handleOnline = () => {
      showToast('Koneksi internet pulih kembali.', 'success');
    };
    const handleOffline = () => {
      showToast('Koneksi internet terputus. Bekerja dalam mode offline.', 'info');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Capture PWA beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // Check if user previously dismissed banner in this session
      const dismissed = sessionStorage.getItem('dompetku_pwa_banner_dismissed');
      if (!dismissed && !isInStandaloneMode) {
        // Show install banner with slight delay for pleasant UX
        setTimeout(() => setShowInstallBanner(true), 3000);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [showToast]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      showToast('Terima kasih! DompetKu telah dipasang ke perangkat Anda.', 'success');
    }
    setDeferredPrompt(null);
    setShowInstallBanner(false);
  };

  const handleDismissBanner = () => {
    setShowInstallBanner(false);
    sessionStorage.setItem('dompetku_pwa_banner_dismissed', 'true');
  };

  if (isStandalone || !showInstallBanner || !deferredPrompt) {
    return null;
  }

  return (
    <aside
      aria-label="Install Aplikasi DompetKu"
      className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 max-w-sm w-[calc(100vw-2rem)] sm:w-auto p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl ring-1 ring-zinc-950/5 dark:ring-white/5 animate-in slide-in-from-bottom-5 duration-300"
    >
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
          <Smartphone className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0 pr-1">
          <h4 className="text-sm font-bold text-zinc-950 dark:text-white leading-tight">
            Pasang DompetKu
          </h4>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
            Pasang sebagai aplikasi di ponsel atau desktop Anda untuk akses cepat dan offline.
          </p>
          <div className="flex items-center gap-2 mt-3">
            <button
              type="button"
              onClick={handleInstallClick}
              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Pasang Sekarang</span>
            </button>
            <button
              type="button"
              onClick={handleDismissBanner}
              className="px-2.5 py-1.5 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-medium transition-colors cursor-pointer"
            >
              Nanti
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={handleDismissBanner}
          aria-label="Tutup notifikasi"
          className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1 rounded-md cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
}
