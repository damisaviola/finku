'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  FileText,
  Download,
  Printer,
  Calendar,
  Wallet,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  ChevronLeft,
  ArrowDownLeft,
  ArrowUpRight,
  Building2,
  Landmark,
  Banknote,
  CheckCircle2,
  Clock,
  Filter,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useDompetKu } from '@/lib/store';
import { generateStatementData } from '@/lib/calculations/statement';
import { exportStatementToPdf } from '@/lib/pdf/statement-generator';
import { formatRupiah, formatTanggal, formatBulan, cn } from '@/lib/utils/formatters';

function StatementContent() {
  const searchParams = useSearchParams();
  const { user, accounts, transactions, categories, activeMonth, showToast } = useDompetKu();

  // Query parameter pre-selection
  const initialAccountId = searchParams.get('accountId') || (accounts[0]?.id ? accounts[0].id : 'all');
  const initialMonth = searchParams.get('month') || activeMonth || '2026-09';

  const [accountId, setAccountId] = useState<string>(initialAccountId);
  const [periodType, setPeriodType] = useState<'month' | 'custom'>('month');
  const [selectedMonth, setSelectedMonth] = useState<string>(initialMonth);
  const [customStartDate, setCustomStartDate] = useState<string>('2026-09-01');
  const [customEndDate, setCustomEndDate] = useState<string>('2026-09-30');
  const [isGenerating, setIsGenerating] = useState(false);

  // Sync with searchParams if navigated with new params
  useEffect(() => {
    const qAcc = searchParams.get('accountId');
    if (qAcc) setAccountId(qAcc);
    const qMonth = searchParams.get('month');
    if (qMonth) {
      setSelectedMonth(qMonth);
      setPeriodType('month');
    }
  }, [searchParams]);

  // Compute active date range
  const { startDate, endDate } = useMemo(() => {
    if (periodType === 'custom') {
      return {
        startDate: customStartDate || '2026-09-01',
        endDate: customEndDate || '2026-09-30',
      };
    }

    // Month mode
    const [yearStr, monthStr] = selectedMonth.split('-');
    const year = parseInt(yearStr, 10) || 2026;
    const month = parseInt(monthStr, 10) || 9;
    const lastDay = new Date(year, month, 0).getDate();

    return {
      startDate: `${selectedMonth}-01`,
      endDate: `${selectedMonth}-${String(lastDay).padStart(2, '0')}`,
    };
  }, [periodType, selectedMonth, customStartDate, customEndDate]);

  // Calculate statement summary and running balance
  const statementSummary = useMemo(() => {
    return generateStatementData({
      accountId,
      startDate,
      endDate,
      accounts,
      transactions,
      categories,
    });
  }, [accountId, startDate, endDate, accounts, transactions, categories]);

  // Handler for PDF Download
  const handleDownloadPdf = () => {
    try {
      setIsGenerating(true);
      exportStatementToPdf(
        statementSummary,
        user?.name || 'Pengguna DompetKu',
        user?.email || ''
      );
      showToast('Rekening koran PDF berhasil diunduh.', 'success');
    } catch (e) {
      console.error('Failed to export statement:', e);
      showToast('Gagal menghasilkan file PDF. Coba kembali.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  // Handler for Print
  const handlePrint = () => {
    window.print();
  };

  // Month list for dropdown
  const monthList = useMemo(() => {
    const list = [];
    for (let m = 12; m >= 1; m--) {
      const key = `2026-${String(m).padStart(2, '0')}`;
      list.push({
        value: key,
        label: `${formatBulan(key)}${key === activeMonth ? ' (Bulan Ini)' : ''}`,
      });
    }
    return list;
  }, [activeMonth]);

  return (
    <div className="space-y-6">
      {/* ========================================================= */}
      {/* MOBILE VIEW (BRImo-style Responsive Design: visible on < lg) */}
      {/* ========================================================= */}
      <div className="lg:hidden -mx-4 -mt-4 pb-8 space-y-4 print:hidden">
        {/* 1. Mobile Sunset Gradient Hero Header */}
        <div className="relative bg-gradient-to-b from-[#8b2d18] via-[#c65324] to-[#0a4d92] px-4 pt-4 pb-14 text-white overflow-hidden">
          <div className="absolute inset-0 opacity-15 pointer-events-none flex items-end">
            <svg className="w-full h-20" viewBox="0 0 400 100" fill="currentColor" preserveAspectRatio="none">
              <rect x="10" y="35" width="28" height="65" />
              <rect x="42" y="15" width="34" height="85" />
              <rect x="80" y="45" width="22" height="55" />
              <rect x="108" y="20" width="38" height="80" />
              <rect x="152" y="48" width="28" height="52" />
              <rect x="186" y="12" width="36" height="88" />
              <rect x="228" y="38" width="24" height="62" />
              <rect x="258" y="22" width="44" height="78" />
              <rect x="308" y="52" width="28" height="48" />
              <rect x="342" y="18" width="48" height="82" />
            </svg>
          </div>

          <div className="relative z-10 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Link
                href="/accounts"
                className="h-8 w-8 rounded-full bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/25 active:scale-95 transition-all"
                aria-label="Kembali ke Rekening"
              >
                <ChevronLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-base font-bold text-white leading-tight">
                  Rekening Koran
                </h1>
                <p className="text-[11px] text-white/80 font-medium leading-none mt-0.5">
                  {statementSummary.items.length} Mutasi Transaksi
                </p>
              </div>
            </div>

            <button
              onClick={handleDownloadPdf}
              disabled={isGenerating}
              type="button"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-400 text-zinc-950 font-bold text-xs shadow-md hover:bg-amber-300 active:scale-95 transition-all"
            >
              <Download className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>{isGenerating ? 'PDF...' : 'Unduh'}</span>
            </button>
          </div>
        </div>

        {/* 2. Floating Mobile Hero Summary Card */}
        <div className="relative z-20 px-4 -mt-10">
          <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-lg shadow-zinc-950/5 dark:shadow-black/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                Saldo Akhir Periode
              </span>
              <span className="text-[10px] font-mono text-zinc-400">
                Awal: {formatRupiah(statementSummary.openingBalance)}
              </span>
            </div>

            <div className="text-2xl font-black font-mono tracking-tight text-zinc-950 dark:text-white">
              {formatRupiah(statementSummary.closingBalance)}
            </div>

            {/* Income & Expense Breakdown */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
              <div className="p-2 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium leading-none">
                  Kredit (Masuk)
                </p>
                <p className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5 truncate">
                  +{formatRupiah(statementSummary.totalCredit)}
                </p>
              </div>

              <div className="p-2 rounded-xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40">
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium leading-none">
                  Debit (Keluar)
                </p>
                <p className="text-xs font-bold font-mono text-rose-600 dark:text-rose-400 mt-0.5 truncate">
                  -{formatRupiah(statementSummary.totalDebit)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Mobile Filter Selectors */}
        <div className="px-4 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
              >
                <option value="all">Semua Rekening</option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Select
                value={selectedMonth}
                onChange={(e) => {
                  setSelectedMonth(e.target.value);
                  setPeriodType('month');
                }}
              >
                {monthList.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </div>

        {/* 4. Mobile Native Mutation Card List */}
        <div className="px-4 space-y-2.5">
          {statementSummary.items.length === 0 ? (
            <div className="py-10 px-4 text-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-2.5">
              <div className="h-10 w-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center mx-auto">
                <FileText className="h-5 w-5" />
              </div>
              <p className="text-xs font-semibold text-zinc-900 dark:text-white">
                Tidak ada transaksi pada periode ini
              </p>
              <p className="text-[11px] text-zinc-400">
                Pilih periode lain atau rekening yang berbeda.
              </p>
            </div>
          ) : (
            statementSummary.items.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3.5 shadow-xs space-y-2"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-zinc-950 dark:text-white truncate">
                      {item.description}
                    </h4>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      {item.categoryName} • {formatTanggal(item.date)}
                    </p>
                  </div>

                  <span
                    className={cn(
                      'text-xs font-bold font-mono shrink-0',
                      item.credit > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                    )}
                  >
                    {item.credit > 0 ? `+${formatRupiah(item.credit)}` : `-${formatRupiah(item.debit)}`}
                  </span>
                </div>

                <div className="pt-1.5 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px]">
                  <span className="text-zinc-400">Saldo Berjalan:</span>
                  <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">
                    {formatRupiah(item.balance)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* DESKTOP VIEW (Filament UI Layout: visible on lg:) */}
      {/* ========================================================= */}
      <div className="hidden lg:block space-y-6">
        {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-zinc-950 dark:text-white">
              Rekening Koran
            </h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
              Account Statement
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Cetak dan unduh riwayat mutasi buku kas resmi berformat PDF dengan saldo berjalan.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            variant="secondary"
            onClick={handlePrint}
            className="gap-1.5"
          >
            <Printer className="h-4 w-4" />
            <span>Cetak</span>
          </Button>

          <Button
            type="button"
            variant="primary"
            onClick={handleDownloadPdf}
            disabled={isGenerating}
            className="gap-1.5"
          >
            <Download className="h-4 w-4" />
            <span>{isGenerating ? 'Memproses PDF...' : 'Unduh PDF'}</span>
          </Button>
        </div>
      </div>

      {/* Filter Toolbar (Hidden on Print) */}
      <Card className="print:hidden">
        <CardContent className="p-4 sm:p-5">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            {/* Account Selector */}
            <div className="sm:col-span-4">
              <Select
                label="Pilih Rekening"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
              >
                <option value="all">Semua Rekening (Konsolidasi)</option>
                <optgroup label="Daftar Rekening">
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({acc.type}) — {formatRupiah(acc.initial_balance)}
                    </option>
                  ))}
                </optgroup>
              </Select>
            </div>

            {/* Period Type */}
            <div className="sm:col-span-3">
              <Select
                label="Tipe Periode"
                value={periodType}
                onChange={(e) => setPeriodType(e.target.value as 'month' | 'custom')}
              >
                <option value="month">Pilihan Bulan</option>
                <option value="custom">Rentang Tanggal Kustom</option>
              </Select>
            </div>

            {/* Period Value */}
            {periodType === 'month' ? (
              <div className="sm:col-span-5">
                <Select
                  label="Pilih Bulan"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                >
                  {monthList.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </Select>
              </div>
            ) : (
              <div className="sm:col-span-5 grid grid-cols-2 gap-2">
                <Input
                  label="Dari Tanggal"
                  type="date"
                  value={customStartDate}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomStartDate(e.target.value)}
                />
                <Input
                  label="Sampai Tanggal"
                  type="date"
                  value={customEndDate}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomEndDate(e.target.value)}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats Summary Box (2x2 on Mobile, 4 columns on Desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 print:hidden">
        {/* Saldo Awal */}
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-xs space-y-1.5">
          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            Saldo Awal Periode
          </span>
          <div className="text-base sm:text-xl font-bold font-mono text-zinc-950 dark:text-zinc-50">
            {formatRupiah(statementSummary.openingBalance)}
          </div>
          <p className="text-[11px] text-zinc-400">Posisi per {startDate}</p>
        </div>

        {/* Total Kredit / Masuk */}
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Total Kredit (Masuk)
            </span>
            <span className="p-1 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <ArrowDownLeft className="h-3.5 w-3.5" />
            </span>
          </div>
          <div className="text-base sm:text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
            +{formatRupiah(statementSummary.totalCredit)}
          </div>
          <p className="text-[11px] text-zinc-400">{statementSummary.creditCount} kali mutasi masuk</p>
        </div>

        {/* Total Debit / Keluar */}
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Total Debit (Keluar)
            </span>
            <span className="p-1 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <ArrowUpRight className="h-3.5 w-3.5" />
            </span>
          </div>
          <div className="text-base sm:text-xl font-bold font-mono text-rose-600 dark:text-rose-400">
            -{formatRupiah(statementSummary.totalDebit)}
          </div>
          <p className="text-[11px] text-zinc-400">{statementSummary.debitCount} kali mutasi keluar</p>
        </div>

        {/* Saldo Akhir */}
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-xs space-y-1.5">
          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            Saldo Akhir Periode
          </span>
          <div className="text-base sm:text-xl font-bold font-mono text-amber-600 dark:text-amber-400">
            {formatRupiah(statementSummary.closingBalance)}
          </div>
          <p className="text-[11px] text-zinc-400">Posisi per {endDate}</p>
        </div>
      </div>

      {/* Official Bank Statement Document Preview */}
      <div className="bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden p-6 sm:p-8 space-y-6">
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-5 gap-4 border-zinc-200 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
                DompetKu
              </span>
              <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                Official
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Layanan Catatan & Rekening Koran Keuangan Digital
            </p>
          </div>

          <div className="text-left sm:text-right">
            <h2 className="text-base font-extrabold text-amber-600 dark:text-amber-400 tracking-wide">
              REKENING KORAN NASABAH
            </h2>
            <p className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
              STATEMENT OF ACCOUNT
            </p>
            <p className="text-[10px] text-zinc-400 font-mono mt-0.5">
              No. Dok: DK-STMT-{startDate.replace(/-/g, '')}
            </p>
          </div>
        </div>

        {/* Account & Owner Info Box */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-800 text-xs">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
              Data Nasabah
            </span>
            <div className="flex justify-between sm:justify-start gap-4">
              <span className="text-zinc-500 w-24 shrink-0">Nama Pemilik</span>
              <span className="font-bold text-zinc-950 dark:text-white">
                {user?.name || 'Pengguna DompetKu'}
              </span>
            </div>
            <div className="flex justify-between sm:justify-start gap-4">
              <span className="text-zinc-500 w-24 shrink-0">Email</span>
              <span className="font-medium text-zinc-700 dark:text-zinc-300">
                {user?.email || '-'}
              </span>
            </div>
            <div className="flex justify-between sm:justify-start gap-4">
              <span className="text-zinc-500 w-24 shrink-0">Tgl. Cetak</span>
              <span className="font-medium text-zinc-700 dark:text-zinc-300">
                {formatTanggal(new Date(), { withTime: true })}
              </span>
            </div>
          </div>

          <div className="space-y-1.5 border-t sm:border-t-0 sm:border-l pt-3 sm:pt-0 sm:pl-4 border-zinc-200 dark:border-zinc-800">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
              Detail Rekening
            </span>
            <div className="flex justify-between sm:justify-start gap-4">
              <span className="text-zinc-500 w-24 shrink-0">Nama Akun</span>
              <span className="font-bold text-zinc-950 dark:text-white">
                {statementSummary.accountName}
              </span>
            </div>
            <div className="flex justify-between sm:justify-start gap-4">
              <span className="text-zinc-500 w-24 shrink-0">Tipe / Valuta</span>
              <span className="font-medium text-zinc-700 dark:text-zinc-300">
                {statementSummary.accountType} ({statementSummary.currency})
              </span>
            </div>
            <div className="flex justify-between sm:justify-start gap-4">
              <span className="text-zinc-500 w-24 shrink-0">Periode Mutasi</span>
              <span className="font-bold text-amber-600 dark:text-amber-400">
                {startDate} s.d. {endDate}
              </span>
            </div>
          </div>
        </div>

        {/* Account Activity Summary Mini Bar */}
        <div className="grid grid-cols-4 gap-2 text-center p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 text-xs">
          <div>
            <span className="text-[10px] text-zinc-400 font-medium block">Saldo Awal</span>
            <span className="font-mono font-bold text-zinc-950 dark:text-white">
              {formatRupiah(statementSummary.openingBalance)}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium block">
              Total Kredit ({statementSummary.creditCount})
            </span>
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
              +{formatRupiah(statementSummary.totalCredit)}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-rose-600 dark:text-rose-400 font-medium block">
              Total Debit ({statementSummary.debitCount})
            </span>
            <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
              -{formatRupiah(statementSummary.totalDebit)}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium block">Saldo Akhir</span>
            <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
              {formatRupiah(statementSummary.closingBalance)}
            </span>
          </div>
        </div>

        {/* Detailed Itemized Ledger Table */}
        <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-100 dark:bg-zinc-800 text-[11px] font-bold text-zinc-700 dark:text-zinc-200 uppercase tracking-wider border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="px-3.5 py-2.5 text-center w-10">No</th>
                <th className="px-3.5 py-2.5 w-24">Tanggal</th>
                <th className="px-3.5 py-2.5">Keterangan Transaksi</th>
                <th className="px-3.5 py-2.5 w-28">Kategori</th>
                <th className="px-3.5 py-2.5 text-right w-28">Debit (Keluar)</th>
                <th className="px-3.5 py-2.5 text-right w-28">Kredit (Masuk)</th>
                <th className="px-3.5 py-2.5 text-right w-32">Saldo Berjalan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200/70 dark:divide-zinc-800 font-mono">
              {statementSummary.items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-zinc-400 font-sans text-xs">
                    Tidak ada transaksi pada rekening dan periode yang dipilih.
                  </td>
                </tr>
              ) : (
                statementSummary.items.map((item, idx) => (
                  <tr
                    key={item.id}
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors"
                  >
                    <td className="px-3.5 py-2.5 text-center text-zinc-400 text-[11px]">
                      {idx + 1}
                    </td>
                    <td className="px-3.5 py-2.5 text-zinc-600 dark:text-zinc-400 text-[11px] whitespace-nowrap">
                      {item.date}
                    </td>
                    <td className="px-3.5 py-2.5 font-sans font-medium text-zinc-950 dark:text-white">
                      {item.description}
                    </td>
                    <td className="px-3.5 py-2.5 font-sans text-zinc-600 dark:text-zinc-400 text-[11px]">
                      {item.categoryName}
                    </td>
                    <td className="px-3.5 py-2.5 text-right text-rose-600 dark:text-rose-400 font-semibold whitespace-nowrap">
                      {item.debit > 0 ? `-${formatRupiah(item.debit)}` : '-'}
                    </td>
                    <td className="px-3.5 py-2.5 text-right text-emerald-600 dark:text-emerald-400 font-semibold whitespace-nowrap">
                      {item.credit > 0 ? `+${formatRupiah(item.credit)}` : '-'}
                    </td>
                    <td className="px-3.5 py-2.5 text-right font-bold text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
                      {formatRupiah(item.balance)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Document Footer Note */}
        <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-zinc-400 gap-2">
          <span>
            Dokumen ini dicetak otomatis dan merupakan catatan pembukuan keuangan pribadi yang sah.
          </span>
          <span className="font-mono">
            DompetKu • Total: {statementSummary.items.length} Baris Mutasi
          </span>
        </div>
      </div>
      </div>
    </div>
  );
}

export default function StatementPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-zinc-500 text-xs">
          Memuat rekening koran...
        </div>
      }
    >
      <StatementContent />
    </Suspense>
  );
}
