import { Transaction } from '@/types';

export interface CalendarDay {
  dateStr: string; // YYYY-MM-DD
  dayNumber: number;
  month: number; // 1-12
  year: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
  income: number;
  expense: number;
  net: number;
  transferCount: number;
  transactions: Transaction[];
}

export interface MonthlyCalendarMetrics {
  totalIncome: number;
  totalExpense: number;
  netCashflow: number;
  transactionCount: number;
  dailyAverageExpense: number;
  peakSpendingDay: { date: string; amount: number } | null;
  peakIncomeDay: { date: string; amount: number } | null;
}

/**
 * Format string YYYY-MM-DD to Indonesian full format with day name
 * e.g. "2026-09-15" -> "Selasa, 15 September 2026"
 */
export function formatIndonesianFullDate(dateStr: string): string {
  if (!dateStr) return '-';
  const [yearStr, monthStr, dayStr] = dateStr.split('-');
  const y = parseInt(yearStr, 10);
  const m = parseInt(monthStr, 10) - 1;
  const d = parseInt(dayStr, 10);

  const date = new Date(y, m, d);
  if (isNaN(date.getTime())) return dateStr;

  const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const dayName = dayNames[date.getDay()];
  const monthName = monthNames[date.getMonth()];

  return `${dayName}, ${d} ${monthName} ${y}`;
}

/**
 * Generates the full 35 or 42 grid cells for the monthly calendar (starts on Monday)
 */
export function generateCalendarGrid(
  year: number,
  month: number, // 1 to 12
  transactions: Transaction[]
): CalendarDay[] {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(
    today.getDate()
  ).padStart(2, '0')}`;

  // Index map of transactions by dateStr
  const txMap = new Map<string, Transaction[]>();
  transactions.forEach((tx) => {
    const list = txMap.get(tx.date) || [];
    list.push(tx);
    txMap.set(tx.date, list);
  });

  // Calculate days
  const firstDayOfMonth = new Date(year, month - 1, 1);
  const totalDaysInMonth = new Date(year, month, 0).getDate();
  const totalDaysInPrevMonth = new Date(year, month - 1, 0).getDate();

  // Monday-based day of week (0 = Monday, 1 = Tuesday, ..., 6 = Sunday)
  const startDayMondayBased = (firstDayOfMonth.getDay() + 6) % 7;

  const days: CalendarDay[] = [];

  // 1. Leading days from previous month
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  for (let i = startDayMondayBased - 1; i >= 0; i--) {
    const dayNum = totalDaysInPrevMonth - i;
    const dateStr = `${prevYear}-${String(prevMonth).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    const dayDate = new Date(prevYear, prevMonth - 1, dayNum);
    const dayTxs = txMap.get(dateStr) || [];

    const income = dayTxs.filter((t) => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const expense = dayTxs.filter((t) => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    const transferCount = dayTxs.filter((t) => t.type === 'transfer').length;

    days.push({
      dateStr,
      dayNumber: dayNum,
      month: prevMonth,
      year: prevYear,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
      isWeekend: dayDate.getDay() === 0 || dayDate.getDay() === 6,
      income,
      expense,
      net: income - expense,
      transferCount,
      transactions: dayTxs,
    });
  }

  // 2. Days of current month
  for (let dayNum = 1; dayNum <= totalDaysInMonth; dayNum++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    const dayDate = new Date(year, month - 1, dayNum);
    const dayTxs = txMap.get(dateStr) || [];

    const income = dayTxs.filter((t) => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const expense = dayTxs.filter((t) => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    const transferCount = dayTxs.filter((t) => t.type === 'transfer').length;

    days.push({
      dateStr,
      dayNumber: dayNum,
      month,
      year,
      isCurrentMonth: true,
      isToday: dateStr === todayStr,
      isWeekend: dayDate.getDay() === 0 || dayDate.getDay() === 6,
      income,
      expense,
      net: income - expense,
      transferCount,
      transactions: dayTxs,
    });
  }

  // 3. Trailing days from next month to complete the row
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  const remainingCells = 7 - (days.length % 7);
  if (remainingCells < 7) {
    for (let dayNum = 1; dayNum <= remainingCells; dayNum++) {
      const dateStr = `${nextYear}-${String(nextMonth).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      const dayDate = new Date(nextYear, nextMonth - 1, dayNum);
      const dayTxs = txMap.get(dateStr) || [];

      const income = dayTxs.filter((t) => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
      const expense = dayTxs.filter((t) => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
      const transferCount = dayTxs.filter((t) => t.type === 'transfer').length;

      days.push({
        dateStr,
        dayNumber: dayNum,
        month: nextMonth,
        year: nextYear,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        isWeekend: dayDate.getDay() === 0 || dayDate.getDay() === 6,
        income,
        expense,
        net: income - expense,
        transferCount,
        transactions: dayTxs,
      });
    }
  }

  return days;
}

/**
 * Calculates high-level monthly metrics for financial calendar
 */
export function getMonthlyCalendarMetrics(
  transactions: Transaction[],
  yearMonth: string // YYYY-MM
): MonthlyCalendarMetrics {
  const monthTxs = transactions.filter((t) => t.date.startsWith(yearMonth));

  let totalIncome = 0;
  let totalExpense = 0;

  const dailyExpenseMap = new Map<string, number>();
  const dailyIncomeMap = new Map<string, number>();

  monthTxs.forEach((t) => {
    if (t.type === 'income') {
      totalIncome += t.amount;
      dailyIncomeMap.set(t.date, (dailyIncomeMap.get(t.date) || 0) + t.amount);
    } else if (t.type === 'expense') {
      totalExpense += t.amount;
      dailyExpenseMap.set(t.date, (dailyExpenseMap.get(t.date) || 0) + t.amount);
    }
  });

  // Calculate days in the selected month
  const [yearStr, monthStr] = yearMonth.split('-');
  const y = parseInt(yearStr, 10);
  const m = parseInt(monthStr, 10);
  const daysInMonth = new Date(y, m, 0).getDate();

  const dailyAverageExpense = daysInMonth > 0 ? Math.round(totalExpense / daysInMonth) : 0;

  let peakSpendingDay: { date: string; amount: number } | null = null;
  dailyExpenseMap.forEach((amount, date) => {
    if (!peakSpendingDay || amount > peakSpendingDay.amount) {
      peakSpendingDay = { date, amount };
    }
  });

  let peakIncomeDay: { date: string; amount: number } | null = null;
  dailyIncomeMap.forEach((amount, date) => {
    if (!peakIncomeDay || amount > peakIncomeDay.amount) {
      peakIncomeDay = { date, amount };
    }
  });

  return {
    totalIncome,
    totalExpense,
    netCashflow: totalIncome - totalExpense,
    transactionCount: monthTxs.length,
    dailyAverageExpense,
    peakSpendingDay,
    peakIncomeDay,
  };
}
