import { Account, Category, Transaction, Budget, Goal, UserProfile, Debt } from '@/types';

export const INITIAL_USER: UserProfile = {
  id: 'user-1',
  name: 'Budi Santoso',
  email: 'budi.santoso@example.com',
  currency: 'IDR',
  timezone: 'Asia/Jakarta',
  theme: 'system',
  fontSize: 'normal',
};

export const INITIAL_ACCOUNTS: Account[] = [];

export const INITIAL_CATEGORIES: Category[] = [
  // Pengeluaran
  {
    id: 'cat-makanan',
    name: 'Makanan',
    type: 'expense',
    icon: 'Utensils',
    color: '#f97316', // Orange
    is_active: true,
    created_at: '2026-09-01T00:00:00.000Z',
    updated_at: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'cat-transportasi',
    name: 'Transportasi',
    type: 'expense',
    icon: 'Car',
    color: '#0284c7', // Sky
    is_active: true,
    created_at: '2026-09-01T00:00:00.000Z',
    updated_at: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'cat-belanja',
    name: 'Belanja',
    type: 'expense',
    icon: 'ShoppingBag',
    color: '#ec4899', // Pink
    is_active: true,
    created_at: '2026-09-01T00:00:00.000Z',
    updated_at: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'cat-tagihan',
    name: 'Tagihan',
    type: 'expense',
    icon: 'Receipt',
    color: '#8b5cf6', // Purple
    is_active: true,
    created_at: '2026-09-01T00:00:00.000Z',
    updated_at: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'cat-hiburan',
    name: 'Hiburan',
    type: 'expense',
    icon: 'Film',
    color: '#f43f5e', // Rose
    is_active: true,
    created_at: '2026-09-01T00:00:00.000Z',
    updated_at: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'cat-kesehatan',
    name: 'Kesehatan',
    type: 'expense',
    icon: 'HeartPulse',
    color: '#10b981', // Emerald
    is_active: true,
    created_at: '2026-09-01T00:00:00.000Z',
    updated_at: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'cat-pendidikan',
    name: 'Pendidikan',
    type: 'expense',
    icon: 'GraduationCap',
    color: '#6366f1', // Indigo
    is_active: true,
    created_at: '2026-09-01T00:00:00.000Z',
    updated_at: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'cat-perjalanan',
    name: 'Perjalanan',
    type: 'expense',
    icon: 'Plane',
    color: '#eab308', // Yellow
    is_active: true,
    created_at: '2026-09-01T00:00:00.000Z',
    updated_at: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'cat-langganan',
    name: 'Langganan',
    type: 'expense',
    icon: 'CreditCard',
    color: '#64748b', // Slate
    is_active: true,
    created_at: '2026-09-01T00:00:00.000Z',
    updated_at: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'cat-lainnya-exp',
    name: 'Lainnya',
    type: 'expense',
    icon: 'MoreHorizontal',
    color: '#94a3b8',
    is_active: true,
    created_at: '2026-09-01T00:00:00.000Z',
    updated_at: '2026-09-01T00:00:00.000Z',
  },

  // Pemasukan
  {
    id: 'cat-gaji',
    name: 'Gaji',
    type: 'income',
    icon: 'Briefcase',
    color: '#10b981', // Green
    is_active: true,
    created_at: '2026-09-01T00:00:00.000Z',
    updated_at: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'cat-freelance',
    name: 'Freelance',
    type: 'income',
    icon: 'Laptop',
    color: '#3b82f6',
    is_active: true,
    created_at: '2026-09-01T00:00:00.000Z',
    updated_at: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'cat-bisnis',
    name: 'Bisnis',
    type: 'income',
    icon: 'Store',
    color: '#8b5cf6',
    is_active: true,
    created_at: '2026-09-01T00:00:00.000Z',
    updated_at: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'cat-bonus',
    name: 'Bonus',
    type: 'income',
    icon: 'Award',
    color: '#f59e0b',
    is_active: true,
    created_at: '2026-09-01T00:00:00.000Z',
    updated_at: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'cat-hadiah',
    name: 'Hadiah',
    type: 'income',
    icon: 'Gift',
    color: '#ec4899',
    is_active: true,
    created_at: '2026-09-01T00:00:00.000Z',
    updated_at: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'cat-investasi',
    name: 'Investasi',
    type: 'income',
    icon: 'TrendingUp',
    color: '#059669',
    is_active: true,
    created_at: '2026-09-01T00:00:00.000Z',
    updated_at: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'cat-lainnya-inc',
    name: 'Lainnya',
    type: 'income',
    icon: 'MoreHorizontal',
    color: '#94a3b8',
    is_active: true,
    created_at: '2026-09-01T00:00:00.000Z',
    updated_at: '2026-09-01T00:00:00.000Z',
  },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [];

export const INITIAL_BUDGETS: Budget[] = [];

export const INITIAL_GOALS: Goal[] = [];

export const INITIAL_DEBTS: Debt[] = [];
