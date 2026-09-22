// Script verifikasi skenario finansial sesuai PRD Bagian 63
import {
  calculateAccountBalance,
  calculateTotalBalance,
  calculateMonthlySummary,
  validateTransactionBalance,
} from '../src/lib/calculations/finance.js';

console.log('=== VERIFIKASI ATURAN KEUANGAN PRD BAGIAN 63 ===\n');

let allPassed = true;

function assert(condition, message) {
  if (condition) {
    console.log(`✅ LULUS: ${message}`);
  } else {
    console.error(`❌ GAGAL: ${message}`);
    allPassed = false;
  }
}

// Skenario 1 — Pemasukan (PRD Bagian 63)
// Saldo BCA: 1.000.000, Pemasukan: 500.000 -> BCA: 1.500.000
{
  const bca = {
    id: 'bca',
    name: 'BCA',
    type: 'Bank',
    initial_balance: 1000000,
    currency: 'IDR',
    is_active: true,
    created_at: '',
    updated_at: '',
  };
  const txs = [
    {
      id: '1',
      type: 'income',
      amount: 500000,
      account_id: 'bca',
      description: 'Gaji',
      date: '2026-09-20',
      created_at: '',
      updated_at: '',
    },
  ];

  const balance = calculateAccountBalance(bca, txs);
  assert(balance === 1500000, `Skenario 1 — Saldo BCA menjadi Rp1.500.000 (Dihasilkan: ${balance})`);
}

// Skenario 2 — Pengeluaran (PRD Bagian 63)
// Saldo BCA: 1.000.000, Pengeluaran: 100.000 -> BCA: 900.000
{
  const bca = {
    id: 'bca',
    name: 'BCA',
    type: 'Bank',
    initial_balance: 1000000,
    currency: 'IDR',
    is_active: true,
    created_at: '',
    updated_at: '',
  };
  const txs = [
    {
      id: '1',
      type: 'expense',
      amount: 100000,
      account_id: 'bca',
      description: 'Makan',
      date: '2026-09-21',
      created_at: '',
      updated_at: '',
    },
  ];

  const balance = calculateAccountBalance(bca, txs);
  assert(balance === 900000, `Skenario 2 — Saldo BCA menjadi Rp900.000 (Dihasilkan: ${balance})`);
}

// Skenario 3 — Transfer (PRD Bagian 63)
// BCA: 1.000.000, Cash: 0, Transfer: 300.000 -> BCA: 700.000, Cash: 300.000, Total: 1.000.000
{
  const bca = {
    id: 'bca',
    name: 'BCA',
    type: 'Bank',
    initial_balance: 1000000,
    currency: 'IDR',
    is_active: true,
    created_at: '',
    updated_at: '',
  };
  const cash = {
    id: 'cash',
    name: 'Uang Tunai',
    type: 'Uang Tunai',
    initial_balance: 0,
    currency: 'IDR',
    is_active: true,
    created_at: '',
    updated_at: '',
  };
  const txs = [
    {
      id: '1',
      type: 'transfer',
      amount: 300000,
      account_id: 'bca',
      destination_account_id: 'cash',
      description: 'Tarik Tunai',
      date: '2026-09-19',
      created_at: '',
      updated_at: '',
    },
  ];

  const bcaBal = calculateAccountBalance(bca, txs);
  const cashBal = calculateAccountBalance(cash, txs);
  const total = calculateTotalBalance([bca, cash], txs);

  assert(bcaBal === 700000, `Skenario 3 — Saldo BCA berkurang menjadi Rp700.000 (Dihasilkan: ${bcaBal})`);
  assert(cashBal === 300000, `Skenario 3 — Saldo Uang Tunai bertambah menjadi Rp300.000 (Dihasilkan: ${cashBal})`);
  assert(total === 1000000, `Skenario 3 — Total saldo tetap Rp1.000.000 (Dihasilkan: ${total})`);
}

// Skenario 4 — Transfer Tidak Menjadi Pengeluaran (PRD Bagian 63)
// Pemasukan: 1.000.000, Transfer: 300.000, Pengeluaran: 100.000
// Hasil: Total Pemasukan: 1.000.000, Total Pengeluaran: 100.000, Tabungan: 900.000
{
  const txs = [
    {
      id: '1',
      type: 'income',
      amount: 1000000,
      account_id: 'bca',
      date: '2026-09-01',
      created_at: '',
      updated_at: '',
    },
    {
      id: '2',
      type: 'transfer',
      amount: 300000,
      account_id: 'bca',
      destination_account_id: 'cash',
      date: '2026-09-02',
      created_at: '',
      updated_at: '',
    },
    {
      id: '3',
      type: 'expense',
      amount: 100000,
      account_id: 'bca',
      date: '2026-09-03',
      created_at: '',
      updated_at: '',
    },
  ];

  const summary = calculateMonthlySummary(txs);
  assert(summary.income === 1000000, `Skenario 4 — Total Pemasukan Rp1.000.000 (Dihasilkan: ${summary.income})`);
  assert(summary.expense === 100000, `Skenario 4 — Total Pengeluaran Rp100.000 (Transfer tidak dihitung) (Dihasilkan: ${summary.expense})`);
  assert(summary.savings === 900000, `Skenario 4 — Tabungan Rp900.000 (Dihasilkan: ${summary.savings})`);
  assert(summary.savingsRate === 90, `Skenario 4 — Rasio Tabungan 90% (Dihasilkan: ${summary.savingsRate}%)`);
}

// Skenario 5 — Aturan Saldo Tidak Mencukupi (PRD Bagian 52)
// BCA = Rp100.000, Pengeluaran = Rp150.000 -> Ditolak
{
  const bca = { id: 'bca', name: 'BCA', type: 'Bank' };
  const check = validateTransactionBalance({
    type: 'expense',
    amount: 150000,
    sourceAccount: bca,
    currentBalance: 100000,
  });

  assert(check.valid === false, 'Skenario 5 — Transaksi ditolak saat saldo tidak mencukupi');
  assert(
    check.error && check.error.includes('Saldo tidak mencukupi'),
    `Skenario 5 — Pesan error mengandung "Saldo tidak mencukupi": "${check.error}"`
  );
}

if (allPassed) {
  console.log('\n🎉 SEMUA SKENARIO PRD DINYATAKAN LULUS 100%!');
} else {
  process.exit(1);
}
