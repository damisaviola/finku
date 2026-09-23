export type AccountType = 'Bank' | 'Uang Tunai' | 'Dompet Digital' | 'Tabungan' | 'Lainnya';

export interface Account {
  id: string;
  user_id?: string;
  name: string;
  type: AccountType;
  initial_balance: number;
  currency: string;
  icon?: string;
  color?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type CategoryType = 'income' | 'expense';

export interface Category {
  id: string;
  user_id?: string;
  name: string;
  type: CategoryType;
  icon?: string;
  color?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type TransactionType = 'income' | 'expense' | 'transfer';

export interface Transaction {
  id: string;
  user_id?: string;
  type: TransactionType;
  amount: number;
  account_id: string;
  destination_account_id?: string | null;
  category_id?: string | null;
  description: string;
  date: string; // ISO date string YYYY-MM-DD
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Budget {
  id: string;
  user_id?: string;
  category_id: string;
  amount: number;
  month: string; // YYYY-MM format, e.g. "2026-09"
  created_at: string;
  updated_at: string;
}

export interface Goal {
  id: string;
  user_id?: string;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date?: string; // YYYY-MM-DD
  description?: string;
  color?: string;
  icon?: string;
  created_at: string;
  updated_at: string;
}

export type FontSize = 'sm' | 'normal' | 'lg' | 'xl';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  provider?: 'email' | 'google';
  currency: string;
  timezone: string;
  theme: 'light' | 'dark' | 'system';
  fontSize?: FontSize;
}

export type DebtType = 'debt' | 'receivable'; // 'debt' = Utang (Kewajiban), 'receivable' = Piutang (Hak Tagih)
export type DebtStatus = 'unpaid' | 'partial' | 'paid' | 'overdue';

export interface DebtPayment {
  id: string;
  debt_id: string;
  amount: number;
  payment_date: string; // YYYY-MM-DD
  account_id?: string | null;
  notes?: string;
  created_at: string;
}

export interface Debt {
  id: string;
  user_id?: string;
  type: DebtType;
  person_name: string;
  phone_number?: string;
  total_amount: number;
  paid_amount: number;
  due_date?: string; // YYYY-MM-DD
  account_id?: string | null;
  notes?: string;
  payments?: DebtPayment[];
  created_at: string;
  updated_at: string;
}

