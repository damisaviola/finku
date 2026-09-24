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

/**
 * Mengambil seluruh data pengguna yang tersimpan di database cloud Supabase
 */
export async function pullUserCloudData(
  userId: string,
  email?: string,
  name?: string,
  avatarUrl?: string
): Promise<CloudDataResponse | null> {
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
    return data;
  } catch (err) {
    console.warn('Pengecualian saat mengambil data cloud:', err);
    return null;
  }
}

/**
 * Mengirim perubahan (mutasi) data ke database cloud Supabase secara asynchronous
 */
export async function pushCloudMutation(
  action: string,
  userId: string,
  payload: Record<string, any>
): Promise<boolean> {
  // Hanya kirim jika userId valid (pengguna login)
  if (!userId || !userId.includes('-')) {
    return false;
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

    if (!res.ok) {
      console.warn(`Mutasi cloud gagal (${action}):`, await res.text());
      return false;
    }

    return true;
  } catch (err) {
    console.warn(`Pengecualian saat mutasi cloud (${action}):`, err);
    return false;
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

