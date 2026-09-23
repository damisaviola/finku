'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Account, Category, Transaction, Budget, Goal, UserProfile, TransactionType, FontSize } from '@/types';
import {
  INITIAL_ACCOUNTS,
  INITIAL_CATEGORIES,
  INITIAL_TRANSACTIONS,
  INITIAL_BUDGETS,
  INITIAL_GOALS,
} from './mock-data';
import { calculateAccountBalance, validateTransactionBalance } from './calculations/finance';
import { formatRupiah } from './utils/formatters';
import { supabase, isSupabaseConfigured } from './supabase/client';
import { signOutSupabase } from './supabase/auth';

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

  loginUser: (email: string, name?: string) => void;
  registerUser: (name: string, email: string) => void;
  setCleanUserSession: (profile: UserProfile, initialAccounts?: Account[]) => void;

  updateUser: (profile: Partial<UserProfile>) => void;
  resetAllFinancialData: () => void;
  resetToDemoData: () => void;
  logout: () => Promise<void>;

  // Toast
  toasts: ToastItem[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
}

export const DEFAULT_CLEAN_ACCOUNTS: Account[] = [
  {
    id: 'acc-cash-clean',
    name: 'Kas Tunai',
    type: 'Uang Tunai',
    initial_balance: 0,
    currency: 'IDR',
    color: '#10b981',
    icon: 'Banknote',
    is_active: true,
    created_at: '2026-09-01T00:00:00.000Z',
    updated_at: '2026-09-01T00:00:00.000Z',
  },
];

const DompetKuContext = createContext<DompetKuContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'dompetku_data_v1';

export function DompetKuProvider({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [accounts, setAccounts] = useState<Account[]>(DEFAULT_CLEAN_ACCOUNTS);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
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

  // Load from localStorage on client mount
  useEffect(() => {
    setIsClient(true);
    try {
      const savedUser = localStorage.getItem(`${STORAGE_KEY_PREFIX}_user`);
      if (savedUser && savedUser !== 'null' && savedUser !== 'undefined') {
        const parsedUser = JSON.parse(savedUser);
        if (parsedUser && typeof parsedUser === 'object') {
          setUser(parsedUser);
          if (parsedUser.theme) setThemeState(parsedUser.theme);

          const savedAccounts = localStorage.getItem(`${STORAGE_KEY_PREFIX}_accounts`);
          if (savedAccounts && savedAccounts !== 'null' && savedAccounts !== 'undefined') {
            const parsed = JSON.parse(savedAccounts);
            if (Array.isArray(parsed)) setAccounts(parsed);
          }

          const savedCategories = localStorage.getItem(`${STORAGE_KEY_PREFIX}_categories`);
          if (savedCategories && savedCategories !== 'null' && savedCategories !== 'undefined') {
            const parsed = JSON.parse(savedCategories);
            if (Array.isArray(parsed)) setCategories(parsed);
          }

          const savedTransactions = localStorage.getItem(`${STORAGE_KEY_PREFIX}_transactions`);
          if (savedTransactions && savedTransactions !== 'null' && savedTransactions !== 'undefined') {
            const parsed = JSON.parse(savedTransactions);
            if (Array.isArray(parsed)) setTransactions(parsed);
          }

          const savedBudgets = localStorage.getItem(`${STORAGE_KEY_PREFIX}_budgets`);
          if (savedBudgets && savedBudgets !== 'null' && savedBudgets !== 'undefined') {
            const parsed = JSON.parse(savedBudgets);
            if (Array.isArray(parsed)) setBudgets(parsed);
          }

          const savedGoals = localStorage.getItem(`${STORAGE_KEY_PREFIX}_goals`);
          if (savedGoals && savedGoals !== 'null' && savedGoals !== 'undefined') {
            const parsed = JSON.parse(savedGoals);
            if (Array.isArray(parsed)) setGoals(parsed);
          }
        }
      } else {
        // Unauthenticated visitor: start with clean slate
        setUser(null);
        setAccounts(DEFAULT_CLEAN_ACCOUNTS);
        setTransactions([]);
        setBudgets([]);
        setGoals([]);
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
      if (user) {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}_user`, JSON.stringify(user));
      } else {
        localStorage.removeItem(`${STORAGE_KEY_PREFIX}_user`);
      }
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }
  }, [isClient, accounts, categories, transactions, budgets, goals, user]);

  // Listen for Supabase Auth state changes
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const meta = session.user.user_metadata || {};
        const isGoogle = session.user.app_metadata?.provider === 'google' || Boolean(meta.avatar_url?.includes('googleusercontent.com'));
        setUser((prev) => ({
          id: session.user.id,
          name: meta.full_name || meta.name || session.user.email?.split('@')[0] || 'Pengguna DompetKu',
          email: session.user.email || '',
          avatar_url: meta.avatar_url || meta.picture || prev?.avatar_url,
          provider: isGoogle ? 'google' : (prev?.provider || 'email'),
          currency: prev?.currency || 'IDR',
          timezone: prev?.timezone || 'Asia/Jakarta',
          theme: prev?.theme || 'system',
          fontSize: prev?.fontSize || 'normal',
        }));
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const meta = session.user.user_metadata || {};
        const isGoogle = session.user.app_metadata?.provider === 'google' || Boolean(meta.avatar_url?.includes('googleusercontent.com'));
        setUser((prev) => ({
          id: session.user.id,
          name: meta.full_name || meta.name || session.user.email?.split('@')[0] || 'Pengguna DompetKu',
          email: session.user.email || '',
          avatar_url: meta.avatar_url || meta.picture || prev?.avatar_url,
          provider: isGoogle ? 'google' : (prev?.provider || 'email'),
          currency: prev?.currency || 'IDR',
          timezone: prev?.timezone || 'Asia/Jakarta',
          theme: prev?.theme || 'system',
          fontSize: prev?.fontSize || 'normal',
        }));
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setAccounts(DEFAULT_CLEAN_ACCOUNTS);
        setTransactions([]);
        setBudgets([]);
        setGoals([]);
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
        id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setTransactions((prev) => [newTx, ...prev]);
      showToast('Transaksi berhasil ditambahkan.', 'success');
      return true;
    },
    [accounts, transactions, showToast]
  );

  const updateTransaction = useCallback(
    (id: string, data: Partial<Transaction>): boolean => {
      setTransactions((prev) =>
        prev.map((t) =>
          t.id === id
            ? { ...t, ...data, updated_at: new Date().toISOString() }
            : t
        )
      );
      showToast('Transaksi berhasil diperbarui.', 'success');
      return true;
    },
    [showToast]
  );

  const deleteTransaction = useCallback(
    (id: string): boolean => {
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      showToast('Transaksi berhasil dihapus.', 'success');
      return true;
    },
    [showToast]
  );

  // Account Management
  const addAccount = useCallback(
    (data: Omit<Account, 'id' | 'created_at' | 'updated_at'>): boolean => {
      const newAccount: Account = {
        ...data,
        id: `acc-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setAccounts((prev) => [...prev, newAccount]);
      showToast('Rekening berhasil ditambahkan.', 'success');
      return true;
    },
    [showToast]
  );

  const updateAccount = useCallback(
    (id: string, data: Partial<Account>): boolean => {
      setAccounts((prev) =>
        prev.map((a) =>
          a.id === id
            ? { ...a, ...data, updated_at: new Date().toISOString() }
            : a
        )
      );
      showToast('Rekening berhasil diperbarui.', 'success');
      return true;
    },
    [showToast]
  );

  const deleteAccount = useCallback(
    (id: string): boolean => {
      setAccounts((prev) => prev.filter((a) => a.id !== id));
      showToast('Rekening berhasil dihapus.', 'success');
      return true;
    },
    [showToast]
  );

  // Category Management
  const addCategory = useCallback(
    (data: Omit<Category, 'id' | 'created_at' | 'updated_at'>): boolean => {
      const newCat: Category = {
        ...data,
        id: `cat-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setCategories((prev) => [...prev, newCat]);
      showToast('Kategori berhasil ditambahkan.', 'success');
      return true;
    },
    [showToast]
  );

  const updateCategory = useCallback(
    (id: string, data: Partial<Category>): boolean => {
      setCategories((prev) =>
        prev.map((c) =>
          c.id === id
            ? { ...c, ...data, updated_at: new Date().toISOString() }
            : c
        )
      );
      showToast('Kategori berhasil diperbarui.', 'success');
      return true;
    },
    [showToast]
  );

  const deleteCategory = useCallback(
    (id: string): boolean => {
      setCategories((prev) => prev.filter((c) => c.id !== id));
      showToast('Kategori berhasil dihapus.', 'success');
      return true;
    },
    [showToast]
  );

  // Budget Management
  const addBudget = useCallback(
    (data: Omit<Budget, 'id' | 'created_at' | 'updated_at'>): boolean => {
      const existing = budgets.find(
        (b) => b.category_id === data.category_id && b.month === data.month
      );

      if (existing) {
        setBudgets((prev) =>
          prev.map((b) =>
            b.id === existing.id
              ? { ...b, amount: data.amount, updated_at: new Date().toISOString() }
              : b
          )
        );
        showToast('Anggaran berhasil diperbarui.', 'success');
        return true;
      }

      const newBudget: Budget = {
        ...data,
        id: `bgt-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setBudgets((prev) => [...prev, newBudget]);
      showToast('Anggaran berhasil diperbarui.', 'success');
      return true;
    },
    [budgets, showToast]
  );

  const updateBudget = useCallback(
    (id: string, data: Partial<Budget>): boolean => {
      setBudgets((prev) =>
        prev.map((b) =>
          b.id === id
            ? { ...b, ...data, updated_at: new Date().toISOString() }
            : b
        )
      );
      showToast('Anggaran berhasil diperbarui.', 'success');
      return true;
    },
    [showToast]
  );

  const deleteBudget = useCallback(
    (id: string): boolean => {
      setBudgets((prev) => prev.filter((b) => b.id !== id));
      showToast('Anggaran berhasil dihapus.', 'success');
      return true;
    },
    [showToast]
  );

  // Goal Management
  const addGoal = useCallback(
    (data: Omit<Goal, 'id' | 'created_at' | 'updated_at'>): boolean => {
      const newGoal: Goal = {
        ...data,
        id: `goal-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setGoals((prev) => [...prev, newGoal]);
      showToast('Target tabungan berhasil ditambahkan.', 'success');
      return true;
    },
    [showToast]
  );

  const updateGoal = useCallback(
    (id: string, data: Partial<Goal>): boolean => {
      setGoals((prev) =>
        prev.map((g) =>
          g.id === id
            ? { ...g, ...data, updated_at: new Date().toISOString() }
            : g
        )
      );
      showToast('Target tabungan berhasil diperbarui.', 'success');
      return true;
    },
    [showToast]
  );

  const contributeGoal = useCallback(
    (id: string, amount: number, accountId?: string): boolean => {
      if (amount <= 0) {
        showToast('Jumlah setor harus lebih besar dari nol.', 'error');
        return false;
      }

      if (accountId) {
        const sourceAcc = accounts.find((a) => a.id === accountId);
        if (sourceAcc) {
          const balance = calculateAccountBalance(sourceAcc, transactions);
          if (balance < amount) {
            showToast(`Saldo ${sourceAcc.name} tidak mencukupi untuk setor tabungan.`, 'error');
            return false;
          }

          const newTx: Transaction = {
            id: `tx-${Date.now()}`,
            type: 'expense',
            amount,
            account_id: accountId,
            category_id: 'cat-investasi',
            description: `Setor Target Tabungan`,
            date: new Date().toISOString().split('T')[0],
            notes: 'Setoran ke target tabungan',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          setTransactions((prev) => [newTx, ...prev]);
        }
      }

      setGoals((prev) =>
        prev.map((g) => {
          if (g.id === id) {
            return {
              ...g,
              current_amount: g.current_amount + amount,
              updated_at: new Date().toISOString(),
            };
          }
          return g;
        })
      );

      showToast('Setoran tabungan berhasil dicatat!', 'success');
      return true;
    },
    [accounts, transactions, showToast]
  );

  const deleteGoal = useCallback(
    (id: string): boolean => {
      setGoals((prev) => prev.filter((g) => g.id !== id));
      showToast('Target tabungan berhasil dihapus.', 'success');
      return true;
    },
    [showToast]
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
    setAccounts(DEFAULT_CLEAN_ACCOUNTS);
    setCategories(INITIAL_CATEGORIES);
    setTransactions([]);
    setBudgets([]);
    setGoals([]);
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}_accounts`, JSON.stringify(DEFAULT_CLEAN_ACCOUNTS));
      localStorage.setItem(`${STORAGE_KEY_PREFIX}_categories`, JSON.stringify(INITIAL_CATEGORIES));
      localStorage.setItem(`${STORAGE_KEY_PREFIX}_transactions`, JSON.stringify([]));
      localStorage.setItem(`${STORAGE_KEY_PREFIX}_budgets`, JSON.stringify([]));
      localStorage.setItem(`${STORAGE_KEY_PREFIX}_goals`, JSON.stringify([]));
    } catch (e) {
      console.warn('Failed to reset financial data in localStorage:', e);
    }
    showToast('Seluruh mutasi transaksi dan rekening telah dibersihkan.', 'info');
  }, [showToast]);

  const resetToDemoData = resetAllFinancialData;

  const loginUser = useCallback(
    (email: string, name?: string) => {
      const cleanUser: UserProfile = {
        id: `user-${Date.now()}`,
        name: name?.trim() || email.split('@')[0],
        email: email.trim(),
        provider: 'email',
        currency: 'IDR',
        timezone: 'Asia/Jakarta',
        theme: 'system',
        fontSize: 'normal',
      };

      setUser(cleanUser);
      setAccounts(DEFAULT_CLEAN_ACCOUNTS);
      setTransactions([]);
      setBudgets([]);
      setGoals([]);
      try {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}_user`, JSON.stringify(cleanUser));
        localStorage.setItem(`${STORAGE_KEY_PREFIX}_accounts`, JSON.stringify(DEFAULT_CLEAN_ACCOUNTS));
        localStorage.setItem(`${STORAGE_KEY_PREFIX}_transactions`, JSON.stringify([]));
        localStorage.setItem(`${STORAGE_KEY_PREFIX}_budgets`, JSON.stringify([]));
        localStorage.setItem(`${STORAGE_KEY_PREFIX}_goals`, JSON.stringify([]));
      } catch (e) {
        console.warn('Failed to save clean session to localStorage:', e);
      }
    },
    []
  );

  const registerUser = useCallback((name: string, email: string) => {
    const cleanUser: UserProfile = {
      id: `user-${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      provider: 'email',
      currency: 'IDR',
      timezone: 'Asia/Jakarta',
      theme: 'system',
      fontSize: 'normal',
    };

    setUser(cleanUser);
    setAccounts(DEFAULT_CLEAN_ACCOUNTS);
    setTransactions([]);
    setBudgets([]);
    setGoals([]);
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}_user`, JSON.stringify(cleanUser));
      localStorage.setItem(`${STORAGE_KEY_PREFIX}_accounts`, JSON.stringify(DEFAULT_CLEAN_ACCOUNTS));
      localStorage.setItem(`${STORAGE_KEY_PREFIX}_transactions`, JSON.stringify([]));
      localStorage.setItem(`${STORAGE_KEY_PREFIX}_budgets`, JSON.stringify([]));
      localStorage.setItem(`${STORAGE_KEY_PREFIX}_goals`, JSON.stringify([]));
    } catch (e) {
      console.warn('Failed to save register session to localStorage:', e);
    }
  }, []);

  const setCleanUserSession = useCallback((profile: UserProfile, initialAccounts?: Account[]) => {
    setUser(profile);
    const accs = initialAccounts && initialAccounts.length > 0 ? initialAccounts : DEFAULT_CLEAN_ACCOUNTS;
    setAccounts(accs);
    setTransactions([]);
    setBudgets([]);
    setGoals([]);
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}_user`, JSON.stringify(profile));
      localStorage.setItem(`${STORAGE_KEY_PREFIX}_accounts`, JSON.stringify(accs));
      localStorage.setItem(`${STORAGE_KEY_PREFIX}_transactions`, JSON.stringify([]));
      localStorage.setItem(`${STORAGE_KEY_PREFIX}_budgets`, JSON.stringify([]));
      localStorage.setItem(`${STORAGE_KEY_PREFIX}_goals`, JSON.stringify([]));
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
    setAccounts(DEFAULT_CLEAN_ACCOUNTS);
    setTransactions([]);
    setBudgets([]);
    setGoals([]);
    try {
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}_user`);
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}_transactions`);
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}_budgets`);
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}_goals`);
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}_accounts`);
    } catch (e) {
      console.warn('Failed to clear user from localStorage:', e);
    }
    showToast('Berhasil keluar dari akun.', 'info');
  }, [showToast]);

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
        loginUser,
        registerUser,
        setCleanUserSession,
        updateUser,
        resetAllFinancialData,
        resetToDemoData,
        logout,
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
