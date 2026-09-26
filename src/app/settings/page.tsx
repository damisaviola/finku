'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sun,
  Moon,
  Laptop,
  Check,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Coins,
  Clock,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  LogOut,
  ExternalLink,
  Smartphone,
  Cloud,
  RefreshCw,
  Sliders,
  Database,
  KeyRound,
  Shield,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useDompetKu } from '@/lib/store';
import { FontSize } from '@/types';

type SettingsTab = 'profile' | 'preferences' | 'security' | 'data';

export default function SettingsPage() {
  const router = useRouter();
  const {
    user,
    updateUser,
    resetToDemoData,
    logout,
    showToast,
    theme: currentTheme,
    setTheme,
    fontSize,
    setFontSize,
    isPrivacyMode,
    togglePrivacyMode,
    syncToCloud,
    isSyncing,
  } = useDompetKu();

  const isGoogleUser =
    user?.provider === 'google' ||
    Boolean(user?.avatar_url?.includes('googleusercontent.com'));

  // Active tab state
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  // Profile Form state
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');

  // Preferences Form state
  const [currency, setCurrency] = useState(user?.currency || 'IDR');
  const [timezone, setTimezone] = useState(user?.timezone || 'Asia/Jakarta');
  const [localTheme, setLocalTheme] = useState<'light' | 'dark' | 'system'>(
    user?.theme || currentTheme || 'system'
  );
  const [localFontSize, setLocalFontSize] = useState<FontSize>(
    fontSize || user?.fontSize || 'normal'
  );
  const [isStandalone, setIsStandalone] = useState(false);

  // Password Form state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Dialog States
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const standalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true;
      setIsStandalone(Boolean(standalone));
    }
  }, []);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      if (user.currency) setCurrency(user.currency);
      if (user.timezone) setTimezone(user.timezone);
      if (user.theme) setLocalTheme(user.theme);
    }
  }, [user]);

  useEffect(() => {
    if (fontSize) {
      setLocalFontSize(fontSize);
    }
  }, [fontSize]);

  const handleSelectTheme = (themeValue: 'light' | 'dark' | 'system') => {
    setLocalTheme(themeValue);
    setTheme(themeValue);
    updateUser({ theme: themeValue });
  };

  const handleSelectFontSize = (size: FontSize) => {
    setLocalFontSize(size);
    setFontSize(size);
    updateUser({ fontSize: size });
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Nama lengkap wajib diisi.', 'error');
      return;
    }
    updateUser({ name: name.trim(), email: email.trim() });
    showToast('Profil pengguna berhasil diperbarui.', 'success');
  };

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({
      currency,
      timezone,
      theme: localTheme,
      fontSize: localFontSize,
    });
    showToast('Preferensi sistem berhasil disimpan.', 'success');
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword) {
      showToast('Masukkan kata sandi saat ini.', 'error');
      return;
    }
    if (newPassword.length < 8) {
      showToast('Kata sandi baru minimal 8 karakter.', 'error');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      showToast('Konfirmasi kata sandi baru tidak cocok.', 'error');
      return;
    }
    setOldPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    showToast('Kata sandi berhasil diperbarui.', 'success');
  };

  const handleConfirmReset = () => {
    resetToDemoData();
    setIsResetDialogOpen(false);
  };

  const handleConfirmLogout = async () => {
    await logout();
    setIsLogoutDialogOpen(false);
    router.push('/login');
  };

  // Get user avatar initials
  const initials = (name || user?.name || 'U')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('');

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <div className="pb-4 border-b border-zinc-200/80 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-950 dark:text-white">
            Pengaturan
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Kelola profil akun, preferensi antarmuka, keamanan, dan data sistem Anda.
          </p>
        </div>

        {/* Quick User Identity Pill */}
        <div className="flex items-center gap-3 px-3 py-1.5 rounded-full border border-zinc-200/80 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xs self-start sm:self-auto">
          <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-amber-500 to-amber-400 flex items-center justify-center text-white text-[10px] font-bold shadow-xs">
            {initials || 'U'}
          </div>
          <div className="text-left">
            <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 leading-none">
              {name || user?.name || 'Pengguna'}
            </p>
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 leading-none mt-0.5">
              {user?.email || 'Tamu'}
            </p>
          </div>
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse ml-1" title="Sesi Aktif" />
        </div>
      </div>

      {/* Navigation Tabs (Minimalist Segmented Control) */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-100/90 dark:bg-zinc-800/60 border border-zinc-200/70 dark:border-zinc-700/60 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${activeTab === 'profile'
              ? 'bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white shadow-xs border border-zinc-200/50 dark:border-zinc-700/50'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
        >
          <User className="h-3.5 w-3.5" />
          <span>Profil</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('preferences')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${activeTab === 'preferences'
              ? 'bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white shadow-xs border border-zinc-200/50 dark:border-zinc-700/50'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
        >
          <Sliders className="h-3.5 w-3.5" />
          <span>Tampilan & Preferensi</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${activeTab === 'security'
              ? 'bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white shadow-xs border border-zinc-200/50 dark:border-zinc-700/50'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
        >
          <Shield className="h-3.5 w-3.5" />
          <span>Keamanan</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('data')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${activeTab === 'data'
              ? 'bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white shadow-xs border border-zinc-200/50 dark:border-zinc-700/50'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
        >
          <Database className="h-3.5 w-3.5" />
          <span>Data & Sistem</span>
        </button>
      </div>

      {/* TAB 1: PROFIL & AKUN */}
      {activeTab === 'profile' && (
        <div className="space-y-5 animate-in fade-in-50 duration-200">
          <div className="rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-7 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 pb-5 border-b border-zinc-100 dark:border-zinc-800/80">
              <div className="h-14 w-14 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center text-lg font-bold shrink-0">
                {initials || <User className="h-6 w-6" />}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-zinc-950 dark:text-white">
                    {name || 'Nama Pengguna'}
                  </h3>
                  {isGoogleUser ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      <CheckCircle2 className="h-3 w-3" />
                      Google Terverifikasi
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                      Akun Lokal
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {email || 'Alamat email tidak terdaftar'}
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Nama Lengkap"
                  required
                  placeholder="Nama lengkap Anda"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  leadingIcon={<User className="h-4 w-4" />}
                />

                <Input
                  label="Alamat Email"
                  type="email"
                  required
                  placeholder="nama@email.com"
                  value={email}
                  disabled={isGoogleUser}
                  onChange={(e) => setEmail(e.target.value)}
                  leadingIcon={<Mail className="h-4 w-4" />}
                  helperText={
                    isGoogleUser
                      ? 'Email disinkronkan langsung dari akun Google Anda.'
                      : undefined
                  }
                />
              </div>

              <div className="flex justify-end pt-4 border-t border-zinc-100 dark:border-zinc-800/80">
                <Button type="submit" variant="primary" size="sm" className="shadow-xs font-semibold px-4">
                  Simpan Profil
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: TAMPILAN & PREFERENSI */}
      {activeTab === 'preferences' && (
        <div className="space-y-5 animate-in fade-in-50 duration-200">
          <form onSubmit={handleSavePreferences} className="space-y-5">
            {/* Divided Settings Group Card */}
            <div className="rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs divide-y divide-zinc-100 dark:divide-zinc-800/80 overflow-hidden">
              {/* Row 1: Tema Antarmuka */}
              <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-zinc-950 dark:text-white uppercase tracking-wider">
                    Tema Tampilan
                  </h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Pilih skema warna antarmuka yang paling nyaman untuk mata Anda.
                  </p>
                </div>

                <div className="inline-flex p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800/70 border border-zinc-200/60 dark:border-zinc-700/60 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => handleSelectTheme('light')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${localTheme === 'light'
                        ? 'bg-white dark:bg-zinc-900 text-amber-600 dark:text-amber-400 shadow-xs border border-zinc-200/50 dark:border-zinc-700/50'
                        : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                      }`}
                  >
                    <Sun className="h-3.5 w-3.5" />
                    <span>Terang</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectTheme('dark')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${localTheme === 'dark'
                        ? 'bg-white dark:bg-zinc-900 text-amber-600 dark:text-amber-400 shadow-xs border border-zinc-200/50 dark:border-zinc-700/50'
                        : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                      }`}
                  >
                    <Moon className="h-3.5 w-3.5" />
                    <span>Gelap</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectTheme('system')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${localTheme === 'system'
                        ? 'bg-white dark:bg-zinc-900 text-amber-600 dark:text-amber-400 shadow-xs border border-zinc-200/50 dark:border-zinc-700/50'
                        : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                      }`}
                  >
                    <Laptop className="h-3.5 w-3.5" />
                    <span>Sistem</span>
                  </button>
                </div>
              </div>

              {/* Row 2: Skala Ukuran Huruf */}
              <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-zinc-950 dark:text-white uppercase tracking-wider">
                    Skala Ukuran Teks
                  </h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Atur ukuran teks untuk keterbacaan optimal di seluruh formulir dan tabel.
                  </p>
                </div>

                <div className="inline-flex p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800/70 border border-zinc-200/60 dark:border-zinc-700/60 self-start sm:self-auto">
                  {(
                    [
                      { id: 'sm', label: '14px', title: 'Kecil' },
                      { id: 'normal', label: '16px', title: 'Normal' },
                      { id: 'lg', label: '18px', title: 'Besar' },
                      { id: 'xl', label: '20px', title: 'Ekstra' },
                    ] as const
                  ).map((size) => {
                    const isSelected = localFontSize === size.id;
                    return (
                      <button
                        key={size.id}
                        type="button"
                        onClick={() => handleSelectFontSize(size.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${isSelected
                            ? 'bg-white dark:bg-zinc-900 text-amber-600 dark:text-amber-400 shadow-xs border border-zinc-200/50 dark:border-zinc-700/50'
                            : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                          }`}
                        title={size.title}
                      >
                        <span>{size.title}</span>
                        <span className="text-[10px] opacity-70 ml-1">({size.label})</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Row 3: Sensor Privasi */}
              <div className="p-5 sm:p-6 flex items-center justify-between gap-4">
                <div className="space-y-0.5 pr-4">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-zinc-950 dark:text-white uppercase tracking-wider">
                      Sensor Angka Saldo
                    </h4>
                    {isPrivacyMode && (
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-bold">
                        AKTIF
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Samarkan angka saldo dan nominal mutasi menjadi <code className="font-mono text-amber-600 dark:text-amber-400">Rp••••••••</code> saat membuka aplikasi di ruang umum.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={togglePrivacyMode}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isPrivacyMode ? 'bg-amber-500' : 'bg-zinc-200 dark:bg-zinc-700'
                    }`}
                  role="switch"
                  aria-checked={isPrivacyMode}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${isPrivacyMode ? 'translate-x-5' : 'translate-x-0'
                      }`}
                  />
                </button>
              </div>

              {/* Row 4 & 5: Mata Uang & Zona Waktu */}
              <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Mata Uang Utama"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  leadingIcon={<Coins className="h-4 w-4" />}
                  options={[{ label: 'Rupiah Indonesia (IDR)', value: 'IDR' }]}
                />

                <Select
                  label="Zona Waktu"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  leadingIcon={<Clock className="h-4 w-4" />}
                  options={[
                    { label: 'WIB — Waktu Indonesia Barat (Asia/Jakarta)', value: 'Asia/Jakarta' },
                    { label: 'WITA — Waktu Indonesia Tengah (Asia/Makassar)', value: 'Asia/Makassar' },
                    { label: 'WIT — Waktu Indonesia Timur (Asia/Jayapura)', value: 'Asia/Jayapura' },
                  ]}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" variant="primary" size="sm" className="shadow-xs font-semibold px-4">
                Simpan Preferensi
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: KEAMANAN */}
      {activeTab === 'security' && (
        <div className="space-y-5 animate-in fade-in-50 duration-200">
          {isGoogleUser ? (
            <div className="rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-7 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="h-11 w-11 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center shrink-0 shadow-xs">
                    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
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
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-zinc-950 dark:text-white">
                        Otentikasi Akun Google
                      </h4>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <ShieldCheck className="h-3 w-3" />
                        Terlindungi 2FA
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                      Tersambung ke surel: <strong className="text-zinc-800 dark:text-zinc-200">{user?.email}</strong>
                    </p>
                  </div>
                </div>

                <a
                  href="https://myaccount.google.com/security"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-750 shadow-xs transition-colors shrink-0"
                >
                  <span>Buka Keamanan Google</span>
                  <ExternalLink className="h-3.5 w-3.5 text-zinc-400" />
                </a>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/60 dark:border-zinc-800 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Anda masuk melalui Single Sign-On (SSO) Google. Seluruh autentikasi, kata sandi, verifikasi 2-langkah, dan passkey dikelola secara aman langsung melalui server Google.
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-7 shadow-xs space-y-6">
              <div className="space-y-1 pb-4 border-b border-zinc-100 dark:border-zinc-800/80">
                <h3 className="text-base font-bold text-zinc-950 dark:text-white flex items-center gap-2">
                  <KeyRound className="h-4 w-4 text-amber-500" />
                  <span>Ubah Kata Sandi</span>
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Perbarui kata sandi akun lokal Anda secara berkala untuk menjaga keamanan data finansial.
                </p>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    label="Kata Sandi Saat Ini"
                    type={showOldPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    leadingIcon={<Lock className="h-4 w-4" />}
                    trailingAction={
                      <button
                        type="button"
                        onClick={() => setShowOldPassword(!showOldPassword)}
                        aria-label={showOldPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                        className="cursor-pointer p-0.5"
                      >
                        {showOldPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                    }
                  />

                  <Input
                    label="Kata Sandi Baru"
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    placeholder="Min. 8 karakter"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    leadingIcon={<Lock className="h-4 w-4" />}
                    trailingAction={
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        aria-label={showNewPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                        className="cursor-pointer p-0.5"
                      >
                        {showNewPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                    }
                  />

                  <Input
                    label="Konfirmasi Sandi Baru"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    placeholder="Ulangi kata sandi"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    leadingIcon={<Lock className="h-4 w-4" />}
                    trailingAction={
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        aria-label={showConfirmPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                        className="cursor-pointer p-0.5"
                      >
                        {showConfirmPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                    }
                  />
                </div>

                <div className="flex justify-end pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
                  <Button type="submit" variant="secondary" size="sm" className="shadow-xs font-semibold px-4">
                    Ubah Kata Sandi
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: DATA & SISTEM */}
      {activeTab === 'data' && (
        <div className="space-y-5 animate-in fade-in-50 duration-200">
          {/* Cloud Database Sync Card */}
          <div className="rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center justify-center shrink-0">
                <Cloud className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-zinc-950 dark:text-white">
                    Sinkronisasi Cloud Supabase
                  </h4>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 className="h-3 w-3" />
                    Tersambung
                  </span>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Cadangkan mutasi transaksi lokal, rekening, dan kategori ke database PostgreSQL cloud.
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={isSyncing}
              className="shadow-xs font-semibold px-4 shrink-0 self-start sm:self-auto"
              onClick={() => syncToCloud()}
            >
              <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Menyinkronkan...' : 'Sinkronkan Sekarang'}</span>
            </Button>
          </div>

          {/* Progressive Web App Status Card */}
          <div className="rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
                <Smartphone className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-zinc-950 dark:text-white">
                    Aplikasi Web Progresif (PWA)
                  </h4>
                  {isStandalone ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold">
                      Terpasang di Perangkat
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-semibold">
                      Siap Dipasang
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {isStandalone
                    ? 'Aplikasi berjalan dalam mode mandiri dengan dukungan penuh tanpa koneksi internet.'
                    : 'Pasang ke layar utama perangkat melalui menu peramban untuk akses cepat dan luring.'}
                </p>
              </div>
            </div>
          </div>

          {/* Destructive Zone (Clean, Minimalist Danger Section) */}
          <div className="rounded-2xl border border-rose-200/80 dark:border-rose-900/40 bg-rose-50/20 dark:bg-rose-950/10 p-5 sm:p-6 space-y-4">
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>Zona Tindakan Kritis</span>
              </h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Tindakan di bawah ini memengaruhi data transaksi tersimpan dan sesi pengguna saat ini.
              </p>
            </div>

            <div className="divide-y divide-rose-100 dark:divide-rose-900/30 pt-1">
              {/* Row 1: Reset Financial Data */}
              <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                    Bersihkan Seluruh Riwayat Transaksi
                  </p>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Mengosongkan mutasi transaksi, rekening, dan target tabungan lokal.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  className="shadow-xs self-start sm:self-auto shrink-0"
                  onClick={() => setIsResetDialogOpen(true)}
                >
                  <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                  <span>Bersihkan Data</span>
                </Button>
              </div>

              {/* Row 2: Logout */}
              <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                    Keluar Sesi Akun
                  </p>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Akhiri sesi masuk DompetKu pada peramban ini.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shadow-xs hover:border-rose-300 dark:hover:border-rose-800 hover:text-rose-600 dark:hover:text-rose-400 self-start sm:self-auto shrink-0"
                  onClick={() => setIsLogoutDialogOpen(true)}
                >
                  <LogOut className="h-3.5 w-3.5 mr-1.5" />
                  <span>Keluar dari Akun</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        isOpen={isResetDialogOpen}
        onClose={() => setIsResetDialogOpen(false)}
        onConfirm={handleConfirmReset}
        title="Bersihkan Data Finansial"
        description="Apakah Anda yakin ingin menghapus seluruh riwayat transaksi, anggaran, dan target tabungan? Tindakan ini akan mengosongkan data lokal Anda pada peramban ini."
        confirmText="Ya, Bersihkan Data"
        cancelText="Batal"
        variant="danger"
      />

      <ConfirmDialog
        isOpen={isLogoutDialogOpen}
        onClose={() => setIsLogoutDialogOpen(false)}
        onConfirm={handleConfirmLogout}
        title="Keluar dari Akun"
        description={`Apakah Anda yakin ingin keluar dari sesi akun ${user?.email || 'DompetKu'}? Anda dapat masuk kembali kapan saja.`}
        confirmText="Keluar"
        cancelText="Batal"
        variant="danger"
      />
    </div>
  );
}
