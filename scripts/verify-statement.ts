import { generateStatementData } from '../src/lib/calculations/statement';
import { Account, Transaction, Category } from '../src/types';

const testAccounts: Account[] = [
  {
    id: 'acc-1',
    name: 'BCA Utama',
    type: 'Bank',
    initial_balance: 5000000,
    currency: 'IDR',
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'acc-2',
    name: 'Dompet Tunai',
    type: 'Uang Tunai',
    initial_balance: 500000,
    currency: 'IDR',
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
];

const testCategories: Category[] = [
  {
    id: 'cat-1',
    name: 'Gaji',
    type: 'income',
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'cat-2',
    name: 'Belanja',
    type: 'expense',
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
];

const testTransactions: Transaction[] = [
  // Before period
  {
    id: 'tx-0',
    account_id: 'acc-1',
    amount: 1000000,
    type: 'income',
    date: '2026-08-15',
    category_id: 'cat-1',
    description: 'Gaji Agustus',
    created_at: '2026-08-15T08:00:00Z',
    updated_at: '2026-08-15T08:00:00Z',
  },
  // In period
  {
    id: 'tx-1',
    account_id: 'acc-1',
    amount: 200000,
    type: 'expense',
    date: '2026-09-02',
    category_id: 'cat-2',
    description: 'Belanja Supermarket',
    created_at: '2026-09-02T10:00:00Z',
    updated_at: '2026-09-02T10:00:00Z',
  },
  {
    id: 'tx-2',
    account_id: 'acc-1',
    destination_account_id: 'acc-2',
    amount: 300000,
    type: 'transfer',
    date: '2026-09-05',
    description: 'Tarik Tunai ATM',
    created_at: '2026-09-05T14:00:00Z',
    updated_at: '2026-09-05T14:00:00Z',
  },
  {
    id: 'tx-3',
    account_id: 'acc-1',
    amount: 500000,
    type: 'income',
    date: '2026-09-10',
    category_id: 'cat-1',
    description: 'Freelance Project',
    created_at: '2026-09-10T11:00:00Z',
    updated_at: '2026-09-10T11:00:00Z',
  },
];

console.log('=== VERIFIKASI KALKULASI REKENING KORAN ===\n');

// Test 1: Single Account (BCA)
const stmtBca = generateStatementData({
  accounts: testAccounts,
  transactions: testTransactions,
  categories: testCategories,
  accountId: 'acc-1',
  startDate: '2026-09-01',
  endDate: '2026-09-30',
});

console.log('Rekening:', stmtBca.accountName);
console.log('Saldo Awal (01-09-2026):', stmtBca.openingBalance);
console.log('Total Debit (Keluar):', stmtBca.totalDebit, '(Jumlah tx:', stmtBca.debitCount, ')');
console.log('Total Kredit (Masuk):', stmtBca.totalCredit, '(Jumlah tx:', stmtBca.creditCount, ')');
console.log('Saldo Akhir (30-09-2026):', stmtBca.closingBalance);
console.log('Total Baris Mutasi:', stmtBca.items.length);

stmtBca.items.forEach((item, idx) => {
  console.log(
    `[Baris ${idx + 1}] ${item.date} | ${item.description.padEnd(25)} | DB: ${String(item.debit).padStart(7)} | CR: ${String(item.credit).padStart(7)} | Saldo: ${item.balance}`
  );
});

// Verifikasi Matematis
// Saldo awal BCA: initial 5.000.000 + income tx-0 (1.000.000) = 6.000.000
if (stmtBca.openingBalance !== 6000000) {
  console.error(`❌ Saldo awal salah! Harusnya 6000000, didapat: ${stmtBca.openingBalance}`);
  process.exit(1);
} else {
  console.log('✅ PASS: Saldo awal akurat (5.000.000 + 1.000.000 = 6.000.000)');
}

// Mutasi:
// tx-1: Belanja 200.000 (DB) -> Saldo 5.800.000
// tx-2: Transfer ke acc-2 300.000 (DB) -> Saldo 5.500.000
// tx-3: Gaji 500.000 (CR) -> Saldo 6.000.000
// Total Debit = 500.000, Total Kredit = 500.000
// Saldo Akhir = 6.000.000
if (stmtBca.totalDebit !== 500000) {
  console.error(`❌ Total Debit salah! Didapat: ${stmtBca.totalDebit}`);
  process.exit(1);
} else {
  console.log('✅ PASS: Total Debit mutasi akurat (200.000 + 300.000 = 500.000)');
}

if (stmtBca.totalCredit !== 500000) {
  console.error(`❌ Total Kredit salah! Didapat: ${stmtBca.totalCredit}`);
  process.exit(1);
} else {
  console.log('✅ PASS: Total Kredit mutasi akurat (500.000)');
}

if (stmtBca.closingBalance !== 6000000) {
  console.error(`❌ Saldo akhir salah! Didapat: ${stmtBca.closingBalance}`);
  process.exit(1);
} else {
  console.log('✅ PASS: Saldo akhir akurat (6.000.000)');
}

if (stmtBca.items[stmtBca.items.length - 1].balance === stmtBca.closingBalance) {
  console.log('✅ PASS: Saldo baris terakhir sama persis dengan closingBalance');
} else {
  console.error('❌ FAIL: Saldo baris terakhir berbeda dengan closingBalance!');
  process.exit(1);
}

// Test 2: Multi-Account (Konsolidasi)
const stmtAll = generateStatementData({
  accounts: testAccounts,
  transactions: testTransactions,
  categories: testCategories,
  accountId: 'all',
  startDate: '2026-09-01',
  endDate: '2026-09-30',
});

// Initial balances: 5.000.000 + 500.000 = 5.500.000
// Before period tx-0: +1.000.000 -> Opening balance: 6.500.000
if (stmtAll.openingBalance !== 6500000) {
  console.error(`❌ Opening balance konsolidasi salah! Didapat: ${stmtAll.openingBalance}`);
  process.exit(1);
} else {
  console.log('\n✅ PASS: Konsolidasi Multi-Akun Saldo Awal akurat (6.500.000)');
}

console.log('\n🎉 SEMUA PENGUJIAN PERHITUNGAN REKENING KORAN 100% LULUS!\n');
