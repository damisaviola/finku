// Utility for Indonesian formatting and CSS classes
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format number to Indonesian Rupiah (e.g. "Rp7.250.000")
 */
export function formatRupiah(
  amount: number,
  options?: { showSign?: boolean; isPrivacy?: boolean }
): string {
  if (options?.isPrivacy) {
    if (options?.showSign) {
      if (amount > 0) return '+Rp••••••••';
      if (amount < 0) return '-Rp••••••••';
    }
    return 'Rp••••••••';
  }

  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  
  const formatted = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(absAmount);

  // formatted standard output is e.g. "Rp 7.250.000" or "Rp7.250.000"
  // Normalize spacing to "Rp" without space to match PRD "Rp7.250.000"
  const cleanFormat = formatted.replace(/\s+/g, '');

  if (options?.showSign) {
    if (amount > 0) return `+${cleanFormat}`;
    if (amount < 0) return `-${cleanFormat}`;
  }

  return isNegative ? `-${cleanFormat}` : cleanFormat;
}

/**
 * Format date string or Date to Indonesian readable format (e.g. "21 Sep 2026")
 */
export function formatTanggal(dateInput: string | Date, options?: { withTime?: boolean }): string {
  if (!dateInput) return '-';
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return '-';

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
  ];

  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  if (options?.withTime) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day} ${month} ${year}, ${hours}:${minutes}`;
  }

  return `${day} ${month} ${year}`;
}

/**
 * Format month key YYYY-MM to Indonesian (e.g. "September 2026")
 */
export function formatBulan(monthKey: string): string {
  if (!monthKey || !monthKey.includes('-')) return monthKey;
  const [yearStr, monthStr] = monthKey.split('-');
  const monthIdx = parseInt(monthStr, 10) - 1;
  const fullMonths = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  return `${fullMonths[monthIdx] || ''} ${yearStr}`;
}

/**
 * Format raw number or string to dotted thousand string (e.g. 1500000 -> "1.500.000")
 */
export function formatNumberDots(value: number | string | undefined | null): string {
  if (value === undefined || value === null || value === '') return '';
  const clean = String(value).replace(/\D/g, '');
  if (!clean) return '';
  return clean.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/**
 * Parse dotted string back to pure number (e.g. "1.500.000" -> 1500000)
 */
export function parseNumberFromDots(dottedStr: string | undefined | null): number {
  if (!dottedStr) return 0;
  const clean = String(dottedStr).replace(/\D/g, '');
  return clean ? parseInt(clean, 10) : 0;
}

/**
 * Mengubah angka nominal menjadi teks terbilang Bahasa Indonesia
 * (e.g. 1500000 -> "Satu Juta Lima Ratus Ribu Rupiah")
 */
export function terbilang(angka: number): string {
  if (isNaN(angka) || angka <= 0) return '';
  if (angka > 999999999999999) return 'Nominal terlalu besar';

  const satuan = [
    '', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima',
    'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'
  ];

  function toWords(n: number): string {
    if (n < 12) return satuan[n];
    if (n < 20) return `${satuan[n - 10]} Belas`;
    if (n < 100) return `${satuan[Math.floor(n / 10)]} Puluh ${satuan[n % 10]}`.trim();
    if (n < 200) return `Seratus ${toWords(n - 100)}`.trim();
    if (n < 1000) return `${satuan[Math.floor(n / 100)]} Ratus ${toWords(n % 100)}`.trim();
    if (n < 2000) return `Seribu ${toWords(n - 1000)}`.trim();
    if (n < 1000000) return `${toWords(Math.floor(n / 1000))} Ribu ${toWords(n % 1000)}`.trim();
    if (n < 1000000000) return `${toWords(Math.floor(n / 1000000))} Juta ${toWords(n % 1000000)}`.trim();
    if (n < 1000000000000) return `${toWords(Math.floor(n / 1000000000))} Miliar ${toWords(n % 1000000000)}`.trim();
    return `${toWords(Math.floor(n / 1000000000000))} Triliun ${toWords(n % 1000000000000)}`.trim();
  }

  const hasil = toWords(Math.floor(angka));
  return hasil ? `${hasil} Rupiah` : '';
}

