'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sun,
  Moon,
  Laptop,
  Type,
  Check,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Coins,
  Clock,
  Globe,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  LogOut,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDompetKu } from '@/lib/store';
import { FontSize } from '@/types';

export default function SettingsPage() {
  const router = useRouter();
  const { user, updateUser, resetToDemoData, logout, showToast, fontSize, setFontSize } = useDompetKu();

  const isGoogleUser = user?.provider === 'google' || Boolean(user?.avatar_url?.includes('googleusercontent.com'));

  // Profile Form (PRD Bagian 41)
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');

  // Preferences (PRD Bagian 42)
  const [currency, setCurrency] = useState(user?.currency || 'IDR');
  const [timezone, setTimezone] = useState(user?.timezone || 'Asia/Jakarta');
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(user?.theme || 'system');
  const [localFontSize, setLocalFontSize] = useState<FontSize>(fontSize || user?.fontSize || 'normal');

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      if (user.currency) setCurrency(user.currency);
      if (user.timezone) setTimezone(user.timezone);
      if (user.theme) setTheme(user.theme);
    }
  }, [user]);

  useEffect(() => {
    if (fontSize) {
      setLocalFontSize(fontSize);
    }
  }, [fontSize]);

  const handleSelectFontSize = (size: FontSize) => {
    setLocalFontSize(size);
    setFontSize(size);
  };

  // Password state (PRD Bagian 43)
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Password show/hide states
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
    updateUser({ currency, timezone, theme, fontSize: localFontSize });
    setFontSize(localFontSize);
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

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Filament Page Header */}
      <div className="pb-2 border-b border-zinc-200/80 dark:border-zinc-800">
        <h2 className="text-xl font-bold tracking-tight text-zinc-950 dark:text-white">
          Pengaturan Sistem
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
          Kelola profil pengguna, konfigurasi wilayah, preferensi tampilan, dan keamanan sandi.
        </p>
      </div>

      {/* 1. KARTU PROFIL PENGGUNA */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-7 shadow-xs ring-1 ring-zinc-950/5 dark:ring-white/5 space-y-5">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
            <User className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold tracking-tight text-zinc-950 dark:text-white">
              Profil Pengguna
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Informasi identitas akun pemilik buku kas DompetKu.
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nama Lengkap */}
            <div className="space-y-1.5">
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
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 pl-9 pr-3.5 py-2 text-xs sm:text-sm bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 shadow-xs transition-colors"
                />
              </div>
            </div>

            {/* Alamat Email */}
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
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 pl-9 pr-3.5 py-2 text-xs sm:text-sm bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 shadow-xs transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
            <Button type="submit" variant="primary" className="h-9.5 px-4 font-semibold shadow-xs">
              Simpan Profil
            </Button>
          </div>
        </form>
      </div>

      {/* 2. KARTU PREFERENSI TAMPILAN & WILAYAH */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-7 shadow-xs ring-1 ring-zinc-950/5 dark:ring-white/5 space-y-5">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
            <Globe className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold tracking-tight text-zinc-950 dark:text-white">
              Preferensi Tampilan & Wilayah
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Format mata uang, zona waktu, tema antarmuka, dan skala ukuran huruf.
            </p>
          </div>
        </div>

        <form onSubmit={handleSavePreferences} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Mata Uang */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-200">
                Mata Uang Utama
              </label>
              <div className="relative flex items-center">
                <Coins className="absolute left-3 h-4 w-4 text-zinc-400 dark:text-zinc-500 pointer-events-none" />
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 pl-9 pr-8 py-2 text-xs sm:text-sm bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 shadow-xs transition-colors cursor-pointer"
                >
                  <option value="IDR">Rupiah Indonesia (IDR)</option>
                </select>
              </div>
            </div>

            {/* Zona Waktu */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-200">
                Zona Waktu
              </label>
              <div className="relative flex items-center">
                <Clock className="absolute left-3 h-4 w-4 text-zinc-400 dark:text-zinc-500 pointer-events-none" />
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 pl-9 pr-8 py-2 text-xs sm:text-sm bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 shadow-xs transition-colors cursor-pointer"
                >
                  <option value="Asia/Jakarta">WIB (Asia/Jakarta)</option>
                  <option value="Asia/Makassar">WITA (Asia/Makassar)</option>
                  <option value="Asia/Jayapura">WIT (Asia/Jayapura)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tema Antarmuka */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-200">
              Tema Antarmuka
            </label>
            <div className="grid grid-cols-3 gap-2.5 max-w-md">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  theme === 'light'
                    ? 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-400 ring-2 ring-amber-500/20 shadow-xs'
                    : 'border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                }`}
              >
                <Sun className="h-3.5 w-3.5" />
                <span>Terang</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  theme === 'dark'
                    ? 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-400 ring-2 ring-amber-500/20 shadow-xs'
                    : 'border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                }`}
              >
                <Moon className="h-3.5 w-3.5" />
                <span>Gelap</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme('system')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  theme === 'system'
                    ? 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-400 ring-2 ring-amber-500/20 shadow-xs'
                    : 'border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                }`}
              >
                <Laptop className="h-3.5 w-3.5" />
                <span>Sistem</span>
              </button>
            </div>
          </div>

          {/* Ukuran Font & Teks Formulir */}
          <div className="space-y-3 pt-3 border-t border-zinc-200/80 dark:border-zinc-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-200">
                  Ukuran Huruf / Font Antarmuka & Formulir
                </label>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Sesuaikan skala ukuran teks pada input formulir, label, tombol, dan seluruh aplikasi.
                </p>
              </div>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 self-start sm:self-auto">
                Aktif:{' '}
                <strong className="text-amber-600 dark:text-amber-400">
                  {localFontSize === 'sm'
                    ? 'Kecil (14px)'
                    : localFontSize === 'normal'
                    ? 'Normal (16px)'
                    : localFontSize === 'lg'
                    ? 'Besar (18px)'
                    : 'Sangat Besar (20px)'}
                </strong>
              </span>
            </div>

            {/* Grid 4 Opsi Ukuran */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                {
                  id: 'sm' as FontSize,
                  label: 'Kecil',
                  sizeText: '14px',
                  desc: 'Ringkas & padat',
                  sampleClass: 'text-xs',
                },
                {
                  id: 'normal' as FontSize,
                  label: 'Normal',
                  sizeText: '16px (Bawaan)',
                  desc: 'Standar rekomendasi',
                  sampleClass: 'text-sm',
                },
                {
                  id: 'lg' as FontSize,
                  label: 'Besar',
                  sizeText: '18px',
                  desc: 'Nyaman dibaca',
                  sampleClass: 'text-base',
                },
                {
                  id: 'xl' as FontSize,
                  label: 'Sangat Besar',
                  sizeText: '20px',
                  desc: 'Keterbacaan tinggi',
                  sampleClass: 'text-lg font-semibold',
                },
              ].map((item) => {
                const isSelected = localFontSize === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectFontSize(item.id)}
                    className={`relative flex flex-col items-start p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-amber-500 bg-amber-500/10 dark:bg-amber-500/15 ring-2 ring-amber-500/20 shadow-xs'
                        : 'border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600 bg-white dark:bg-zinc-950'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span
                        className={`inline-flex items-center justify-center font-serif leading-none ${item.sampleClass} ${
                          isSelected
                            ? 'text-amber-600 dark:text-amber-400 font-bold'
                            : 'text-zinc-700 dark:text-zinc-300'
                        }`}
                      >
                        A
                      </span>
                      {isSelected && (
                        <span className="flex items-center justify-center h-4 w-4 rounded-full bg-amber-500 text-white">
                          <Check className="h-2.5 w-2.5" />
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-xs font-bold ${
                        isSelected
                          ? 'text-amber-700 dark:text-amber-400'
                          : 'text-zinc-900 dark:text-zinc-100'
                      }`}
                    >
                      {item.label}
                    </span>
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">
                      {item.sizeText}
                    </span>
                    <span className="text-[9px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                      {item.desc}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Pratinjau Interaktif Langsung */}
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/50 p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                  <Type className="h-3.5 w-3.5 text-amber-500" />
                  <span>Pratinjau Langsung Formulir</span>
                </div>
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">
                  Skala: {localFontSize.toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-200">
                    Nama Lengkap
                  </label>
                  <div className="relative flex items-center">
                    <User className="absolute left-3 h-4 w-4 text-zinc-400 dark:text-zinc-500 pointer-events-none" />
                    <input
                      type="text"
                      readOnly
                      value={name || 'Budi Santoso'}
                      className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 pl-9 pr-3.5 py-1.5 sm:py-2 text-xs sm:text-sm bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                    Contoh teks nama lengkap sesuai formulir
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-200">
                    Alamat Email
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="absolute left-3 h-4 w-4 text-zinc-400 dark:text-zinc-500 pointer-events-none" />
                    <input
                      type="email"
                      readOnly
                      value={email || 'budi.santoso@example.com'}
                      className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 pl-9 pr-3.5 py-1.5 sm:py-2 text-xs sm:text-sm bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                    Contoh teks alamat surel sesuai formulir
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
            <Button type="submit" variant="primary" className="h-9.5 px-4 font-semibold shadow-xs">
              Simpan Preferensi
            </Button>
          </div>
        </form>
      </div>

      {/* 3. KARTU KEAMANAN KATA SANDI */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-7 shadow-xs ring-1 ring-zinc-950/5 dark:ring-white/5 space-y-5">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold tracking-tight text-zinc-950 dark:text-white">
              Keamanan Kata Sandi
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Perbarui kata sandi akun DompetKu Anda untuk proteksi maksimal.
            </p>
          </div>
        </div>

        {isGoogleUser ? (
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] dark:bg-emerald-500/10 p-4 sm:p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center shrink-0 shadow-xs">
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
                      Otentikasi Akun Google Aktif
                    </h4>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      <ShieldCheck className="h-3 w-3" />
                      Terlindungi 2FA
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Tersinkronisasi dengan email Google: <strong className="text-zinc-800 dark:text-zinc-200">{user?.email}</strong>
                  </p>
                </div>
              </div>

              <a
                href="https://myaccount.google.com/security"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700/80 shadow-xs transition-colors shrink-0"
              >
                <span>Kelola di Akun Google</span>
                <ExternalLink className="h-3.5 w-3.5 text-zinc-400" />
              </a>
            </div>

            <div className="p-3 rounded-lg bg-zinc-100/70 dark:bg-zinc-800/50 text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed border border-zinc-200/50 dark:border-zinc-700/50">
              💡 <strong>Keamanan Terpusat:</strong> Anda masuk tanpa kata sandi lokal di DompetKu. Seluruh perlindungan login, kata sandi utama, verifikasi 2 langkah (2FA), serta kunci sandi (Passkey) dikelola langsung secara aman oleh server Google.
            </div>
          </div>
        ) : (
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {/* Kata Sandi Saat Ini */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-200">
                  Kata Sandi Saat Ini <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3 h-4 w-4 text-zinc-400 dark:text-zinc-500 pointer-events-none" />
                  <input
                    type={showOldPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 pl-9 pr-9 py-2 text-xs sm:text-sm bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 shadow-xs transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    aria-label={showOldPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                    className="absolute right-2.5 p-0.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
                  >
                    {showOldPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              {/* Kata Sandi Baru */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-200">
                  Kata Sandi Baru <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3 h-4 w-4 text-zinc-400 dark:text-zinc-500 pointer-events-none" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    placeholder="Min. 8 karakter"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 pl-9 pr-9 py-2 text-xs sm:text-sm bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 shadow-xs transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    aria-label={showNewPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                    className="absolute right-2.5 p-0.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              {/* Ulangi Kata Sandi Baru */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-200">
                  Ulangi Kata Sandi Baru <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3 h-4 w-4 text-zinc-400 dark:text-zinc-500 pointer-events-none" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    placeholder="Ulangi kata sandi baru"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 pl-9 pr-9 py-2 text-xs sm:text-sm bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 shadow-xs transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                    className="absolute right-2.5 p-0.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
              <Button type="submit" variant="secondary" className="h-9.5 px-4 font-semibold shadow-xs">
                Ubah Kata Sandi
              </Button>
            </div>
          </form>
        )}
      </div>

      {/* 4. KARTU ATUR ULANG DATA FINANSIAL */}
      <div className="rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/20 dark:bg-rose-950/15 p-6 sm:p-7 shadow-xs ring-1 ring-rose-950/5 dark:ring-white/5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center justify-center shrink-0">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold tracking-tight text-rose-700 dark:text-rose-400">
              Atur Ulang Data Finansial
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Kosongkan seluruh riwayat mutasi transaksi, pagu anggaran, dan target tabungan Anda ke kondisi bersih.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-rose-100 dark:border-rose-900/30">
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            ⚠️ Tindakan ini akan menghapus mutasi transaksi lokal di peramban ini.
          </span>
          <Button
            variant="danger"
            className="h-9 px-4 text-xs font-semibold shadow-xs self-start sm:self-auto"
            onClick={() => {
              if (window.confirm('Hapus seluruh riwayat transaksi, anggaran, dan target tabungan Anda?')) {
                resetToDemoData();
              }
            }}
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
            <span>Bersihkan Data Finansial</span>
          </Button>
        </div>
      </div>

      {/* 5. KARTU KELUAR DARI AKUN */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-7 shadow-xs ring-1 ring-zinc-950/5 dark:ring-white/5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center shrink-0">
              <LogOut className="h-5 w-5 text-rose-500" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight text-zinc-950 dark:text-white">
                Sesi Akun Pengguna
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Keluar dari sesi akun saat ini ({user?.email || 'Belum masuk'}).
              </p>
            </div>
          </div>
          <Button
            variant="danger"
            className="h-9 px-4 text-xs font-semibold shadow-xs self-start sm:self-auto"
            onClick={async () => {
              if (window.confirm('Apakah Anda yakin ingin keluar dari akun DompetKu?')) {
                await logout();
                router.push('/login');
              }
            }}
          >
            <LogOut className="h-3.5 w-3.5 mr-1.5" />
            <span>Keluar dari Akun</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
