import { Account, Category, Transaction, Budget, Goal, Debt } from '@/types';

export interface CloudDataResponse {
  success: boolean;
  user?: {
    id: string;
    name: string;
    email: string;
    avatar_url?: string | null;
  } | null;
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];
  goals: Goal[];
  debts: Debt[];
  error?: string;
}

let ongoingPullPromise: Promise<CloudDataResponse | null> | null = null;
let cachedData: CloudDataResponse | null = null;
let lastPullTimestamp = 0;
let lastUserId = '';
const CACHE_MAX_AGE_MS = 10000; // 10 detik cache untuk navigasi instan antar-halaman

/**
 * Menghapus cache in-memory saat ada data baru yang disimpan
 */
export function invalidateCloudCache() {
  cachedData = null;
  lastPullTimestamp = 0;
  ongoingPullPromise = null;
}

/**
 * Mengambil seluruh data pengguna yang tersimpan di database cloud Supabase
 * Dilengkapi dengan deduplikasi request agar tidak terjadi multiple fetch bersamaan
 */
export async function pullUserCloudData(
  userId: string,
  email?: string,
  name?: string,
  avatarUrl?: string,
  forceRefresh: boolean = false
): Promise<CloudDataResponse | null> {
  const now = Date.now();

  // 1. Gunakan cache in-memory jika data masih hangat (< 10 detik) dan user sama
  if (
    !forceRefresh &&
    cachedData &&
    lastUserId === userId &&
    now - lastPullTimestamp < CACHE_MAX_AGE_MS
  ) {
    return cachedData;
  }

  // 2. Request deduplication: jika sudah ada fetch yang sedang berlangsung, pakai Promise yang sama
  if (ongoingPullPromise && lastUserId === userId && !forceRefresh) {
    return ongoingPullPromise;
  }

  lastUserId = userId;
  ongoingPullPromise = (async () => {
    try {
      const params = new URLSearchParams({ userId });
      if (email) params.set('email', email);
      if (name) params.set('name', name);
      if (avatarUrl) params.set('avatar_url', avatarUrl);

      const res = await fetch(`/api/sync?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        console.warn('Gagal memuat data cloud pengguna:', await res.text());
        return null;
      }

      const data: CloudDataResponse = await res.json();
      if (data && data.success) {
        cachedData = data;
        lastPullTimestamp = Date.now();
      }
      return data;
    } catch (err) {
      console.warn('Pengecualian saat mengambil data cloud:', err);
      return null;
    } finally {
      ongoingPullPromise = null;
    }
  })();

  return ongoingPullPromise;
}

export interface MutationResponse {
  success: boolean;
  id?: string;
  error?: string;
  account?: Account;
  category?: Category;
  transaction?: Transaction;
  budget?: Budget;
  goal?: Goal;
  debt?: Debt;
}

/**
 * Mengirim perubahan (mutasi) data langsung ke database PostgreSQL Supabase
 */
export async function pushCloudMutation(
  action: string,
  userId: string,
  payload: Record<string, any>
): Promise<MutationResponse> {
  if (!userId || !userId.includes('-')) {
    return { success: false, error: 'Sesi pengguna tidak valid. Silakan login kembali.' };
  }

  try {
    const res = await fetch('/api/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action,
        userId,
        ...payload,
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      const errMsg = data.error || `Mutasi cloud gagal (${action})`;
      console.warn(errMsg);
      return { success: false, error: errMsg };
    }

    invalidateCloudCache();
    return { success: true, ...data };
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : `Pengecualian saat mutasi (${action})`;
    console.warn(errMsg);
    return { success: false, error: errMsg };
  }
}

/**
 * Mengirim seluruh data lokal (akun, transaksi, anggaran, target, utang) ke database Supabase
 */
export async function batchSyncLocalData(
  userId: string,
  localData: {
    accounts?: Account[];
    categories?: Category[];
    transactions?: Transaction[];
    budgets?: Budget[];
    goals?: Goal[];
    debts?: Debt[];
  }
): Promise<CloudDataResponse | null> {
  if (!userId || !userId.includes('-')) {
    return null;
  }

  try {
    const res = await fetch('/api/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'batchSync',
        userId,
        data: localData,
      }),
    });

    if (!res.ok) {
      console.warn('Batch sync gagal:', await res.text());
      return null;
    }

    const data: CloudDataResponse = await res.json();
    return data;
  } catch (err) {
    console.warn('Pengecualian saat batch sync:', err);
    return null;
  }
}

