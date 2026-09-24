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

