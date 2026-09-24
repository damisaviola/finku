'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Account, Category, Transaction, Budget, Goal, UserProfile, TransactionType, FontSize, Debt, DebtPayment } from '@/types';
import {
  INITIAL_ACCOUNTS,
  INITIAL_CATEGORIES,
  INITIAL_TRANSACTIONS,
  INITIAL_BUDGETS,
  INITIAL_GOALS,
  INITIAL_DEBTS,
} from './mock-data';
import { calculateAccountBalance, validateTransactionBalance } from './calculations/finance';
import { formatRupiah } from './utils/formatters';
import { supabase, isSupabaseConfigured } from './supabase/client';
import { signOutSupabase } from './supabase/auth';
import { pullUserCloudData, pushCloudMutation, batchSyncLocalData } from './supabase/sync';

function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface DompetKuContextType {
  user: UserProfile | null;
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];
  goals: Goal[];
  isClient: boolean;
  activeMonth: string;
  setActiveMonth: (month: string) => void;
  
  // Theme Management
  theme: 'light' | 'dark' | 'system';
  isDarkMode: boolean;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleTheme: () => void;

  // Privacy Mode Management
  isPrivacyMode: boolean;
  togglePrivacyMode: () => void;
  setPrivacyMode: (value: boolean) => void;
  formatAmount: (amount: number, options?: { showSign?: boolean }) => string;

  // Font Size Management
  fontSize: FontSize;
  setFontSize: (fontSize: FontSize) => void;

  // Quick Transaction Modal state
  isTransactionModalOpen: boolean;
  transactionModalInitialType: TransactionType;
  transactionToEdit: Transaction | null;
  transactionModalInitialDate: string | null;
  openTransactionModal: (type?: TransactionType, editTx?: Transaction | null, initialDate?: string | null) => void;
  closeTransactionModal: () => void;

  // Actions (Direct Database Operations)
  addTransaction: (data: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>) => Promise<boolean>;
  updateTransaction: (id: string, data: Partial<Transaction>) => Promise<boolean>;
  deleteTransaction: (id: string) => Promise<boolean>;

  addAccount: (data: Omit<Account, 'id' | 'created_at' | 'updated_at'>) => Promise<boolean>;
  updateAccount: (id: string, data: Partial<Account>) => Promise<boolean>;
  deleteAccount: (id: string) => Promise<boolean>;

  addCategory: (data: Omit<Category, 'id' | 'created_at' | 'updated_at'>) => Promise<boolean>;
  updateCategory: (id: string, data: Partial<Category>) => Promise<boolean>;
  deleteCategory: (id: string) => Promise<boolean>;

  addBudget: (data: Omit<Budget, 'id' | 'created_at' | 'updated_at'>) => Promise<boolean>;
  updateBudget: (id: string, data: Partial<Budget>) => Promise<boolean>;
  deleteBudget: (id: string) => Promise<boolean>;

  addGoal: (data: Omit<Goal, 'id' | 'created_at' | 'updated_at'>) => Promise<boolean>;
  updateGoal: (id: string, data: Partial<Goal>) => Promise<boolean>;
  contributeGoal: (id: string, amount: number, accountId?: string) => Promise<boolean>;
  deleteGoal: (id: string) => Promise<boolean>;

  // Debt & Receivable Management
  debts: Debt[];
  addDebt: (data: Omit<Debt, 'id' | 'created_at' | 'updated_at' | 'paid_amount' | 'payments'>, syncInitialTransaction?: boolean) => Promise<boolean>;
  updateDebt: (id: string, data: Partial<Debt>) => Promise<boolean>;
  deleteDebt: (id: string) => Promise<boolean>;
  recordDebtPayment: (
    debtId: string,
    amount: number,
    paymentDate: string,
    accountId?: string | null,
    notes?: string,
    syncWithAccount?: boolean
  ) => Promise<boolean>;

  loginUser: (email: string, name?: string) => void;
  registerUser: (name: string, email: string) => void;
  setCleanUserSession: (
    profile: UserProfile,
    initialAccounts?: Account[],
    initialCategories?: Category[],
    initialTransactions?: Transaction[],
    initialBudgets?: Budget[],
    initialGoals?: Goal[],
    initialDebts?: Debt[]
  ) => void;

  updateUser: (profile: Partial<UserProfile>) => void;
  resetAllFinancialData: () => void;
  resetToDemoData: () => void;
  logout: () => Promise<void>;

  // Cloud Database Sync
  syncToCloud: () => Promise<boolean>;
  isSyncing: boolean;

  // Toast
  toasts: ToastItem[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
}

export const DEFAULT_CLEAN_ACCOUNTS: Account[] = [];

const DompetKuContext = createContext<DompetKuContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'dompetku_data_v1';

export function DompetKuProvider({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [activeMonth, setActiveMonth] = useState<string>('2026-09');

  // Theme State
  const [theme, setThemeState] = useState<'light' | 'dark' | 'system'>('system');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Privacy Mode State (Sensoring balance amounts)
  const [isPrivacyMode, setIsPrivacyMode] = useState(false);

  // Font Size State
  const [fontSize, setFontSizeState] = useState<FontSize>('normal');

  // Modal State
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [transactionModalInitialType, setTransactionModalInitialType] = useState<TransactionType>('expense');
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);
  const [transactionModalInitialDate, setTransactionModalInitialDate] = useState<string | null>(null);

  // Toast State
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Syncing State
  const [isSyncing, setIsSyncing] = useState(false);

  // Apply dark class to <html> element
  useEffect(() => {
    const applyTheme = (currentTheme: 'light' | 'dark' | 'system') => {
      const systemDark =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches;
      const shouldBeDark =
        currentTheme === 'dark' || (currentTheme === 'system' && systemDark);

      setIsDarkMode(shouldBeDark);
      if (shouldBeDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    applyTheme(theme);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleMediaChange = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleMediaChange);
    return () => mediaQuery.removeEventListener('change', handleMediaChange);
  }, [theme]);

  const setTheme = useCallback((newTheme: 'light' | 'dark' | 'system') => {
    setThemeState(newTheme);
    setUser((prev) => (prev ? { ...prev, theme: newTheme } : null));
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}_theme`, newTheme);
    } catch (e) {
      console.warn('Failed to save theme to localStorage:', e);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    const nextTheme = isDarkMode ? 'light' : 'dark';
    setTheme(nextTheme);
  }, [isDarkMode, setTheme]);

  // Apply font size to <html> element
  useEffect(() => {
    const sizeMap: Record<FontSize, string> = {
      sm: '14px',
      normal: '16px',
      lg: '18px',
      xl: '20px',
    };
    if (typeof document !== 'undefined') {
      document.documentElement.dataset.fontSize = fontSize;
      document.documentElement.style.fontSize = sizeMap[fontSize] || '16px';
    }
  }, [fontSize]);

  const setFontSize = useCallback((newSize: FontSize) => {
    setFontSizeState(newSize);
    setUser((prev) => (prev ? { ...prev, fontSize: newSize } : null));
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}_fontSize`, newSize);
    } catch (e) {
      console.warn('Failed to save fontSize to localStorage:', e);
    }
  }, []);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const togglePrivacyMode = useCallback(() => {
    setIsPrivacyMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}_privacy_mode`, String(next));
      } catch (e) {
        console.warn('Failed to save privacy mode to localStorage:', e);
      }
      showToast(
        next ? 'Mode Privasi aktif (Nominal saldo disamarkan).' : 'Mode Privasi dinonaktifkan (Nominal saldo ditampilkan).',
        'info'
      );
      return next;
    });
  }, [showToast]);

  const setPrivacyMode = useCallback((value: boolean) => {
    setIsPrivacyMode(value);
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}_privacy_mode`, String(value));
    } catch (e) {
      console.warn('Failed to save privacy mode to localStorage:', e);
    }
  }, []);

  const formatAmount = useCallback(
    (amount: number, options?: { showSign?: boolean }) => {
      return formatRupiah(amount, { ...options, isPrivacy: isPrivacyMode });
    },
    [isPrivacyMode]
  );

  // Mount: Bersihkan seluruh data finansial lama di localStorage dan paksa login ulang dari awal
  useEffect(() => {
    setIsClient(true);
    try {
      // 1. Bersihkan seluruh penyimpanan lokal finansial agar murni 100% menggunakan database
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}_accounts`);
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}_categories`);
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}_transactions`);
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}_budgets`);
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}_goals`);
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}_debts`);

      // 2. Paksa pengguna login ulang dari awal satu kali untuk migrasi database langsung
      const RELOGIN_FLAG = 'dompetku_force_relogin_v2';
      if (!localStorage.getItem(RELOGIN_FLAG)) {
        localStorage.removeItem(`${STORAGE_KEY_PREFIX}_user`);
        setUser(null);
        setAccounts([]);
        setTransactions([]);
        setBudgets([]);
        setGoals([]);
        setDebts([]);
        signOutSupabase().catch(() => {});
        localStorage.setItem(RELOGIN_FLAG, 'true');
      } else {
        const savedUser = localStorage.getItem(`${STORAGE_KEY_PREFIX}_user`);
        if (savedUser) {
          try {
            setUser(JSON.parse(savedUser));
          } catch {
            setUser(null);
          }
        }
      }

      // 3. Muat preferensi UI saja (tema, ukuran font, mode privasi)
      const savedTheme = localStorage.getItem(`${STORAGE_KEY_PREFIX}_theme`) as 'light' | 'dark' | 'system';
      if (savedTheme) {
        setThemeState(savedTheme);
      }

      const savedFontSize = localStorage.getItem(`${STORAGE_KEY_PREFIX}_fontSize`) as FontSize;
      if (savedFontSize && ['sm', 'normal', 'lg', 'xl'].includes(savedFontSize)) {
        setFontSizeState(savedFontSize);
      }

      const savedPrivacy = localStorage.getItem(`${STORAGE_KEY_PREFIX}_privacy_mode`);
      if (savedPrivacy === 'true') {
        setIsPrivacyMode(true);
      }
    } catch (e) {
      console.warn('Gagal memproses penyimpanan sesi:', e);
    }
  }, []);

  // Muat data langsung dari database Supabase PostgreSQL setiap kali pengguna login
  useEffect(() => {
    if (!isClient || !user?.id) return;

    pullUserCloudData(user.id, user.email, user.name, user.avatar_url)
      .then((cloud) => {
        if (cloud && cloud.success) {
          if (cloud.accounts) setAccounts(cloud.accounts);
          if (cloud.categories && cloud.categories.length > 0) setCategories(cloud.categories);
          if (cloud.transactions) setTransactions(cloud.transactions);
          if (cloud.budgets) setBudgets(cloud.budgets);
          if (cloud.goals) setGoals(cloud.goals);
          if (cloud.debts) setDebts(cloud.debts);
        }
      })
      .catch(console.warn);
  }, [isClient, user?.id, user?.email, user?.name, user?.avatar_url]);

  // Hanya simpan sesi autentikasi pengguna ke localStorage (TIDAK ADA DATA FINANSIAL DI LOCALSTORAGE)
  useEffect(() => {
    if (!isClient) return;
    try {
      if (user) {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}_user`, JSON.stringify(user));
      } else {
        localStorage.removeItem(`${STORAGE_KEY_PREFIX}_user`);
      }
    } catch (e) {
      console.warn('Gagal memperbarui sesi di localStorage:', e);
    }
  }, [isClient, user]);

  // Listen for Supabase Auth state changes and pull database data
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    const syncSessionCloudData = async (
      sessionUser: import('@supabase/supabase-js').User
    ) => {
      const meta = sessionUser.user_metadata || {};
      const isGoogle = sessionUser.app_metadata?.provider === 'google' || Boolean(meta.avatar_url?.includes('googleusercontent.com'));
      const resolvedName = meta.full_name || meta.name || sessionUser.email?.split('@')[0] || 'Pengguna DompetKu';
      const resolvedAvatar = meta.avatar_url || meta.picture;

      setUser((prev) => ({
        id: sessionUser.id,
        name: resolvedName,
        email: sessionUser.email || '',
        avatar_url: resolvedAvatar || prev?.avatar_url,
        provider: isGoogle ? 'google' : (prev?.provider || 'email'),
        currency: prev?.currency || 'IDR',
        timezone: prev?.timezone || 'Asia/Jakarta',
        theme: prev?.theme || 'system',
        fontSize: prev?.fontSize || 'normal',
      }));

      try {
        const cloud = await pullUserCloudData(sessionUser.id, sessionUser.email, resolvedName, resolvedAvatar);
        if (cloud && cloud.success) {
          if (cloud.accounts) setAccounts(cloud.accounts);
          if (cloud.categories && cloud.categories.length > 0) setCategories(cloud.categories);
          if (cloud.transactions) setTransactions(cloud.transactions);
          if (cloud.budgets) setBudgets(cloud.budgets);
          if (cloud.goals) setGoals(cloud.goals);
          if (cloud.debts) setDebts(cloud.debts);
        }
      } catch (err) {
        console.warn('Gagal memuat data cloud pengguna:', err);
      }
    };

    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        syncSessionCloudData(session.user);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        syncSessionCloudData(session.user);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setAccounts([]);
        setTransactions([]);
        setBudgets([]);
        setGoals([]);
        setDebts([]);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const openTransactionModal = useCallback((type: TransactionType = 'expense', editTx: Transaction | null = null, initialDate: string | null = null) => {
    setTransactionModalInitialType(type);
    setTransactionToEdit(editTx);
    setTransactionModalInitialDate(initialDate);
    setIsTransactionModalOpen(true);
  }, []);

  const closeTransactionModal = useCallback(() => {
    setIsTransactionModalOpen(false);
    setTransactionToEdit(null);
    setTransactionModalInitialDate(null);
  }, []);

  // Transaction Management with Direct Database Persist
  const addTransaction = useCallback(
    async (data: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> => {
      const sourceAccount = accounts.find((a) => a.id === data.account_id);
      if (!sourceAccount) {
        showToast('Rekening tidak ditemukan.', 'error');
        return false;
      }

      if (data.type === 'expense' || data.type === 'transfer') {
        const currentBalance = calculateAccountBalance(sourceAccount, transactions);
        const check = validateTransactionBalance({
          type: data.type,
          amount: data.amount,
          sourceAccount,
          currentBalance,
        });

        if (!check.valid) {
          showToast(check.error || 'Saldo tidak mencukupi.', 'error');
          return false;
        }
      }

      if (!user?.id) {
        showToast('Silakan masuk ke akun Anda terlebih dahulu.', 'error');
        return false;
      }

      const newTx: Transaction = {
        ...data,
        id: generateId(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      try {
        const res = await pushCloudMutation('upsertTransaction', user.id, { data: newTx });
        if (res?.success) {
          const finalTx = (res.transaction as Transaction) || newTx;
          setTransactions((prev) => [finalTx, ...prev]);
          showToast('Transaksi berhasil ditambahkan ke database.', 'success');
          return true;
        } else {
          showToast(res?.error || 'Gagal menyimpan transaksi ke database.', 'error');
          return false;
        }
      } catch (err: any) {
        showToast(err?.message || 'Gagal menghubungi database.', 'error');
        return false;
      }
    },
    [accounts, transactions, user?.id, showToast]
  );

  const updateTransaction = useCallback(
    async (id: string, data: Partial<Transaction>): Promise<boolean> => {
      if (!user?.id) {
        showToast('Silakan masuk ke akun Anda terlebih dahulu.', 'error');
        return false;
      }

      const existing = transactions.find((t) => t.id === id);
      if (!existing) {
        showToast('Transaksi tidak ditemukan.', 'error');
        return false;
      }

      const updatedTx: Transaction = {
        ...existing,
        ...data,
        updated_at: new Date().toISOString(),
      };

      try {
        const res = await pushCloudMutation('upsertTransaction', user.id, { data: updatedTx });
        if (res?.success) {
          const finalTx = (res.transaction as Transaction) || updatedTx;
          setTransactions((prev) => prev.map((t) => (t.id === id ? finalTx : t)));
          showToast('Transaksi berhasil diperbarui di database.', 'success');
          return true;
        } else {
          showToast(res?.error || 'Gagal memperbarui transaksi di database.', 'error');
          return false;
        }
      } catch (err: any) {
        showToast(err?.message || 'Gagal menghubungi database.', 'error');
        return false;
      }
    },
    [transactions, user?.id, showToast]
  );

  const deleteTransaction = useCallback(
    async (id: string): Promise<boolean> => {
      if (!user?.id) {
        showToast('Silakan masuk ke akun Anda terlebih dahulu.', 'error');
        return false;
      }

      try {
        const res = await pushCloudMutation('deleteTransaction', user.id, { id });
        if (res?.success) {
          setTransactions((prev) => prev.filter((t) => t.id !== id));
          showToast('Transaksi berhasil dihapus dari database.', 'success');
          return true;
        } else {
          showToast(res?.error || 'Gagal menghapus transaksi dari database.', 'error');
          return false;
        }
      } catch (err: any) {
        showToast(err?.message || 'Gagal menghubungi database.', 'error');
        return false;
      }
    },
    [user?.id, showToast]
  );

  // Account Management with Direct Database Persist
  const addAccount = useCallback(
    async (data: Omit<Account, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> => {
      if (!user?.id) {
        showToast('Silakan masuk ke akun Anda terlebih dahulu.', 'error');
        return false;
      }

      const newAccount: Account = {
        ...data,
        id: generateId(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      try {
        const res = await pushCloudMutation('upsertAccount', user.id, { data: newAccount });
        if (res?.success) {
          const finalAcc = (res.account as Account) || newAccount;
          setAccounts((prev) => [...prev, finalAcc]);
          showToast('Rekening berhasil ditambahkan ke database.', 'success');
          return true;
        } else {
          showToast(res?.error || 'Gagal menambahkan rekening ke database.', 'error');
          return false;
        }
      } catch (err: any) {
        showToast(err?.message || 'Gagal menghubungi database.', 'error');
        return false;
      }
    },
    [user?.id, showToast]
  );

  const updateAccount = useCallback(
    async (id: string, data: Partial<Account>): Promise<boolean> => {
      if (!user?.id) {
        showToast('Silakan masuk ke akun Anda terlebih dahulu.', 'error');
        return false;
      }

      const existing = accounts.find((a) => a.id === id);
      if (!existing) {
        showToast('Rekening tidak ditemukan.', 'error');
        return false;
      }

      const updatedAccount: Account = {
        ...existing,
        ...data,
        updated_at: new Date().toISOString(),
      };

      try {
        const res = await pushCloudMutation('upsertAccount', user.id, { data: updatedAccount });
        if (res?.success) {
          const finalAcc = (res.account as Account) || updatedAccount;
          setAccounts((prev) => prev.map((a) => (a.id === id ? finalAcc : a)));
          showToast('Rekening berhasil diperbarui di database.', 'success');
          return true;
        } else {
          showToast(res?.error || 'Gagal memperbarui rekening di database.', 'error');
          return false;
        }
      } catch (err: any) {
        showToast(err?.message || 'Gagal menghubungi database.', 'error');
        return false;
      }
    },
    [accounts, user?.id, showToast]
  );

  const deleteAccount = useCallback(
    async (id: string): Promise<boolean> => {
      if (!user?.id) {
        showToast('Silakan masuk ke akun Anda terlebih dahulu.', 'error');
        return false;
      }

      try {
        const res = await pushCloudMutation('deleteAccount', user.id, { id });
        if (res?.success) {
          setAccounts((prev) => prev.filter((a) => a.id !== id));
          showToast('Rekening berhasil dihapus dari database.', 'success');
          return true;
        } else {
          showToast(res?.error || 'Gagal menghapus rekening dari database.', 'error');
          return false;
        }
      } catch (err: any) {
        showToast(err?.message || 'Gagal menghubungi database.', 'error');
        return false;
      }
    },
    [user?.id, showToast]
  );

  // Category Management with Direct Database Persist
  const addCategory = useCallback(
    async (data: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> => {
      if (!user?.id) {
        showToast('Silakan masuk ke akun Anda terlebih dahulu.', 'error');
        return false;
      }

      const newCat: Category = {
        ...data,
        id: generateId(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      try {
        const res = await pushCloudMutation('upsertCategory', user.id, { data: newCat });
        if (res?.success) {
          const finalCat = (res.category as Category) || newCat;
          setCategories((prev) => [...prev, finalCat]);
          showToast('Kategori berhasil ditambahkan ke database.', 'success');
          return true;
        } else {
          showToast(res?.error || 'Gagal menambahkan kategori ke database.', 'error');
          return false;
        }
      } catch (err: any) {
        showToast(err?.message || 'Gagal menghubungi database.', 'error');
        return false;
      }
    },
    [user?.id, showToast]
  );

  const updateCategory = useCallback(
    async (id: string, data: Partial<Category>): Promise<boolean> => {
      if (!user?.id) {
        showToast('Silakan masuk ke akun Anda terlebih dahulu.', 'error');
        return false;
      }

      const existing = categories.find((c) => c.id === id);
      if (!existing) {
        showToast('Kategori tidak ditemukan.', 'error');
        return false;
      }

      const updatedCat: Category = {
        ...existing,
        ...data,
        updated_at: new Date().toISOString(),
      };

      try {
        const res = await pushCloudMutation('upsertCategory', user.id, { data: updatedCat });
        if (res?.success) {
          const finalCat = (res.category as Category) || updatedCat;
          setCategories((prev) => prev.map((c) => (c.id === id ? finalCat : c)));
          showToast('Kategori berhasil diperbarui di database.', 'success');
          return true;
        } else {
          showToast(res?.error || 'Gagal memperbarui kategori di database.', 'error');
          return false;
        }
      } catch (err: any) {
        showToast(err?.message || 'Gagal menghubungi database.', 'error');
        return false;
      }
    },
    [categories, user?.id, showToast]
  );

  const deleteCategory = useCallback(
    async (id: string): Promise<boolean> => {
      if (!user?.id) {
        showToast('Silakan masuk ke akun Anda terlebih dahulu.', 'error');
        return false;
      }

      try {
        const res = await pushCloudMutation('deleteCategory', user.id, { id });
        if (res?.success) {
          setCategories((prev) => prev.filter((c) => c.id !== id));
          showToast('Kategori berhasil dihapus dari database.', 'success');
          return true;
        } else {
          showToast(res?.error || 'Gagal menghapus kategori dari database.', 'error');
          return false;
        }
      } catch (err: any) {
        showToast(err?.message || 'Gagal menghubungi database.', 'error');
        return false;
      }
    },
    [user?.id, showToast]
  );

  // Budget Management with Direct Database Persist
  const addBudget = useCallback(
    async (data: Omit<Budget, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> => {
      if (!user?.id) {
        showToast('Silakan masuk ke akun Anda terlebih dahulu.', 'error');
        return false;
      }

      const existing = budgets.find(
        (b) => b.category_id === data.category_id && b.month === data.month
      );

      if (existing) {
        const updated: Budget = { ...existing, amount: data.amount, updated_at: new Date().toISOString() };
        try {
          const res = await pushCloudMutation('upsertBudget', user.id, { data: updated });
          if (res?.success) {
            const finalBgt = (res.budget as Budget) || updated;
            setBudgets((prev) => prev.map((b) => (b.id === existing.id ? finalBgt : b)));
            showToast('Anggaran berhasil diperbarui di database.', 'success');
            return true;
          } else {
            showToast(res?.error || 'Gagal memperbarui anggaran di database.', 'error');
            return false;
          }
        } catch (err: any) {
          showToast(err?.message || 'Gagal menghubungi database.', 'error');
          return false;
        }
      }

      const newBudget: Budget = {
        ...data,
        id: generateId(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      try {
        const res = await pushCloudMutation('upsertBudget', user.id, { data: newBudget });
        if (res?.success) {
          const finalBgt = (res.budget as Budget) || newBudget;
          setBudgets((prev) => [...prev, finalBgt]);
          showToast('Anggaran berhasil ditambahkan ke database.', 'success');
          return true;
        } else {
          showToast(res?.error || 'Gagal menambahkan anggaran ke database.', 'error');
          return false;
        }
      } catch (err: any) {
        showToast(err?.message || 'Gagal menghubungi database.', 'error');
        return false;
      }
    },
    [budgets, user?.id, showToast]
  );

  const updateBudget = useCallback(
    async (id: string, data: Partial<Budget>): Promise<boolean> => {
      if (!user?.id) {
        showToast('Silakan masuk ke akun Anda terlebih dahulu.', 'error');
        return false;
      }

      const existing = budgets.find((b) => b.id === id);
      if (!existing) {
        showToast('Anggaran tidak ditemukan.', 'error');
        return false;
      }

      const updatedBudget: Budget = {
        ...existing,
        ...data,
        updated_at: new Date().toISOString(),
      };

      try {
        const res = await pushCloudMutation('upsertBudget', user.id, { data: updatedBudget });
        if (res?.success) {
          const finalBgt = (res.budget as Budget) || updatedBudget;
          setBudgets((prev) => prev.map((b) => (b.id === id ? finalBgt : b)));
          showToast('Anggaran berhasil diperbarui di database.', 'success');
          return true;
        } else {
          showToast(res?.error || 'Gagal memperbarui anggaran di database.', 'error');
          return false;
        }
      } catch (err: any) {
        showToast(err?.message || 'Gagal menghubungi database.', 'error');
        return false;
      }
    },
    [budgets, user?.id, showToast]
  );

  const deleteBudget = useCallback(
    async (id: string): Promise<boolean> => {
      if (!user?.id) {
        showToast('Silakan masuk ke akun Anda terlebih dahulu.', 'error');
        return false;
      }

      try {
        const res = await pushCloudMutation('deleteBudget', user.id, { id });
        if (res?.success) {
          setBudgets((prev) => prev.filter((b) => b.id !== id));
          showToast('Anggaran berhasil dihapus dari database.', 'success');
          return true;
        } else {
          showToast(res?.error || 'Gagal menghapus anggaran dari database.', 'error');
          return false;
        }
      } catch (err: any) {
        showToast(err?.message || 'Gagal menghubungi database.', 'error');
        return false;
      }
    },
    [user?.id, showToast]
  );

  // Goal Management with Direct Database Persist
  const addGoal = useCallback(
    async (data: Omit<Goal, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> => {
      if (!user?.id) {
        showToast('Silakan masuk ke akun Anda terlebih dahulu.', 'error');
        return false;
      }

      const newGoal: Goal = {
        ...data,
        id: generateId(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      try {
        const res = await pushCloudMutation('upsertGoal', user.id, { data: newGoal });
        if (res?.success) {
          const finalGoal = (res.goal as Goal) || newGoal;
          setGoals((prev) => [...prev, finalGoal]);
          showToast('Target tabungan berhasil ditambahkan ke database.', 'success');
          return true;
        } else {
          showToast(res?.error || 'Gagal menambahkan target tabungan ke database.', 'error');
          return false;
        }
      } catch (err: any) {
        showToast(err?.message || 'Gagal menghubungi database.', 'error');
        return false;
      }
    },
    [user?.id, showToast]
  );

  const updateGoal = useCallback(
    async (id: string, data: Partial<Goal>): Promise<boolean> => {
      if (!user?.id) {
        showToast('Silakan masuk ke akun Anda terlebih dahulu.', 'error');
        return false;
      }

      const existing = goals.find((g) => g.id === id);
      if (!existing) {
        showToast('Target tabungan tidak ditemukan.', 'error');
        return false;
      }

      const updatedGoal: Goal = {
        ...existing,
        ...data,
        updated_at: new Date().toISOString(),
      };

      try {
        const res = await pushCloudMutation('upsertGoal', user.id, { data: updatedGoal });
        if (res?.success) {
          const finalGoal = (res.goal as Goal) || updatedGoal;
          setGoals((prev) => prev.map((g) => (g.id === id ? finalGoal : g)));
          showToast('Target tabungan berhasil diperbarui di database.', 'success');
          return true;
        } else {
          showToast(res?.error || 'Gagal memperbarui target tabungan di database.', 'error');
          return false;
        }
      } catch (err: any) {
        showToast(err?.message || 'Gagal menghubungi database.', 'error');
        return false;
      }
    },
    [goals, user?.id, showToast]
  );

  const contributeGoal = useCallback(
    async (id: string, amount: number, accountId?: string): Promise<boolean> => {
      if (amount <= 0) {
        showToast('Jumlah setor harus lebih besar dari nol.', 'error');
        return false;
      }

      if (!user?.id) {
        showToast('Silakan masuk ke akun Anda terlebih dahulu.', 'error');
        return false;
      }

      const existingGoal = goals.find((g) => g.id === id);
      if (!existingGoal) {
        showToast('Target tabungan tidak ditemukan.', 'error');
        return false;
      }

      let newTx: Transaction | null = null;
      if (accountId) {
        const sourceAcc = accounts.find((a) => a.id === accountId);
        if (sourceAcc) {
          const balance = calculateAccountBalance(sourceAcc, transactions);
          if (balance < amount) {
            showToast(`Saldo ${sourceAcc.name} tidak mencukupi untuk setor tabungan.`, 'error');
            return false;
          }

          const investCat = categories.find((c) => c.name.toLowerCase().includes('investasi'))?.id;

          newTx = {
            id: generateId(),
            type: 'expense',
            amount,
            account_id: accountId,
            category_id: investCat || undefined,
            description: `Setor Target Tabungan: ${existingGoal.name}`,
            date: new Date().toISOString().split('T')[0],
            notes: 'Setoran ke target tabungan',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
        }
      }

      const updatedGoal: Goal = {
        ...existingGoal,
        current_amount: existingGoal.current_amount + amount,
        updated_at: new Date().toISOString(),
      };

      try {
        if (newTx) {
          const txRes = await pushCloudMutation('upsertTransaction', user.id, { data: newTx });
          if (txRes?.success) {
            const finalTx = (txRes.transaction as Transaction) || newTx;
            setTransactions((prev) => [finalTx, ...prev]);
          }
        }

        const goalRes = await pushCloudMutation('upsertGoal', user.id, { data: updatedGoal });
        if (goalRes?.success) {
          const finalGoal = (goalRes.goal as Goal) || updatedGoal;
          setGoals((prev) => prev.map((g) => (g.id === id ? finalGoal : g)));
          showToast('Setoran tabungan berhasil dicatat di database!', 'success');
          return true;
        } else {
          showToast(goalRes?.error || 'Gagal menyimpan setoran tabungan ke database.', 'error');
          return false;
        }
      } catch (err: any) {
        showToast(err?.message || 'Gagal menghubungi database.', 'error');
        return false;
      }
    },
    [goals, accounts, categories, transactions, user?.id, showToast]
  );

  const deleteGoal = useCallback(
    async (id: string): Promise<boolean> => {
      if (!user?.id) {
        showToast('Silakan masuk ke akun Anda terlebih dahulu.', 'error');
        return false;
      }

      try {
        const res = await pushCloudMutation('deleteGoal', user.id, { id });
        if (res?.success) {
          setGoals((prev) => prev.filter((g) => g.id !== id));
          showToast('Target tabungan berhasil dihapus dari database.', 'success');
          return true;
        } else {
          showToast(res?.error || 'Gagal menghapus target tabungan dari database.', 'error');
          return false;
        }
      } catch (err: any) {
        showToast(err?.message || 'Gagal menghubungi database.', 'error');
        return false;
      }
    },
    [user?.id, showToast]
  );

  // Debts & Receivables Management with Direct Database Persist
  const addDebt = useCallback(
    async (
      data: Omit<Debt, 'id' | 'created_at' | 'updated_at' | 'paid_amount' | 'payments'>,
      syncInitialTransaction: boolean = false
    ): Promise<boolean> => {
      if (!user?.id) {
        showToast('Silakan masuk ke akun Anda terlebih dahulu.', 'error');
        return false;
      }

      const now = new Date().toISOString();
      const newDebtId = generateId();
      const newDebt: Debt = {
        ...data,
        id: newDebtId,
        paid_amount: 0,
        payments: [],
        created_at: now,
        updated_at: now,
      };

      try {
        if (syncInitialTransaction && data.account_id && data.total_amount > 0) {
          const sourceAcc = accounts.find((a) => a.id === data.account_id);
          if (sourceAcc) {
            const isReceivable = data.type === 'receivable';
            const cat = categories.find((c) =>
              isReceivable ? c.name.toLowerCase().includes('lainnya') : c.name.toLowerCase().includes('gaji')
            )?.id;

            const newTx: Transaction = {
              id: generateId(),
              type: isReceivable ? 'expense' : 'income',
              amount: data.total_amount,
              account_id: data.account_id,
              category_id: cat || undefined,
              description: isReceivable
                ? `Pinjaman Diberikan: ${data.person_name}`
                : `Pinjaman Diterima: ${data.person_name}`,
              date: now.split('T')[0],
              notes: data.notes || (isReceivable ? 'Pencatatan piutang baru' : 'Pencatatan utang baru'),
              created_at: now,
              updated_at: now,
            };

            const txRes = await pushCloudMutation('upsertTransaction', user.id, { data: newTx });
            if (txRes?.success) {
              const finalTx = (txRes.transaction as Transaction) || newTx;
              setTransactions((prev) => [finalTx, ...prev]);
            }
          }
        }

        const res = await pushCloudMutation('upsertDebt', user.id, { data: newDebt });
        if (res?.success) {
          const finalDebt = (res.debt as Debt) || newDebt;
          setDebts((prev) => [finalDebt, ...prev]);
          showToast(
            data.type === 'receivable'
              ? 'Catatan piutang berhasil ditambahkan ke database.'
              : 'Catatan utang berhasil ditambahkan ke database.',
            'success'
          );
          return true;
        } else {
          showToast(res?.error || 'Gagal menambahkan utang/piutang ke database.', 'error');
          return false;
        }
      } catch (err: any) {
        showToast(err?.message || 'Gagal menghubungi database.', 'error');
        return false;
      }
    },
    [accounts, categories, user?.id, showToast]
  );

  const updateDebt = useCallback(
    async (id: string, data: Partial<Debt>): Promise<boolean> => {
      if (!user?.id) {
        showToast('Silakan masuk ke akun Anda terlebih dahulu.', 'error');
        return false;
      }

      const existing = debts.find((d) => d.id === id);
      if (!existing) {
        showToast('Catatan tidak ditemukan.', 'error');
        return false;
      }

      const updatedDebt: Debt = { ...existing, ...data, updated_at: new Date().toISOString() };

      try {
        const res = await pushCloudMutation('upsertDebt', user.id, { data: updatedDebt });
        if (res?.success) {
          const finalDebt = (res.debt as Debt) || updatedDebt;
          setDebts((prev) => prev.map((d) => (d.id === id ? finalDebt : d)));
          showToast('Catatan berhasil diperbarui di database.', 'success');
          return true;
        } else {
          showToast(res?.error || 'Gagal memperbarui catatan di database.', 'error');
          return false;
        }
      } catch (err: any) {
        showToast(err?.message || 'Gagal menghubungi database.', 'error');
        return false;
      }
    },
    [debts, user?.id, showToast]
  );

  const deleteDebt = useCallback(
    async (id: string): Promise<boolean> => {
      if (!user?.id) {
        showToast('Silakan masuk ke akun Anda terlebih dahulu.', 'error');
        return false;
      }

      try {
        const res = await pushCloudMutation('deleteDebt', user.id, { id });
        if (res?.success) {
          setDebts((prev) => prev.filter((d) => d.id !== id));
          showToast('Catatan berhasil dihapus dari database.', 'success');
          return true;
        } else {
          showToast(res?.error || 'Gagal menghapus catatan dari database.', 'error');
          return false;
        }
      } catch (err: any) {
        showToast(err?.message || 'Gagal menghubungi database.', 'error');
        return false;
      }
    },
    [user?.id, showToast]
  );

  const recordDebtPayment = useCallback(
    async (
      debtId: string,
      amount: number,
      paymentDate: string,
      accountId?: string | null,
      notes?: string,
      syncWithAccount: boolean = true
    ): Promise<boolean> => {
      const targetDebt = debts.find((d) => d.id === debtId);
      if (!targetDebt) {
        showToast('Catatan utang/piutang tidak ditemukan.', 'error');
        return false;
      }

      if (amount <= 0) {
        showToast('Nominal pembayaran harus lebih besar dari 0.', 'error');
        return false;
      }

      const remaining = targetDebt.total_amount - targetDebt.paid_amount;
      if (amount > remaining) {
        showToast(`Nominal melebihi sisa tagihan (${formatRupiah(remaining)}).`, 'error');
        return false;
      }

      if (!user?.id) {
        showToast('Silakan masuk ke akun Anda terlebih dahulu.', 'error');
        return false;
      }

      const now = new Date().toISOString();
      const newPayment: DebtPayment = {
        id: generateId(),
        debt_id: debtId,
        amount,
        payment_date: paymentDate,
        account_id: accountId,
        notes,
        created_at: now,
      };

      try {
        if (syncWithAccount && accountId) {
          const acc = accounts.find((a) => a.id === accountId);
          if (acc) {
            const isReceivable = targetDebt.type === 'receivable';
            const cat = categories.find((c) =>
              isReceivable ? c.name.toLowerCase().includes('investasi') : c.name.toLowerCase().includes('tagihan')
            )?.id;

            const newTx: Transaction = {
              id: generateId(),
              type: isReceivable ? 'income' : 'expense',
              amount,
              account_id: accountId,
              category_id: cat || undefined,
              description: isReceivable
                ? `Pelunasan Piutang: ${targetDebt.person_name}`
                : `Pembayaran Utang: ${targetDebt.person_name}`,
              date: paymentDate,
              notes: notes || `Cicilan/Pelunasan ${isReceivable ? 'piutang' : 'utang'}`,
              created_at: now,
              updated_at: now,
            };

            const txRes = await pushCloudMutation('upsertTransaction', user.id, { data: newTx });
            if (txRes?.success) {
              const finalTx = (txRes.transaction as Transaction) || newTx;
              setTransactions((prev) => [finalTx, ...prev]);
            }
          }
        }

        const res = await pushCloudMutation('recordDebtPayment', user.id, { debtId, payment: newPayment });
        if (res?.success) {
          const finalDebt = res.debt as Debt;
          if (finalDebt) {
            setDebts((prev) => prev.map((d) => (d.id === debtId ? finalDebt : d)));
          } else {
            setDebts((prev) =>
              prev.map((d) => {
                if (d.id === debtId) {
                  return {
                    ...d,
                    paid_amount: d.paid_amount + amount,
                    payments: [newPayment, ...(d.payments || [])],
                    updated_at: now,
                  };
                }
                return d;
              })
            );
          }
          const isFullyPaid = targetDebt.paid_amount + amount >= targetDebt.total_amount;
          showToast(
            isFullyPaid
              ? `Selamat! Tagihan ${targetDebt.person_name} telah lunas di database.`
              : `Pembayaran ${formatRupiah(amount)} berhasil dicatat di database.`,
            'success'
          );
          return true;
        } else {
          showToast(res?.error || 'Gagal mencatat pembayaran di database.', 'error');
          return false;
        }
      } catch (err: any) {
        showToast(err?.message || 'Gagal menghubungi database.', 'error');
        return false;
      }
    },
    [debts, accounts, categories, user?.id, showToast]
  );

  const updateUser = useCallback((profile: Partial<UserProfile>) => {
    setUser((prev) => (prev ? { ...prev, ...profile } : null));
    if (profile.theme) {
      setThemeState(profile.theme);
    }
    if (profile.fontSize) {
      setFontSizeState(profile.fontSize);
      try {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}_fontSize`, profile.fontSize);
      } catch (e) {
        console.warn('Failed to save fontSize to localStorage:', e);
      }
    }
  }, []);

  const resetAllFinancialData = useCallback(() => {
    setAccounts([]);
    setTransactions([]);
    setBudgets([]);
    setGoals([]);
    setDebts([]);
    showToast('Seluruh mutasi transaksi, rekening, dan utang-piutang telah dibersihkan di memori.', 'info');
  }, [showToast]);

  const resetToDemoData = resetAllFinancialData;

  const loginUser = useCallback(
    (email: string, name?: string) => {
      const cleanUser: UserProfile = {
        id: generateId(),
        name: name?.trim() || email.split('@')[0],
        email: email.trim(),
        provider: 'email',
        currency: 'IDR',
        timezone: 'Asia/Jakarta',
        theme: 'system',
        fontSize: 'normal',
      };

      setUser(cleanUser);
      setAccounts([]);
      setTransactions([]);
      setBudgets([]);
      setGoals([]);
      setDebts([]);
      try {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}_user`, JSON.stringify(cleanUser));
      } catch (e) {
        console.warn('Failed to save clean session to localStorage:', e);
      }
    },
    []
  );

  const registerUser = useCallback((name: string, email: string) => {
    const cleanUser: UserProfile = {
      id: generateId(),
      name: name.trim(),
      email: email.trim(),
      provider: 'email',
      currency: 'IDR',
      timezone: 'Asia/Jakarta',
      theme: 'system',
      fontSize: 'normal',
    };

    setUser(cleanUser);
    setAccounts([]);
    setTransactions([]);
    setBudgets([]);
    setGoals([]);
    setDebts([]);
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}_user`, JSON.stringify(cleanUser));
    } catch (e) {
      console.warn('Failed to save register session to localStorage:', e);
    }
  }, []);

  const setCleanUserSession = useCallback((
    profile: UserProfile,
    initialAccounts?: Account[],
    initialCategories?: Category[],
    initialTransactions?: Transaction[],
    initialBudgets?: Budget[],
    initialGoals?: Goal[],
    initialDebts?: Debt[]
  ) => {
    setUser(profile);
    const accs = Array.isArray(initialAccounts) ? initialAccounts : [];
    const cats = Array.isArray(initialCategories) && initialCategories.length > 0 ? initialCategories : INITIAL_CATEGORIES;
    const txs = Array.isArray(initialTransactions) ? initialTransactions : [];
    const bgts = Array.isArray(initialBudgets) ? initialBudgets : [];
    const gls = Array.isArray(initialGoals) ? initialGoals : [];
    const dbts = Array.isArray(initialDebts) ? initialDebts : [];

    setAccounts(accs);
    setCategories(cats);
    setTransactions(txs);
    setBudgets(bgts);
    setGoals(gls);
    setDebts(dbts);

    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}_user`, JSON.stringify(profile));
    } catch (e) {
      console.warn('Failed to save session to localStorage:', e);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await signOutSupabase();
    } catch (e) {
      console.error('Logout error:', e);
    }
    setUser(null);
    setAccounts([]);
    setTransactions([]);
    setBudgets([]);
    setGoals([]);
    setDebts([]);
    try {
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}_user`);
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}_transactions`);
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}_budgets`);
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}_goals`);
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}_debts`);
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}_accounts`);
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}_categories`);
    } catch (e) {
      console.warn('Failed to clear user from localStorage:', e);
    }
    showToast('Berhasil keluar dari akun.', 'info');
  }, [showToast]);

  const syncToCloud = useCallback(async (): Promise<boolean> => {
    if (!user?.id || !user.id.includes('-')) {
      showToast('Silakan masuk ke akun Anda terlebih dahulu untuk menyinkronkan data.', 'error');
      return false;
    }

    setIsSyncing(true);
    showToast('Sedang menyinkronkan data ke database cloud Supabase...', 'info');

    try {
      const result = await batchSyncLocalData(user.id, {
        accounts,
        categories,
        transactions,
        budgets,
        goals,
        debts,
      });

      if (result && result.success) {
        if (result.accounts) setAccounts(result.accounts);
        if (result.categories && result.categories.length > 0) setCategories(result.categories);
        if (result.transactions) setTransactions(result.transactions);
        if (result.budgets) setBudgets(result.budgets);
        if (result.goals) setGoals(result.goals);
        if (result.debts) setDebts(result.debts);
        showToast('Sinkronisasi ke database cloud Supabase berhasil!', 'success');
        return true;
      } else {
        showToast('Sinkronisasi data gagal. Silakan coba sesaat lagi.', 'error');
        return false;
      }
    } catch (e) {
      console.error('syncToCloud error:', e);
      showToast('Terjadi kesalahan saat menyinkronkan data ke cloud.', 'error');
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, [user?.id, accounts, categories, transactions, budgets, goals, debts, showToast]);

  return (
    <DompetKuContext.Provider
      value={{
        user,
        accounts,
        categories,
        transactions,
        budgets,
        goals,
        isClient,
        activeMonth,
        setActiveMonth,
        theme,
        isDarkMode,
        setTheme,
        toggleTheme,
        isPrivacyMode,
        togglePrivacyMode,
        setPrivacyMode,
        formatAmount,
        fontSize,
        setFontSize,
        isTransactionModalOpen,
        transactionModalInitialType,
        transactionToEdit,
        transactionModalInitialDate,
        openTransactionModal,
        closeTransactionModal,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addAccount,
        updateAccount,
        deleteAccount,
        addCategory,
        updateCategory,
        deleteCategory,
        addBudget,
        updateBudget,
        deleteBudget,
        addGoal,
        updateGoal,
        contributeGoal,
        deleteGoal,
        debts,
        addDebt,
        updateDebt,
        deleteDebt,
        recordDebtPayment,
        loginUser,
        registerUser,
        setCleanUserSession,
        updateUser,
        resetAllFinancialData,
        resetToDemoData,
        logout,
        syncToCloud,
        isSyncing,
        toasts,
        showToast,
        removeToast,
      }}
    >
      {children}
    </DompetKuContext.Provider>
  );
}

export function useDompetKu() {
  const context = useContext(DompetKuContext);
  if (!context) {
    throw new Error('useDompetKu must be used within a DompetKuProvider');
  }
  return context;
}
