import { Account, Transaction, Budget, Category } from '@/types';
import { formatRupiah } from '../utils/formatters';

/**
 * PRD Bagian 48:
 * Saldo Saat Ini = Saldo Awal + Pemasukan - Pengeluaran - Transfer Keluar + Transfer Masuk
 */
export function calculateAccountBalance(account: Account, transactions: Transaction[]): number {
  let balance = account.initial_balance;

  for (const t of transactions) {
    if (t.type === 'income' && t.account_id === account.id) {
      balance += t.amount;
    } else if (t.type === 'expense' && t.account_id === account.id) {
      balance -= t.amount;
    } else if (t.type === 'transfer') {
      if (t.account_id === account.id) {
        // Transfer Keluar
        balance -= t.amount;
      }
      if (t.destination_account_id === account.id) {
        // Transfer Masuk
        balance += t.amount;
      }
    }
  }

  return balance;
}

/**
 * Calculate total balance across all active accounts
 */
export function calculateTotalBalance(accounts: Account[], transactions: Transaction[]): number {
  return accounts
    .filter((acc) => acc.is_active)
    .reduce((total, acc) => total + calculateAccountBalance(acc, transactions), 0);
}

/**
 * PRD Bagian 15, 39, 49:
 * Monthly summary for given month (format YYYY-MM) or all transactions
 * Transfer does NOT count as income or expense!
 */
export function calculateMonthlySummary(transactions: Transaction[], monthKey?: string) {
  const filtered = monthKey
    ? transactions.filter((t) => t.date.startsWith(monthKey))
    : transactions;

  let income = 0;
  let expense = 0;

  for (const t of filtered) {
    if (t.type === 'income') {
      income += t.amount;
    } else if (t.type === 'expense') {
      expense += t.amount;
    }
    // Transfer is strictly excluded from income/expense
  }

  const savings = income - expense;
  const savingsRate = income > 0 ? (savings / income) * 100 : 0;

  return {
    income,
    expense,
    savings,
    savingsRate: Math.max(0, savingsRate),
  };
}

export type BudgetStatusType = 'within_limit' | 'near_limit' | 'over_limit';

export interface BudgetProgress {
  budget: Budget;
  category?: Category;
  used: number;
  remaining: number;
  percentage: number;
  status: BudgetStatusType;
  statusLabel: string;
}

/**
 * PRD Bagian 31 & 32:
 * 0–79%: Dalam batas
 * 80–99%: Mendekati batas
 * 100%+: Melewati batas
 */
export function calculateBudgetProgress(
  budget: Budget,
  transactions: Transaction[],
  categories: Category[]
): BudgetProgress {
  const category = categories.find((c) => c.id === budget.category_id);

  // Filter expenses matching category and month
  const used = transactions
    .filter(
      (t) =>
        t.type === 'expense' &&
        t.category_id === budget.category_id &&
        t.date.startsWith(budget.month)
    )
    .reduce((sum, t) => sum + t.amount, 0);

  const percentage = budget.amount > 0 ? Math.round((used / budget.amount) * 100) : 0;
  const remaining = budget.amount - used;

  let status: BudgetStatusType = 'within_limit';
  let statusLabel = 'Dalam batas';

  if (percentage >= 100) {
    status = 'over_limit';
    statusLabel = 'Melewati batas';
  } else if (percentage >= 80) {
    status = 'near_limit';
    statusLabel = 'Mendekati batas';
  }

  return {
    budget,
    category,
    used,
    remaining,
    percentage,
    status,
    statusLabel,
  };
}

/**
 * PRD Bagian 52:
 * Aturan Saldo Tidak Mencukupi
 */
export function validateTransactionBalance(params: {
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  sourceAccount: Account;
  currentBalance: number;
}): { valid: boolean; error?: string } {
  const { type, amount, sourceAccount, currentBalance } = params;

  if (amount <= 0) {
    return {
      valid: false,
      error: 'Jumlah harus lebih besar dari nol.',
    };
  }

  if (type === 'expense' || type === 'transfer') {
    if (currentBalance < amount) {
      return {
        valid: false,
        error: `Saldo tidak mencukupi.\n\nSaldo ${sourceAccount.name} saat ini: ${formatRupiah(
          currentBalance
        )}\nJumlah transaksi: ${formatRupiah(amount)}`,
      };
    }
  }

  return { valid: true };
}
