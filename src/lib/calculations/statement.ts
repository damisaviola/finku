import { Account, Transaction, Category } from '@/types';

export interface StatementItem {
  id: string;
  date: string;
  rawDate: string;
  description: string;
  categoryName: string;
  accountName: string;
  destinationAccountName?: string;
  type: 'CR' | 'DB';
  debit: number;
  credit: number;
  balance: number;
}

export interface StatementSummary {
  accountName: string;
  accountNumber: string;
  accountType: string;
  currency: string;
  startDate: string;
  endDate: string;
  periodLabel: string;
  openingBalance: number;
  totalCredit: number;
  totalDebit: number;
  closingBalance: number;
  creditCount: number;
  debitCount: number;
  items: StatementItem[];
}

export function generateStatementData({
  accountId,
  startDate,
  endDate,
  accounts,
  transactions,
  categories,
}: {
  accountId: string; // specific account ID or 'all'
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  accounts: Account[];
  transactions: Transaction[];
  categories: Category[];
}): StatementSummary {
  const isAll = accountId === 'all';
  const targetAccount = isAll ? null : accounts.find((a) => a.id === accountId);

  const accountName = isAll ? 'Semua Rekening (Konsolidasi)' : targetAccount?.name || 'Rekening';
  const accountNumber = isAll
    ? 'ALL-ACCOUNTS'
    : `ID-${(targetAccount?.id || '000').toUpperCase().replace(/[^A-Z0-9]/g, '')}`;
  const accountType = isAll ? 'Konsolidasi Multi-Akun' : targetAccount?.type || 'Bank';
  const currency = targetAccount?.currency || 'IDR';

  // 1. Hitung Saldo Awal sebelum startDate
  let openingBalance = 0;
  if (isAll) {
    accounts.forEach((acc) => {
      openingBalance += acc.initial_balance;
    });
  } else if (targetAccount) {
    openingBalance = targetAccount.initial_balance;
  }

  // Iterasi transaksi sebelum startDate untuk mencari saldo awal tepat pada startDate
  const priorTransactions = transactions
    .filter((t) => t.date < startDate)
    .sort((a, b) => a.date.localeCompare(b.date));

  for (const t of priorTransactions) {
    if (isAll) {
      if (t.type === 'income') openingBalance += t.amount;
      if (t.type === 'expense') openingBalance -= t.amount;
      // transfer internal antar akun tidak mengubah total agregat konsolidasi
    } else {
      if (t.account_id === accountId) {
        if (t.type === 'income') openingBalance += t.amount;
        if (t.type === 'expense') openingBalance -= t.amount;
        if (t.type === 'transfer') openingBalance -= t.amount;
      }
      if (t.destination_account_id === accountId && t.type === 'transfer') {
        openingBalance += t.amount;
      }
    }
  }

  // 2. Filter transaksi dalam rentang periode [startDate, endDate]
  const inPeriodTransactions = transactions
    .filter((t) => {
      if (t.date < startDate || t.date > endDate) return false;
      if (isAll) return true;
      return t.account_id === accountId || t.destination_account_id === accountId;
    })
    .sort((a, b) => {
      const dateCmp = a.date.localeCompare(b.date);
      if (dateCmp !== 0) return dateCmp;
      return (a.created_at || '').localeCompare(b.created_at || '');
    });

  let runningBalance = openingBalance;
  let totalCredit = 0;
  let totalDebit = 0;
  let creditCount = 0;
  let debitCount = 0;

  const items: StatementItem[] = [];

  for (const t of inPeriodTransactions) {
    const cat = categories.find((c) => c.id === t.category_id);
    const sourceAcc = accounts.find((a) => a.id === t.account_id);
    const destAcc = t.destination_account_id
      ? accounts.find((a) => a.id === t.destination_account_id)
      : undefined;

    let debit = 0;
    let credit = 0;
    let itemType: 'CR' | 'DB' = 'CR';
    let desc = t.description;

    if (isAll) {
      if (t.type === 'income') {
        credit = t.amount;
        itemType = 'CR';
      } else if (t.type === 'expense') {
        debit = t.amount;
        itemType = 'DB';
      } else if (t.type === 'transfer') {
        desc = `Transfer: ${sourceAcc?.name || 'Akun'} -> ${destAcc?.name || 'Tujuan'}`;
        // Pada konsolidasi, transfer dicatat informatif net 0
        credit = t.amount;
        debit = t.amount;
        itemType = 'CR';
      }
    } else {
      if (t.account_id === accountId) {
        if (t.type === 'income') {
          credit = t.amount;
          itemType = 'CR';
        } else if (t.type === 'expense') {
          debit = t.amount;
          itemType = 'DB';
        } else if (t.type === 'transfer') {
          debit = t.amount;
          itemType = 'DB';
          desc = `Transfer Keluar ke ${destAcc?.name || 'Rekening Tujuan'}`;
        }
      } else if (t.destination_account_id === accountId && t.type === 'transfer') {
        credit = t.amount;
        itemType = 'CR';
        desc = `Transfer Masuk dari ${sourceAcc?.name || 'Rekening Sumber'}`;
      }
    }

    if (itemType === 'CR' && debit === 0) {
      runningBalance += credit;
      totalCredit += credit;
      creditCount += 1;
    } else if (itemType === 'DB' && credit === 0) {
      runningBalance -= debit;
      totalDebit += debit;
      debitCount += 1;
    }

    items.push({
      id: t.id,
      date: t.date,
      rawDate: t.date,
      description: desc,
      categoryName: cat?.name || (t.type === 'transfer' ? 'Transfer Dana' : 'Lainnya'),
      accountName: sourceAcc?.name || '-',
      destinationAccountName: destAcc?.name,
      type: itemType,
      debit,
      credit,
      balance: runningBalance,
    });
  }

  const closingBalance = openingBalance + totalCredit - totalDebit;

  return {
    accountName,
    accountNumber,
    accountType,
    currency,
    startDate,
    endDate,
    periodLabel: `${startDate} s.d. ${endDate}`,
    openingBalance,
    totalCredit,
    totalDebit,
    closingBalance,
    creditCount,
    debitCount,
    items,
  };
}
