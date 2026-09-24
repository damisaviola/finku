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

  // Actions
  addTransaction: (data: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>) => boolean;
  updateTransaction: (id: string, data: Partial<Transaction>) => boolean;
  deleteTransaction: (id: string) => boolean;

  addAccount: (data: Omit<Account, 'id' | 'created_at' | 'updated_at'>) => boolean;
  updateAccount: (id: string, data: Partial<Account>) => boolean;
  deleteAccount: (id: string) => boolean;

  addCategory: (data: Omit<Category, 'id' | 'created_at' | 'updated_at'>) => boolean;
  updateCategory: (id: string, data: Partial<Category>) => boolean;
  deleteCategory: (id: string) => boolean;

  addBudget: (data: Omit<Budget, 'id' | 'created_at' | 'updated_at'>) => boolean;
  updateBudget: (id: string, data: Partial<Budget>) => boolean;
  deleteBudget: (id: string) => boolean;

  addGoal: (data: Omit<Goal, 'id' | 'created_at' | 'updated_at'>) => boolean;
  updateGoal: (id: string, data: Partial<Goal>) => boolean;
  contributeGoal: (id: string, amount: number, accountId?: string) => boolean;
  deleteGoal: (id: string) => boolean;

  // Debt & Receivable Management
  debts: Debt[];
  addDebt: (data: Omit<Debt, 'id' | 'created_at' | 'updated_at' | 'paid_amount' | 'payments'>, syncInitialTransaction?: boolean) => boolean;
  updateDebt: (id: string, data: Partial<Debt>) => boolean;
  deleteDebt: (id: string) => boolean;
  recordDebtPayment: (
    debtId: string,
    amount: number,
    paymentDate: string,
    accountId?: string | null,
    notes?: string,
    syncWithAccount?: boolean
  ) => boolean;

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

  // Load from localStorage on client mount & sync from cloud in background
  useEffect(() => {
    setIsClient(true);
    try {
      const savedUser = localStorage.getItem(`${STORAGE_KEY_PREFIX}_user`);
      if (savedUser && savedUser !== 'null' && savedUser !== 'undefined') {
        const parsedUser = JSON.parse(savedUser);
        if (parsedUser && typeof parsedUser === 'object') {
          setUser(parsedUser);
          if (parsedUser.theme) setThemeState(parsedUser.theme);

          let parsedAccounts: Account[] = [];
          const savedAccounts = localStorage.getItem(`${STORAGE_KEY_PREFIX}_accounts`);
          if (savedAccounts && savedAccounts !== 'null' && savedAccounts !== 'undefined') {
            const parsed = JSON.parse(savedAccounts);
            if (Array.isArray(parsed)) {
              parsedAccounts = parsed;
              setAccounts(parsed);
            }
          }

          let parsedCategories: Category[] = [];
          const savedCategories = localStorage.getItem(`${STORAGE_KEY_PREFIX}_categories`);
          if (savedCategories && savedCategories !== 'null' && savedCategories !== 'undefined') {
            const parsed = JSON.parse(savedCategories);
            if (Array.isArray(parsed)) {
              parsedCategories = parsed;
              setCategories(parsed);
            }
          }

          let parsedTransactions: Transaction[] = [];
          const savedTransactions = localStorage.getItem(`${STORAGE_KEY_PREFIX}_transactions`);
          if (savedTransactions && savedTransactions !== 'null' && savedTransactions !== 'undefined') {
            const parsed = JSON.parse(savedTransactions);
            if (Array.isArray(parsed)) {
              parsedTransactions = parsed;
              setTransactions(parsed);
            }
          }

          let parsedBudgets: Budget[] = [];
          const savedBudgets = localStorage.getItem(`${STORAGE_KEY_PREFIX}_budgets`);
          if (savedBudgets && savedBudgets !== 'null' && savedBudgets !== 'undefined') {
            const parsed = JSON.parse(savedBudgets);
            if (Array.isArray(parsed)) {
              parsedBudgets = parsed;
              setBudgets(parsed);
            }
          }

          let parsedGoals: Goal[] = [];
          const savedGoals = localStorage.getItem(`${STORAGE_KEY_PREFIX}_goals`);
          if (savedGoals && savedGoals !== 'null' && savedGoals !== 'undefined') {
            const parsed = JSON.parse(savedGoals);
            if (Array.isArray(parsed)) {
              parsedGoals = parsed;
              setGoals(parsed);
            }
          }

          let cleanDebts: Debt[] = [];
          const savedDebts = localStorage.getItem(`${STORAGE_KEY_PREFIX}_debts`);
          if (savedDebts && savedDebts !== 'null' && savedDebts !== 'undefined') {
            const parsed = JSON.parse(savedDebts);
            if (Array.isArray(parsed)) {
              cleanDebts = parsed.filter(
                (d: Debt) => !['debt-rec-1', 'debt-rec-2', 'debt-pay-1', 'debt-pay-2'].includes(d.id)
              );
              setDebts(cleanDebts);
            }
          } else {
            setDebts([]);
          }

          // Asynchronously pull cloud data if user is logged in
          if (parsedUser.id && parsedUser.id.includes('-')) {
            pullUserCloudData(
              parsedUser.id,
              parsedUser.email,
              parsedUser.name,
              parsedUser.avatar_url
            ).then((cloud) => {
              if (cloud && cloud.success) {
                const cloudHasTransactions = Array.isArray(cloud.transactions) && cloud.transactions.length > 0;
                const cloudHasAccounts = Array.isArray(cloud.accounts) && cloud.accounts.length > 0;
                const localHasTransactions = parsedTransactions.length > 0;
                const localHasAccounts = parsedAccounts.length > 0;

                // Jika di cloud transaksi masih kosong tetapi pengguna sudah punya transaksi/rekening di browser lokal,
                // otomatis jalankan batch migration ke database cloud Supabase!
                if (!cloudHasTransactions && (localHasTransactions || localHasAccounts)) {
                  console.log('🔄 Mendeteksi data lokal yang belum ada di cloud. Memulai sinkronisasi otomatis ke Supabase...');
                  batchSyncLocalData(parsedUser.id, {
                    accounts: parsedAccounts,
                    categories: parsedCategories,
                    transactions: parsedTransactions,
                    budgets: parsedBudgets,
                    goals: parsedGoals,
                    debts: cleanDebts,
                  }).then((synced) => {
                    if (synced && synced.success) {
                      if (synced.accounts) setAccounts(synced.accounts);
                      if (synced.categories && synced.categories.length > 0) setCategories(synced.categories);
                      if (synced.transactions) setTransactions(synced.transactions);
                      if (synced.budgets) setBudgets(synced.budgets);
                      if (synced.goals) setGoals(synced.goals);
                      if (synced.debts) setDebts(synced.debts);
                      console.log('✅ Berhasil migrasi seluruh data lokal ke database Supabase.');
                    }
                  }).catch(console.warn);
                } else {
                  if (cloud.accounts) setAccounts(cloud.accounts);
                  if (cloud.categories && cloud.categories.length > 0) setCategories(cloud.categories);
                  if (cloud.transactions) setTransactions(cloud.transactions);
                  if (cloud.budgets) setBudgets(cloud.budgets);
                  if (cloud.goals) setGoals(cloud.goals);
                  if (cloud.debts) setDebts(cloud.debts);
                }
              }
            }).catch(console.warn);
          }
        }
      } else {
        // Unauthenticated visitor: start with clean slate
        setUser(null);
        setAccounts([]);
        setTransactions([]);
        setBudgets([]);
        setGoals([]);
        setDebts([]);
      }

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
      console.warn('Failed to parse localStorage data:', e);
    }
  }, []);

  // Sync to localStorage
  useEffect(() => {
    if (!isClient) return;
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}_accounts`, JSON.stringify(accounts));
      localStorage.setItem(`${STORAGE_KEY_PREFIX}_categories`, JSON.stringify(categories));
      localStorage.setItem(`${STORAGE_KEY_PREFIX}_transactions`, JSON.stringify(transactions));
      localStorage.setItem(`${STORAGE_KEY_PREFIX}_budgets`, JSON.stringify(budgets));
      localStorage.setItem(`${STORAGE_KEY_PREFIX}_goals`, JSON.stringify(goals));
      localStorage.setItem(`${STORAGE_KEY_PREFIX}_debts`, JSON.stringify(debts));
      if (user) {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}_user`, JSON.stringify(user));
      } else {
        localStorage.removeItem(`${STORAGE_KEY_PREFIX}_user`);
      }
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }
  }, [isClient, accounts, categories, transactions, budgets, goals, debts, user]);

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

  // Transaction Management with Balance Verification (PRD Section 52)
  const addTransaction = useCallback(
    (data: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>): boolean => {
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

      const newTx: Transaction = {
        ...data,
        id: generateId(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setTransactions((prev) => [newTx, ...prev]);
      if (user?.id) {
        pushCloudMutation('upsertTransaction', user.id, { data: newTx }).catch(console.warn);
      }
      showToast('Transaksi berhasil ditambahkan.', 'success');
      return true;
    },
    [accounts, transactions, user?.id, showToast]
  );

  const updateTransaction = useCallback(
    (id: string, data: Partial<Transaction>): boolean => {
      let updatedTx: Transaction | null = null;
      setTransactions((prev) =>
        prev.map((t) => {
          if (t.id === id) {
            updatedTx = { ...t, ...data, updated_at: new Date().toISOString() };
            return updatedTx;
          }
          return t;
        })
      );
      if (user?.id && updatedTx) {
        pushCloudMutation('upsertTransaction', user.id, { data: updatedTx }).catch(console.warn);
      }
      showToast('Transaksi berhasil diperbarui.', 'success');
      return true;
    },
    [user?.id, showToast]
  );

  const deleteTransaction = useCallback(
    (id: string): boolean => {
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      if (user?.id) {
        pushCloudMutation('deleteTransaction', user.id, { id }).catch(console.warn);
      }
      showToast('Transaksi berhasil dihapus.', 'success');
      return true;
    },
    [user?.id, showToast]
  );

  // Account Management
  const addAccount = useCallback(
    (data: Omit<Account, 'id' | 'created_at' | 'updated_at'>): boolean => {
      const newAccount: Account = {
        ...data,
        id: generateId(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setAccounts((prev) => [...prev, newAccount]);
      if (user?.id) {
        pushCloudMutation('upsertAccount', user.id, { data: newAccount }).catch(console.warn);
      }
      showToast('Rekening berhasil ditambahkan.', 'success');
      return true;
    },
    [user?.id, showToast]
  );

  const updateAccount = useCallback(
    (id: string, data: Partial<Account>): boolean => {
      let updatedAccount: Account | null = null;
      setAccounts((prev) =>
        prev.map((a) => {
          if (a.id === id) {
            updatedAccount = { ...a, ...data, updated_at: new Date().toISOString() };
            return updatedAccount;
          }
          return a;
        })
      );
      if (user?.id && updatedAccount) {
        pushCloudMutation('upsertAccount', user.id, { data: updatedAccount }).catch(console.warn);
      }
      showToast('Rekening berhasil diperbarui.', 'success');
      return true;
    },
    [user?.id, showToast]
  );

  const deleteAccount = useCallback(
    (id: string): boolean => {
      setAccounts((prev) => prev.filter((a) => a.id !== id));
      if (user?.id) {
        pushCloudMutation('deleteAccount', user.id, { id }).catch(console.warn);
      }
      showToast('Rekening berhasil dihapus.', 'success');
      return true;
    },
    [user?.id, showToast]
  );

  // Category Management
  const addCategory = useCallback(
    (data: Omit<Category, 'id' | 'created_at' | 'updated_at'>): boolean => {
      const newCat: Category = {
        ...data,
        id: generateId(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setCategories((prev) => [...prev, newCat]);
      if (user?.id) {
        pushCloudMutation('upsertCategory', user.id, { data: newCat }).catch(console.warn);
      }
      showToast('Kategori berhasil ditambahkan.', 'success');
      return true;
    },
    [user?.id, showToast]
  );

  const updateCategory = useCallback(
    (id: string, data: Partial<Category>): boolean => {
      let updatedCat: Category | null = null;
      setCategories((prev) =>
        prev.map((c) => {
          if (c.id === id) {
            updatedCat = { ...c, ...data, updated_at: new Date().toISOString() };
            return updatedCat;
          }
          return c;
        })
      );
      if (user?.id && updatedCat) {
        pushCloudMutation('upsertCategory', user.id, { data: updatedCat }).catch(console.warn);
      }
      showToast('Kategori berhasil diperbarui.', 'success');
      return true;
    },
    [user?.id, showToast]
  );

  const deleteCategory = useCallback(
    (id: string): boolean => {
      setCategories((prev) => prev.filter((c) => c.id !== id));
      if (user?.id) {
        pushCloudMutation('deleteCategory', user.id, { id }).catch(console.warn);
      }
      showToast('Kategori berhasil dihapus.', 'success');
      return true;
    },
    [user?.id, showToast]
  );

  // Budget Management
  const addBudget = useCallback(
    (data: Omit<Budget, 'id' | 'created_at' | 'updated_at'>): boolean => {
      const existing = budgets.find(
        (b) => b.category_id === data.category_id && b.month === data.month
      );

      if (existing) {
        const updated = { ...existing, amount: data.amount, updated_at: new Date().toISOString() };
        setBudgets((prev) =>
          prev.map((b) => (b.id === existing.id ? updated : b))
        );
        if (user?.id) {
          pushCloudMutation('upsertBudget', user.id, { data: updated }).catch(console.warn);
        }
        showToast('Anggaran berhasil diperbarui.', 'success');
        return true;
      }

      const newBudget: Budget = {
        ...data,
        id: generateId(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setBudgets((prev) => [...prev, newBudget]);
      if (user?.id) {
        pushCloudMutation('upsertBudget', user.id, { data: newBudget }).catch(console.warn);
      }
      showToast('Anggaran berhasil diperbarui.', 'success');
      return true;
    },
    [budgets, user?.id, showToast]
  );

  const updateBudget = useCallback(
    (id: string, data: Partial<Budget>): boolean => {
      let updatedBudget: Budget | null = null;
      setBudgets((prev) =>
        prev.map((b) => {
          if (b.id === id) {
            updatedBudget = { ...b, ...data, updated_at: new Date().toISOString() };
            return updatedBudget;
          }
          return b;
        })
      );
      if (user?.id && updatedBudget) {
        pushCloudMutation('upsertBudget', user.id, { data: updatedBudget }).catch(console.warn);
      }
      showToast('Anggaran berhasil diperbarui.', 'success');
      return true;
    },
    [user?.id, showToast]
  );

  const deleteBudget = useCallback(
    (id: string): boolean => {
      setBudgets((prev) => prev.filter((b) => b.id !== id));
      if (user?.id) {
        pushCloudMutation('deleteBudget', user.id, { id }).catch(console.warn);
      }
      showToast('Anggaran berhasil dihapus.', 'success');
      return true;
    },
    [user?.id, showToast]
  );

  // Goal Management
  const addGoal = useCallback(
    (data: Omit<Goal, 'id' | 'created_at' | 'updated_at'>): boolean => {
      const newGoal: Goal = {
        ...data,
        id: generateId(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setGoals((prev) => [...prev, newGoal]);
      if (user?.id) {
        pushCloudMutation('upsertGoal', user.id, { data: newGoal }).catch(console.warn);
      }
      showToast('Target tabungan berhasil ditambahkan.', 'success');
      return true;
    },
    [user?.id, showToast]
  );

  const updateGoal = useCallback(
    (id: string, data: Partial<Goal>): boolean => {
      let updatedGoal: Goal | null = null;
      setGoals((prev) =>
        prev.map((g) => {
          if (g.id === id) {
            updatedGoal = { ...g, ...data, updated_at: new Date().toISOString() };
            return updatedGoal;
          }
          return g;
        })
      );
      if (user?.id && updatedGoal) {
        pushCloudMutation('upsertGoal', user.id, { data: updatedGoal }).catch(console.warn);
      }
      showToast('Target tabungan berhasil diperbarui.', 'success');
      return true;
    },
    [user?.id, showToast]
  );

  const contributeGoal = useCallback(
    (id: string, amount: number, accountId?: string): boolean => {
      if (amount <= 0) {
        showToast('Jumlah setor harus lebih besar dari nol.', 'error');
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
            description: `Setor Target Tabungan`,
            date: new Date().toISOString().split('T')[0],
            notes: 'Setoran ke target tabungan',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          setTransactions((prev) => [newTx!, ...prev]);
          if (user?.id) {
            pushCloudMutation('upsertTransaction', user.id, { data: newTx }).catch(console.warn);
          }
        }
      }

      let updatedGoal: Goal | null = null;
      setGoals((prev) =>
        prev.map((g) => {
          if (g.id === id) {
            updatedGoal = {
              ...g,
              current_amount: g.current_amount + amount,
              updated_at: new Date().toISOString(),
            };
            return updatedGoal;
          }
          return g;
        })
      );

      if (user?.id && updatedGoal) {
        pushCloudMutation('upsertGoal', user.id, { data: updatedGoal }).catch(console.warn);
      }

      showToast('Setoran tabungan berhasil dicatat!', 'success');
      return true;
    },
    [accounts, categories, transactions, user?.id, showToast]
  );

  const deleteGoal = useCallback(
    (id: string): boolean => {
      setGoals((prev) => prev.filter((g) => g.id !== id));
      if (user?.id) {
        pushCloudMutation('deleteGoal', user.id, { id }).catch(console.warn);
      }
      showToast('Target tabungan berhasil dihapus.', 'success');
      return true;
    },
    [user?.id, showToast]
  );

  // Debts & Receivables Management
  const addDebt = useCallback(
    (
      data: Omit<Debt, 'id' | 'created_at' | 'updated_at' | 'paid_amount' | 'payments'>,
      syncInitialTransaction: boolean = false
    ): boolean => {
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
          setTransactions((prev) => [newTx, ...prev]);
          if (user?.id) {
            pushCloudMutation('upsertTransaction', user.id, { data: newTx }).catch(console.warn);
          }
        }
      }

      setDebts((prev) => [newDebt, ...prev]);
      if (user?.id) {
        pushCloudMutation('upsertDebt', user.id, { data: newDebt }).catch(console.warn);
      }
      showToast(
        data.type === 'receivable' ? 'Catatan piutang berhasil ditambahkan.' : 'Catatan utang berhasil ditambahkan.',
        'success'
      );
      return true;
    },
    [accounts, categories, user?.id, showToast]
  );

  const updateDebt = useCallback(
    (id: string, data: Partial<Debt>): boolean => {
      let updatedDebt: Debt | null = null;
      setDebts((prev) =>
        prev.map((d) => {
          if (d.id === id) {
            updatedDebt = { ...d, ...data, updated_at: new Date().toISOString() };
            return updatedDebt;
          }
          return d;
        })
      );
      if (user?.id && updatedDebt) {
        pushCloudMutation('upsertDebt', user.id, { data: updatedDebt }).catch(console.warn);
      }
      showToast('Catatan berhasil diperbarui.', 'success');
      return true;
    },
    [user?.id, showToast]
  );

  const deleteDebt = useCallback(
    (id: string): boolean => {
      setDebts((prev) => prev.filter((d) => d.id !== id));
      if (user?.id) {
        pushCloudMutation('deleteDebt', user.id, { id }).catch(console.warn);
      }
      showToast('Catatan utang/piutang berhasil dihapus.', 'success');
      return true;
    },
    [user?.id, showToast]
  );

  const recordDebtPayment = useCallback(
    (
      debtId: string,
      amount: number,
      paymentDate: string,
      accountId?: string | null,
      notes?: string,
      syncWithAccount: boolean = true
    ): boolean => {
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

      // Sinkronisasi otomatis ke mutasi rekening jika dipilih
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
          setTransactions((prev) => [newTx, ...prev]);
          if (user?.id) {
            pushCloudMutation('upsertTransaction', user.id, { data: newTx }).catch(console.warn);
          }
        }
      }

      setDebts((prev) =>
        prev.map((d) => {
          if (d.id === debtId) {
            const newPaid = d.paid_amount + amount;
            return {
              ...d,
              paid_amount: newPaid,
              payments: [newPayment, ...(d.payments || [])],
              updated_at: now,
            };
          }
          return d;
        })
      );

      if (user?.id) {
        pushCloudMutation('recordDebtPayment', user.id, { debtId, payment: newPayment }).catch(console.warn);
      }

      const isFullyPaid = targetDebt.paid_amount + amount >= targetDebt.total_amount;
      showToast(
        isFullyPaid
          ? `Selamat! Tagihan ${targetDebt.person_name} telah lunas.`
          : `Pembayaran ${formatRupiah(amount)} berhasil dicatat.`,
        'success'
      );
      return true;
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
    setCategories(INITIAL_CATEGORIES);
    setTransactions([]);
    setBudgets([]);
    setGoals([]);
    setDebts([]);
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}_accounts`, JSON.stringify([]));
      localStorage.setItem(`${STORAGE_KEY_PREFIX}_categories`, JSON.stringify(INITIAL_CATEGORIES));
      localStorage.setItem(`${STORAGE_KEY_PREFIX}_transactions`, JSON.stringify([]));
      localStorage.setItem(`${STORAGE_KEY_PREFIX}_budgets`, JSON.stringify([]));
      localStorage.setItem(`${STORAGE_KEY_PREFIX}_goals`, JSON.stringify([]));
      localStorage.setItem(`${STORAGE_KEY_PREFIX}_debts`, JSON.stringify([]));
    } catch (e) {
      console.warn('Failed to reset financial data in localStorage:', e);
    }
    showToast('Seluruh mutasi transaksi, rekening, dan utang-piutang telah dibersihkan.', 'info');
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
        localStorage.setItem(`${STORAGE_KEY_PREFIX}_accounts`, JSON.stringify([]));
        localStorage.setItem(`${STORAGE_KEY_PREFIX}_transactions`, JSON.stringify([]));
        localStorage.setItem(`${STORAGE_KEY_PREFIX}_budgets`, JSON.stringify([]));
        localStorage.setItem(`${STORAGE_KEY_PREFIX}_goals`, JSON.stringify([]));
        localStorage.setItem(`${STORAGE_KEY_PREFIX}_debts`, JSON.stringify([]));
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
      localStorage.setItem(`${STORAGE_KEY_PREFIX}_accounts`, JSON.stringify([]));
      localStorage.setItem(`${STORAGE_KEY_PREFIX}_transactions`, JSON.stringify([]));
      localStorage.setItem(`${STORAGE_KEY_PREFIX}_budgets`, JSON.stringify([]));
      localStorage.setItem(`${STORAGE_KEY_PREFIX}_goals`, JSON.stringify([]));
      localStorage.setItem(`${STORAGE_KEY_PREFIX}_debts`, JSON.stringify([]));
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
      localStorage.setItem(`${STORAGE_KEY_PREFIX}_accounts`, JSON.stringify(accs));
      localStorage.setItem(`${STORAGE_KEY_PREFIX}_categories`, JSON.stringify(cats));
      localStorage.setItem(`${STORAGE_KEY_PREFIX}_transactions`, JSON.stringify(txs));
      localStorage.setItem(`${STORAGE_KEY_PREFIX}_budgets`, JSON.stringify(bgts));
      localStorage.setItem(`${STORAGE_KEY_PREFIX}_goals`, JSON.stringify(gls));
      localStorage.setItem(`${STORAGE_KEY_PREFIX}_debts`, JSON.stringify(dbts));
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
