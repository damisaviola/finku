import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function toValidUuid(id?: string | null): string {
  if (id && UUID_REGEX.test(id)) return id;
  return crypto.randomUUID();
}

function safeUuid(id?: string | null): string | null {
  if (!id) return null;
  return UUID_REGEX.test(id) ? id : null;
}

/**
 * GET /api/sync?userId=...
 * Pulls all user data from Supabase PostgreSQL database
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const email = searchParams.get('email');
    const name = searchParams.get('name');
    const avatarUrl = searchParams.get('avatar_url');

    if (!userId || !UUID_REGEX.test(userId)) {
      return NextResponse.json(
        { error: 'Parameter userId wajib berupa UUID valid.' },
        { status: 400 }
      );
    }

    // Pastikan user ada di tabel public.users
    let userRecord = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userRecord && email) {
      userRecord = await prisma.user.upsert({
        where: { email: email.toLowerCase().trim() },
        create: {
          id: userId,
          email: email.toLowerCase().trim(),
          name: name?.trim() || email.split('@')[0],
          avatar_url: avatarUrl || null,
        },
        update: {
          name: name?.trim() || undefined,
          avatar_url: avatarUrl || undefined,
        },
      });
    }

    if (!userRecord) {
      return NextResponse.json({
        success: true,
        user: null,
        accounts: [],
        categories: [],
        transactions: [],
        budgets: [],
        goals: [],
        debts: [],
      });
    }

    // Ambil seluruh data pengguna
    const [accounts, categories, transactions, budgets, goals, debts] = await Promise.all([
      prisma.account.findMany({
        where: { user_id: userRecord.id },
        orderBy: { created_at: 'asc' },
      }),
      prisma.category.findMany({
        where: { user_id: userRecord.id },
        orderBy: { created_at: 'asc' },
      }),
      prisma.transaction.findMany({
        where: { user_id: userRecord.id },
        orderBy: { date: 'desc' },
      }),
      prisma.budget.findMany({
        where: { user_id: userRecord.id },
      }),
      prisma.goal.findMany({
        where: { user_id: userRecord.id },
        orderBy: { created_at: 'asc' },
      }),
      prisma.debt.findMany({
        where: { user_id: userRecord.id },
        include: {
          payments: {
            orderBy: { payment_date: 'asc' },
          },
        },
        orderBy: { created_at: 'desc' },
      }),
    ]);

    let userCategories = categories;
    if (userCategories.length === 0) {
      const defaultCategories = [
        { user_id: userRecord.id, name: 'Makanan', type: 'expense', icon: 'Utensils', color: '#f97316' },
        { user_id: userRecord.id, name: 'Transportasi', type: 'expense', icon: 'Car', color: '#0284c7' },
        { user_id: userRecord.id, name: 'Belanja', type: 'expense', icon: 'ShoppingBag', color: '#ec4899' },
        { user_id: userRecord.id, name: 'Tagihan', type: 'expense', icon: 'Receipt', color: '#8b5cf6' },
        { user_id: userRecord.id, name: 'Hiburan', type: 'expense', icon: 'Film', color: '#f43f5e' },
        { user_id: userRecord.id, name: 'Kesehatan', type: 'expense', icon: 'HeartPulse', color: '#10b981' },
        { user_id: userRecord.id, name: 'Pendidikan', type: 'expense', icon: 'GraduationCap', color: '#6366f1' },
        { user_id: userRecord.id, name: 'Perjalanan', type: 'expense', icon: 'Plane', color: '#eab308' },
        { user_id: userRecord.id, name: 'Langganan', type: 'expense', icon: 'CreditCard', color: '#64748b' },
        { user_id: userRecord.id, name: 'Lainnya', type: 'expense', icon: 'MoreHorizontal', color: '#94a3b8' },
        { user_id: userRecord.id, name: 'Gaji', type: 'income', icon: 'Briefcase', color: '#10b981' },
        { user_id: userRecord.id, name: 'Freelance', type: 'income', icon: 'Laptop', color: '#3b82f6' },
        { user_id: userRecord.id, name: 'Bisnis', type: 'income', icon: 'Store', color: '#8b5cf6' },
        { user_id: userRecord.id, name: 'Bonus', type: 'income', icon: 'Award', color: '#f59e0b' },
        { user_id: userRecord.id, name: 'Hadiah', type: 'income', icon: 'Gift', color: '#ec4899' },
        { user_id: userRecord.id, name: 'Investasi', type: 'income', icon: 'TrendingUp', color: '#059669' },
      ];
      await prisma.category.createMany({
        data: defaultCategories,
        skipDuplicates: true,
      });
      userCategories = await prisma.category.findMany({
        where: { user_id: userRecord.id },
        orderBy: { created_at: 'asc' },
      });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: userRecord.id,
        name: userRecord.name,
        email: userRecord.email,
        avatar_url: userRecord.avatar_url,
      },
      accounts: accounts.map((acc) => ({
        id: acc.id,
        name: acc.name,
        type: acc.type,
        initial_balance: Number(acc.initial_balance),
        currency: acc.currency,
        color: acc.color || '#3b82f6',
        icon: acc.icon || 'Wallet',
        is_active: acc.is_active,
        created_at: acc.created_at.toISOString(),
        updated_at: acc.updated_at.toISOString(),
      })),
      categories: userCategories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        type: cat.type as 'income' | 'expense',
        icon: cat.icon || 'Tag',
        color: cat.color || '#3b82f6',
        is_active: cat.is_active,
        created_at: cat.created_at.toISOString(),
        updated_at: cat.updated_at.toISOString(),
      })),
      transactions: transactions.map((tx) => ({
        id: tx.id,
        type: tx.type as 'income' | 'expense' | 'transfer',
        amount: Number(tx.amount),
        account_id: tx.account_id,
        destination_account_id: tx.destination_account_id || undefined,
        category_id: tx.category_id || undefined,
        description: tx.description,
        date: tx.date instanceof Date ? tx.date.toISOString().split('T')[0] : String(tx.date).split('T')[0],
        notes: tx.notes || undefined,
        created_at: tx.created_at.toISOString(),
        updated_at: tx.updated_at.toISOString(),
      })),
      budgets: budgets.map((b) => ({
        id: b.id,
        category_id: b.category_id,
        amount: Number(b.amount),
        month: b.month,
        created_at: b.created_at.toISOString(),
        updated_at: b.updated_at.toISOString(),
      })),
      goals: goals.map((g) => ({
        id: g.id,
        name: g.name,
        target_amount: Number(g.target_amount),
        current_amount: Number(g.current_amount),
        target_date: g.target_date ? (g.target_date instanceof Date ? g.target_date.toISOString().split('T')[0] : String(g.target_date).split('T')[0]) : '',
        description: g.description || undefined,
        color: '#10b981',
        icon: 'Target',
        created_at: g.created_at.toISOString(),
        updated_at: g.updated_at.toISOString(),
      })),
      debts: debts.map((d) => ({
        id: d.id,
        type: d.type as 'receivable' | 'debt',
        person_name: d.person_name,
        phone_number: d.phone_number || undefined,
        total_amount: Number(d.total_amount),
        paid_amount: Number(d.paid_amount),
        due_date: d.due_date ? (d.due_date instanceof Date ? d.due_date.toISOString().split('T')[0] : String(d.due_date).split('T')[0]) : undefined,
        account_id: d.account_id || undefined,
        notes: d.notes || undefined,
        created_at: d.created_at.toISOString(),
        updated_at: d.updated_at.toISOString(),
        payments: d.payments.map((p) => ({
          id: p.id,
          debt_id: p.debt_id,
          amount: Number(p.amount),
          payment_date: p.payment_date instanceof Date ? p.payment_date.toISOString().split('T')[0] : String(p.payment_date).split('T')[0],
          account_id: p.account_id || undefined,
          notes: p.notes || undefined,
          created_at: p.created_at.toISOString(),
        })),
      })),
    });
  } catch (error: unknown) {
    console.error('Error fetching sync data:', error);
    const msg = error instanceof Error ? error.message : 'Terjadi kesalahan saat memuat data.';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * POST /api/sync
 * Mutates data directly in Supabase PostgreSQL database
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, userId, data, id } = body;

    if (!userId || !UUID_REGEX.test(userId)) {
      return NextResponse.json(
        { error: 'Parameter userId wajib berupa UUID valid.' },
        { status: 400 }
      );
    }

    switch (action) {
      // 1. ACCOUNTS
      case 'upsertAccount': {
        const accId = toValidUuid(data.id);
        const result = await prisma.account.upsert({
          where: { id: accId },
          create: {
            id: accId,
            user_id: userId,
            name: data.name,
            type: data.type,
            initial_balance: data.initial_balance || 0,
            currency: data.currency || 'IDR',
            color: data.color || '#3b82f6',
            icon: data.icon || 'Wallet',
            is_active: data.is_active ?? true,
          },
          update: {
            name: data.name,
            type: data.type,
            initial_balance: data.initial_balance,
            currency: data.currency,
            color: data.color,
            icon: data.icon,
            is_active: data.is_active,
          },
        });
        return NextResponse.json({ success: true, id: result.id });
      }

      case 'deleteAccount': {
        if (!id || !UUID_REGEX.test(id)) return NextResponse.json({ success: true });
        await prisma.account.deleteMany({
          where: { id, user_id: userId },
        });
        return NextResponse.json({ success: true });
      }

      // 2. CATEGORIES
      case 'upsertCategory': {
        const catId = toValidUuid(data.id);
        const result = await prisma.category.upsert({
          where: { id: catId },
          create: {
            id: catId,
            user_id: userId,
            name: data.name,
            type: data.type,
            icon: data.icon || 'Tag',
            color: data.color || '#3b82f6',
            is_active: data.is_active ?? true,
          },
          update: {
            name: data.name,
            type: data.type,
            icon: data.icon,
            color: data.color,
            is_active: data.is_active,
          },
        });
        return NextResponse.json({ success: true, id: result.id });
      }

      case 'deleteCategory': {
        if (!id || !UUID_REGEX.test(id)) return NextResponse.json({ success: true });
        await prisma.category.deleteMany({
          where: { id, user_id: userId },
        });
        return NextResponse.json({ success: true });
      }

      // 3. TRANSACTIONS
      case 'upsertTransaction': {
        const txId = toValidUuid(data.id);
        const sourceAccId = safeUuid(data.account_id);
        if (!sourceAccId) {
          return NextResponse.json({ error: 'Rekening asal tidak valid' }, { status: 400 });
        }

        const sourceExists = await prisma.account.findUnique({ where: { id: sourceAccId } });
        if (!sourceExists) {
          return NextResponse.json({ error: 'Rekening asal tidak ditemukan di database' }, { status: 400 });
        }

        const destAccId = safeUuid(data.destination_account_id);
        let validDestAccId: string | null = null;
        if (destAccId) {
          const destExists = await prisma.account.findUnique({ where: { id: destAccId } });
          if (destExists) validDestAccId = destExists.id;
        }

        const catId = safeUuid(data.category_id);
        let validCatId: string | null = null;
        if (catId) {
          const catExists = await prisma.category.findUnique({ where: { id: catId } });
          if (catExists) validCatId = catExists.id;
        }

        const result = await prisma.transaction.upsert({
          where: { id: txId },
          create: {
            id: txId,
            user_id: userId,
            type: data.type,
            amount: data.amount,
            account_id: sourceAccId,
            destination_account_id: validDestAccId,
            category_id: validCatId,
            description: data.description,
            date: new Date(data.date),
            notes: data.notes || null,
          },
          update: {
            type: data.type,
            amount: data.amount,
            account_id: sourceAccId,
            destination_account_id: validDestAccId,
            category_id: validCatId,
            description: data.description,
            date: new Date(data.date),
            notes: data.notes || null,
          },
        });
        return NextResponse.json({ success: true, id: result.id });
      }

      case 'deleteTransaction': {
        if (!id || !UUID_REGEX.test(id)) return NextResponse.json({ success: true });
        await prisma.transaction.deleteMany({
          where: { id, user_id: userId },
        });
        return NextResponse.json({ success: true });
      }

      // 4. BUDGETS
      case 'upsertBudget': {
        const bgtId = toValidUuid(data.id);
        const catId = safeUuid(data.category_id);
        if (!catId) {
          return NextResponse.json({ error: 'Kategori anggaran tidak valid' }, { status: 400 });
        }

        const catExists = await prisma.category.findUnique({ where: { id: catId } });
        if (!catExists) {
          return NextResponse.json({ error: 'Kategori anggaran tidak ditemukan di database' }, { status: 400 });
        }

        const result = await prisma.budget.upsert({
          where: {
            user_id_category_id_month: {
              user_id: userId,
              category_id: catId,
              month: data.month,
            },
          },
          create: {
            id: bgtId,
            user_id: userId,
            category_id: catId,
            amount: data.amount,
            month: data.month,
          },
          update: {
            amount: data.amount,
          },
        });
        return NextResponse.json({ success: true, id: result.id });
      }

      case 'deleteBudget': {
        if (!id || !UUID_REGEX.test(id)) return NextResponse.json({ success: true });
        await prisma.budget.deleteMany({
          where: { id, user_id: userId },
        });
        return NextResponse.json({ success: true });
      }

      // 5. GOALS
      case 'upsertGoal': {
        const goalId = toValidUuid(data.id);
        const result = await prisma.goal.upsert({
          where: { id: goalId },
          create: {
            id: goalId,
            user_id: userId,
            name: data.name,
            target_amount: data.target_amount,
            current_amount: data.current_amount || 0,
            target_date: data.target_date ? new Date(data.target_date) : null,
            description: data.description || null,
          },
          update: {
            name: data.name,
            target_amount: data.target_amount,
            current_amount: data.current_amount,
            target_date: data.target_date ? new Date(data.target_date) : null,
            description: data.description || null,
          },
        });
        return NextResponse.json({ success: true, id: result.id });
      }

      case 'deleteGoal': {
        if (!id || !UUID_REGEX.test(id)) return NextResponse.json({ success: true });
        await prisma.goal.deleteMany({
          where: { id, user_id: userId },
        });
        return NextResponse.json({ success: true });
      }

      // 6. DEBTS
      case 'upsertDebt': {
        const debtId = toValidUuid(data.id);
        const accId = safeUuid(data.account_id);
        let validAccId: string | null = null;
        if (accId) {
          const accExists = await prisma.account.findUnique({ where: { id: accId } });
          if (accExists) validAccId = accExists.id;
        }

        const result = await prisma.debt.upsert({
          where: { id: debtId },
          create: {
            id: debtId,
            user_id: userId,
            type: data.type,
            person_name: data.person_name,
            phone_number: data.phone_number || null,
            total_amount: data.total_amount,
            paid_amount: data.paid_amount || 0,
            due_date: data.due_date ? new Date(data.due_date) : null,
            account_id: validAccId,
            notes: data.notes || null,
          },
          update: {
            type: data.type,
            person_name: data.person_name,
            phone_number: data.phone_number || null,
            total_amount: data.total_amount,
            paid_amount: data.paid_amount,
            due_date: data.due_date ? new Date(data.due_date) : null,
            account_id: validAccId,
            notes: data.notes || null,
          },
        });
        return NextResponse.json({ success: true, id: result.id });
      }

      case 'deleteDebt': {
        if (!id || !UUID_REGEX.test(id)) return NextResponse.json({ success: true });
        await prisma.debt.deleteMany({
          where: { id, user_id: userId },
        });
        return NextResponse.json({ success: true });
      }

      case 'recordDebtPayment': {
        const debtId = safeUuid(body.debtId);
        if (!debtId) return NextResponse.json({ error: 'Debt ID tidak valid' }, { status: 400 });

        const targetDebt = await prisma.debt.findUnique({ where: { id: debtId } });
        if (!targetDebt) return NextResponse.json({ error: 'Catatan utang/piutang tidak ditemukan' }, { status: 404 });

        const payment = body.payment;
        const paymentId = toValidUuid(payment.id);
        const accId = safeUuid(payment.account_id);
        let validAccId: string | null = null;
        if (accId) {
          const accExists = await prisma.account.findUnique({ where: { id: accId } });
          if (accExists) validAccId = accExists.id;
        }

        const newPayment = await prisma.debtPayment.create({
          data: {
            id: paymentId,
            debt_id: debtId,
            amount: payment.amount,
            payment_date: new Date(payment.payment_date),
            account_id: validAccId,
            notes: payment.notes || null,
          },
        });

        // Update paid_amount pada debt
        await prisma.debt.update({
          where: { id: debtId },
          data: {
            paid_amount: {
              increment: payment.amount,
            },
          },
        });

        return NextResponse.json({ success: true, id: newPayment.id });
      }

      default:
        return NextResponse.json({ error: `Aksi ${action} tidak dikenali.` }, { status: 400 });
    }
  } catch (error: unknown) {
    console.error('Error in sync mutation:', error);
    const msg = error instanceof Error ? error.message : 'Gagal memproses sinkronisasi data.';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
