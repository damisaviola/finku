import { supabase, isSupabaseConfigured } from './client';
import { UserProfile, Account, Category, Transaction, Budget, Goal, Debt } from '@/types';

/**
 * Initiates Google OAuth Login through Supabase
 */
export async function signInWithGoogle(): Promise<{ error: Error | null }> {
  if (!isSupabaseConfigured || !supabase) {
    return {
      error: new Error(
        'Supabase belum dikonfigurasi. Silakan tambahkan NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY di berkas .env.local'
      ),
    };
  }

  try {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const redirectTo = `${origin}/auth/callback`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      return { error };
    }

    return { error: null };
  } catch (err: unknown) {
    return {
      error: err instanceof Error ? err : new Error('Terjadi kesalahan saat menghubungkan ke Google OAuth'),
    };
  }
}

/**
 * Signs out from Supabase Auth
 */
export async function signOutSupabase(): Promise<{ error: Error | null }> {
  if (!isSupabaseConfigured || !supabase) {
    return { error: null };
  }

  try {
    const { error } = await supabase.auth.signOut();
    return { error: error || null };
  } catch (err: unknown) {
    return {
      error: err instanceof Error ? err : new Error('Gagal keluar dari sesi Supabase'),
    };
  }
}

/**
 * Retrieves the current session from Supabase
 */
export async function getSupabaseSession() {
  if (!isSupabaseConfigured || !supabase) {
    return null;
  }

  try {
    const { data } = await supabase.auth.getSession();
    return data.session;
  } catch (err) {
    console.error('Error fetching Supabase session:', err);
    return null;
  }
}

/**
 * Syncs user profile metadata from Supabase Auth to public.users table
 */
export async function syncUserProfile(userProfile: UserProfile): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) {
    return false;
  }

  try {
    const { error } = await supabase.from('users').upsert({
      id: userProfile.id,
      name: userProfile.name,
      email: userProfile.email,
      avatar_url: userProfile.avatar_url || null,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.warn('Notice: Could not upsert to public.users table (might be RLS or table schema):', error.message);
      return false;
    }

    return true;
  } catch (err) {
    console.warn('Sync user profile error:', err);
    return false;
  }
}

/**
 * Registers user with email and password via backend API and Supabase
 */
export async function registerUserWithEmail(name: string, email: string, password: string): Promise<{
  error: Error | null;
  user?: UserProfile;
  accounts?: Array<{ id: string; name: string; type: string; balance: number; color?: string }>;
}> {
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        error: new Error(data.error || 'Terjadi kesalahan saat pendaftaran akun.'),
      };
    }

    return {
      error: null,
      user: data.user,
      accounts: data.accounts,
    };
  } catch (err: unknown) {
    return {
      error: err instanceof Error ? err : new Error('Gagal menghubungi server pendaftaran.'),
    };
  }
}

/**
 * Logs in user with email and password via backend API and Supabase
 */
export async function loginUserWithEmail(email: string, password: string): Promise<{
  error: Error | null;
  user?: UserProfile;
  accounts?: Account[];
  categories?: Category[];
  transactions?: Transaction[];
  budgets?: Budget[];
  goals?: Goal[];
  debts?: Debt[];
}> {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        error: new Error(data.error || 'Email atau kata sandi tidak valid.'),
      };
    }

    return {
      error: null,
      user: data.user,
      accounts: data.accounts || [],
      categories: data.categories || [],
      transactions: data.transactions || [],
      budgets: data.budgets || [],
      goals: data.goals || [],
      debts: data.debts || [],
    };
  } catch (err: unknown) {
    return {
      error: err instanceof Error ? err : new Error('Gagal menghubungi server otentikasi.'),
    };
  }
}
