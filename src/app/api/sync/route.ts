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

    let userAccounts = accounts;
    if (userAccounts.length === 0) {
      const defaultAccounts = [
        {
          user_id: userRecord.id,
          name: 'Kas Tunai',
          type: 'Uang Tunai',
          initial_balance: 0,
          currency: 'IDR',
          color: '#10b981',
          icon: 'Banknote',
          is_active: true,
        },
        {
          user_id: userRecord.id,
          name: 'Rekening Bank',
          type: 'Bank',
          initial_balance: 0,
          currency: 'IDR',
          color: '#3b82f6',
          icon: 'Landmark',
          is_active: true,
        },
      ];
      await prisma.account.createMany({
        data: defaultAccounts,
        skipDuplicates: true,
      });
      userAccounts = await prisma.account.findMany({
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
      accounts: userAccounts.map((acc) => ({
        id: acc.id,
        name: acc.name,
        type: acc.type,
        account_number: acc.account_number || undefined,
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
      // 0. BATCH SYNC: Migrasi seluruh data lokal ke PostgreSQL Supabase
      case 'batchSync': {
        const payload = data || {};
        const localAccounts = Array.isArray(payload.accounts) ? payload.accounts : [];
        const localCategories = Array.isArray(payload.categories) ? payload.categories : [];
        const localTransactions = Array.isArray(payload.transactions) ? payload.transactions : [];
        const localBudgets = Array.isArray(payload.budgets) ? payload.budgets : [];
        const localGoals = Array.isArray(payload.goals) ? payload.goals : [];
        const localDebts = Array.isArray(payload.debts) ? payload.debts : [];

        // 1. Kategorisasi: Ambil atau buat kategori di database
        let dbCategories = await prisma.category.findMany({
          where: { user_id: userId },
        });

        if (dbCategories.length === 0) {
          const defaultCategories = [
            { user_id: userId, name: 'Makanan', type: 'expense', icon: 'Utensils', color: '#f97316' },
            { user_id: userId, name: 'Transportasi', type: 'expense', icon: 'Car', color: '#0284c7' },
            { user_id: userId, name: 'Belanja', type: 'expense', icon: 'ShoppingBag', color: '#ec4899' },
            { user_id: userId, name: 'Tagihan', type: 'expense', icon: 'Receipt', color: '#8b5cf6' },
            { user_id: userId, name: 'Hiburan', type: 'expense', icon: 'Film', color: '#f43f5e' },
            { user_id: userId, name: 'Kesehatan', type: 'expense', icon: 'HeartPulse', color: '#10b981' },
            { user_id: userId, name: 'Pendidikan', type: 'expense', icon: 'GraduationCap', color: '#6366f1' },
            { user_id: userId, name: 'Perjalanan', type: 'expense', icon: 'Plane', color: '#eab308' },
            { user_id: userId, name: 'Langganan', type: 'expense', icon: 'CreditCard', color: '#64748b' },
            { user_id: userId, name: 'Lainnya', type: 'expense', icon: 'MoreHorizontal', color: '#94a3b8' },
            { user_id: userId, name: 'Gaji', type: 'income', icon: 'Briefcase', color: '#10b981' },
            { user_id: userId, name: 'Freelance', type: 'income', icon: 'Laptop', color: '#3b82f6' },
            { user_id: userId, name: 'Bisnis', type: 'income', icon: 'Store', color: '#8b5cf6' },
            { user_id: userId, name: 'Bonus', type: 'income', icon: 'Award', color: '#f59e0b' },
            { user_id: userId, name: 'Hadiah', type: 'income', icon: 'Gift', color: '#ec4899' },
            { user_id: userId, name: 'Investasi', type: 'income', icon: 'TrendingUp', color: '#059669' },
          ];
          await prisma.category.createMany({
            data: defaultCategories,
            skipDuplicates: true,
          });
          dbCategories = await prisma.category.findMany({
            where: { user_id: userId },
          });
        }

        const categoryMap = new Map<string, string>();
        for (const cat of dbCategories) {
          categoryMap.set(cat.id, cat.id);
          categoryMap.set(cat.name.toLowerCase().trim(), cat.id);
        }

        for (const localCat of localCategories) {
          const normName = localCat.name?.toLowerCase().trim();
          if (normName && !categoryMap.has(normName)) {
            const newCatId = toValidUuid(localCat.id);
            const created = await prisma.category.upsert({
              where: { id: newCatId },
              create: {
                id: newCatId,
                user_id: userId,
                name: localCat.name,
                type: localCat.type || 'expense',
                icon: localCat.icon || 'Tag',
                color: localCat.color || '#3b82f6',
              },
              update: {},
            });
            categoryMap.set(localCat.id, created.id);
            categoryMap.set(normName, created.id);
          }
        }

        // 2. Rekening: Ambil atau sinkronkan rekening
        let dbAccounts = await prisma.account.findMany({
          where: { user_id: userId },
        });

        const accountMap = new Map<string, string>();
        for (const acc of dbAccounts) {
          accountMap.set(acc.id, acc.id);
          accountMap.set(acc.name.toLowerCase().trim(), acc.id);
        }

        for (const localAcc of localAccounts) {
          if (!localAcc.name) continue;
          let targetAccId = safeUuid(localAcc.id);
          const existingByName = accountMap.get(localAcc.name.toLowerCase().trim());

          if (existingByName) {
            targetAccId = existingByName;
          } else if (!targetAccId) {
            targetAccId = crypto.randomUUID();
          }

          const upserted = await prisma.account.upsert({
            where: { id: targetAccId },
            create: {
              id: targetAccId,
              user_id: userId,
              name: localAcc.name,
              type: localAcc.type || 'Bank',
              account_number: localAcc.account_number || null,
              initial_balance: localAcc.initial_balance || 0,
              currency: localAcc.currency || 'IDR',
              color: localAcc.color || '#3b82f6',
              icon: localAcc.icon || 'Wallet',
              is_active: localAcc.is_active ?? true,
            },
            update: {
              name: localAcc.name,
              type: localAcc.type || 'Bank',
              account_number: localAcc.account_number || null,
              initial_balance: localAcc.initial_balance ?? undefined,
            },
          });

          accountMap.set(localAcc.id, upserted.id);
          accountMap.set(localAcc.name.toLowerCase().trim(), upserted.id);
        }

        // Pastikan minimal ada rekening default jika masih 0
        dbAccounts = await prisma.account.findMany({
          where: { user_id: userId },
        });

        if (dbAccounts.length === 0) {
          const defaultAccounts = [
            {
              user_id: userId,
              name: 'Kas Tunai',
              type: 'Uang Tunai',
              initial_balance: 0,
              currency: 'IDR',
              color: '#10b981',
              icon: 'Banknote',
              is_active: true,
            },
            {
              user_id: userId,
              name: 'Rekening Bank',
              type: 'Bank',
              initial_balance: 0,
              currency: 'IDR',
              color: '#3b82f6',
              icon: 'Landmark',
              is_active: true,
            },
          ];
          await prisma.account.createMany({
            data: defaultAccounts,
            skipDuplicates: true,
          });
          dbAccounts = await prisma.account.findMany({
            where: { user_id: userId },
          });
          for (const acc of dbAccounts) {
            accountMap.set(acc.id, acc.id);
            accountMap.set(acc.name.toLowerCase().trim(), acc.id);
          }
        }

        const fallbackAccountId = dbAccounts[0].id;

        // 3. Transaksi: Simpan seluruh mutasi transaksi lokal
        for (const tx of localTransactions) {
          const txId = toValidUuid(tx.id);
          const rawSourceId = tx.account_id;
          const mappedSourceId = (rawSourceId && accountMap.get(rawSourceId)) || safeUuid(rawSourceId) || fallbackAccountId;

          const rawDestId = tx.destination_account_id;
          const mappedDestId = rawDestId ? ((accountMap.get(rawDestId) || safeUuid(rawDestId)) ?? null) : null;

          const rawCatId = tx.category_id;
          const mappedCatId = rawCatId ? ((categoryMap.get(rawCatId) || safeUuid(rawCatId)) ?? null) : null;

          await prisma.transaction.upsert({
            where: { id: txId },
            create: {
              id: txId,
              user_id: userId,
              type: tx.type || 'expense',
              amount: tx.amount || 0,
              account_id: mappedSourceId,
              destination_account_id: mappedDestId,
              category_id: mappedCatId,
              description: tx.description || 'Transaksi',
              date: tx.date ? new Date(tx.date) : new Date(),
              notes: tx.notes || null,
            },
            update: {
              type: tx.type,
              amount: tx.amount,
              account_id: mappedSourceId,
              destination_account_id: mappedDestId,
              category_id: mappedCatId,
              description: tx.description,
              date: tx.date ? new Date(tx.date) : undefined,
              notes: tx.notes || null,
            },
          });
        }

        // 4. Anggaran (Budgets)
        for (const b of localBudgets) {
          const bId = toValidUuid(b.id);
          const mappedCatId = categoryMap.get(b.category_id) || safeUuid(b.category_id);
          if (mappedCatId) {
            await prisma.budget.upsert({
              where: { id: bId },
              create: {
                id: bId,
                user_id: userId,
                category_id: mappedCatId,
                amount: b.amount,
                month: b.month,
              },
              update: {
                amount: b.amount,
                month: b.month,
              },
            });
          }
        }

        // 5. Target Tabungan (Goals)
        for (const g of localGoals) {
          const gId = toValidUuid(g.id);
          await prisma.goal.upsert({
            where: { id: gId },
            create: {
              id: gId,
              user_id: userId,
              name: g.name,
              target_amount: g.target_amount,
              current_amount: g.current_amount || 0,
              target_date: g.target_date ? new Date(g.target_date) : null,
              description: g.description || null,
            },
            update: {
              name: g.name,
              target_amount: g.target_amount,
              current_amount: g.current_amount,
              target_date: g.target_date ? new Date(g.target_date) : null,
              description: g.description || null,
            },
          });
        }

        // 6. Utang & Piutang (Debts)
        for (const d of localDebts) {
          const dId = toValidUuid(d.id);
          const mappedAccId = d.account_id ? (accountMap.get(d.account_id) || safeUuid(d.account_id) || null) : null;
          await prisma.debt.upsert({
            where: { id: dId },
            create: {
              id: dId,
              user_id: userId,
              type: d.type || 'debt',
              person_name: d.person_name,
              phone_number: d.phone_number || null,
              total_amount: d.total_amount,
              paid_amount: d.paid_amount || 0,
              due_date: d.due_date ? new Date(d.due_date) : null,
              account_id: mappedAccId,
              notes: d.notes || null,
            },
            update: {
              person_name: d.person_name,
              phone_number: d.phone_number || null,
              total_amount: d.total_amount,
              paid_amount: d.paid_amount,
              due_date: d.due_date ? new Date(d.due_date) : null,
              account_id: mappedAccId,
              notes: d.notes || null,
            },
          });

          if (Array.isArray(d.payments)) {
            for (const p of d.payments) {
              const pId = toValidUuid(p.id);
              const pAccId = p.account_id ? (accountMap.get(p.account_id) || safeUuid(p.account_id) || null) : null;
              await prisma.debtPayment.upsert({
                where: { id: pId },
                create: {
                  id: pId,
                  debt_id: dId,
                  amount: p.amount,
                  payment_date: p.payment_date ? new Date(p.payment_date) : new Date(),
                  account_id: pAccId,
                  notes: p.notes || null,
                },
                update: {
                  amount: p.amount,
                  payment_date: p.payment_date ? new Date(p.payment_date) : undefined,
                  account_id: pAccId,
                  notes: p.notes || null,
                },
              });
            }
          }
        }

        // Ambil data lengkap yang sudah tersimpan di database
        const [freshAccounts, freshCategories, freshTransactions, freshBudgets, freshGoals, freshDebts] = await Promise.all([
          prisma.account.findMany({ where: { user_id: userId }, orderBy: { created_at: 'asc' } }),
          prisma.category.findMany({ where: { user_id: userId }, orderBy: { created_at: 'asc' } }),
          prisma.transaction.findMany({ where: { user_id: userId }, orderBy: { date: 'desc' } }),
          prisma.budget.findMany({ where: { user_id: userId } }),
          prisma.goal.findMany({ where: { user_id: userId }, orderBy: { created_at: 'asc' } }),
          prisma.debt.findMany({
            where: { user_id: userId },
            include: { payments: { orderBy: { payment_date: 'asc' } } },
            orderBy: { created_at: 'desc' },
          }),
        ]);

        return NextResponse.json({
          success: true,
          message: 'Seluruh data berhasil disinkronkan ke database cloud Supabase.',
          accounts: freshAccounts.map((acc) => ({
            id: acc.id,
            name: acc.name,
            type: acc.type,
            account_number: acc.account_number || undefined,
            initial_balance: Number(acc.initial_balance),
            currency: acc.currency,
            color: acc.color || '#3b82f6',
            icon: acc.icon || 'Wallet',
            is_active: acc.is_active,
            created_at: acc.created_at.toISOString(),
            updated_at: acc.updated_at.toISOString(),
          })),
          categories: freshCategories.map((cat) => ({
            id: cat.id,
            name: cat.name,
            type: cat.type as 'income' | 'expense',
            icon: cat.icon || 'Tag',
            color: cat.color || '#3b82f6',
            is_active: cat.is_active,
            created_at: cat.created_at.toISOString(),
            updated_at: cat.updated_at.toISOString(),
          })),
          transactions: freshTransactions.map((tx) => ({
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
          budgets: freshBudgets.map((b) => ({
            id: b.id,
            category_id: b.category_id,
            amount: Number(b.amount),
            month: b.month,
            created_at: b.created_at.toISOString(),
            updated_at: b.updated_at.toISOString(),
          })),
          goals: freshGoals.map((g) => ({
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
          debts: freshDebts.map((d) => ({
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
      }

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
            account_number: data.account_number || null,
            initial_balance: data.initial_balance || 0,
            currency: data.currency || 'IDR',
            color: data.color || '#3b82f6',
            icon: data.icon || 'Wallet',
            is_active: data.is_active ?? true,
          },
          update: {
            name: data.name,
            type: data.type,
            account_number: data.account_number || null,
            initial_balance: data.initial_balance,
            currency: data.currency,
            color: data.color,
            icon: data.icon,
            is_active: data.is_active,
          },
        });
        return NextResponse.json({
          success: true,
          id: result.id,
          account: {
            id: result.id,
            name: result.name,
            type: result.type,
            account_number: result.account_number || undefined,
            initial_balance: Number(result.initial_balance),
            currency: result.currency,
            color: result.color || '#3b82f6',
            icon: result.icon || 'Wallet',
            is_active: result.is_active,
            created_at: result.created_at.toISOString(),
            updated_at: result.updated_at.toISOString(),
          },
        });
      }

      case 'deleteAccount': {
        if (!id || !UUID_REGEX.test(id)) return NextResponse.json({ success: true });
        await prisma.account.deleteMany({
          where: { id, user_id: userId },
        });
        return NextResponse.json({ success: true, id });
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
        return NextResponse.json({
          success: true,
          id: result.id,
          category: {
            id: result.id,
            name: result.name,
            type: result.type,
            icon: result.icon || 'Tag',
            color: result.color || '#3b82f6',
            is_active: result.is_active,
            created_at: result.created_at.toISOString(),
            updated_at: result.updated_at.toISOString(),
          },
        });
      }

      case 'deleteCategory': {
        if (!id || !UUID_REGEX.test(id)) return NextResponse.json({ success: true });
        await prisma.category.deleteMany({
          where: { id, user_id: userId },
        });
        return NextResponse.json({ success: true, id });
      }

      // 3. TRANSACTIONS
      case 'upsertTransaction': {
        const txId = toValidUuid(data.id);
        let sourceAccId = safeUuid(data.account_id);
        let sourceExists = sourceAccId ? await prisma.account.findUnique({ where: { id: sourceAccId } }) : null;

        if (!sourceExists) {
          // Cari rekening user yang tersedia di database
          const fallbackAcc = await prisma.account.findFirst({ where: { user_id: userId } });
          if (!fallbackAcc) {
            return NextResponse.json({ error: 'Anda belum memiliki rekening di database. Silakan buat rekening terlebih dahulu di menu Rekening.' }, { status: 400 });
          }
          sourceAccId = fallbackAcc.id;
          sourceExists = fallbackAcc;
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
            account_id: sourceAccId!,
            destination_account_id: validDestAccId,
            category_id: validCatId,
            description: data.description,
            date: new Date(data.date),
            notes: data.notes || null,
          },
          update: {
            type: data.type,
            amount: data.amount,
            account_id: sourceAccId!,
            destination_account_id: validDestAccId,
            category_id: validCatId,
            description: data.description,
            date: new Date(data.date),
            notes: data.notes || null,
          },
        });

        return NextResponse.json({
          success: true,
          id: result.id,
          transaction: {
            id: result.id,
            type: result.type,
            amount: Number(result.amount),
            account_id: result.account_id,
            destination_account_id: result.destination_account_id || undefined,
            category_id: result.category_id || undefined,
            description: result.description,
            date: result.date instanceof Date ? result.date.toISOString().split('T')[0] : String(result.date).split('T')[0],
            notes: result.notes || undefined,
            created_at: result.created_at.toISOString(),
            updated_at: result.updated_at.toISOString(),
          },
        });
      }

      case 'deleteTransaction': {
        if (!id || !UUID_REGEX.test(id)) return NextResponse.json({ success: true });
        await prisma.transaction.deleteMany({
          where: { id, user_id: userId },
        });
        return NextResponse.json({ success: true, id });
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
        return NextResponse.json({
          success: true,
          id: result.id,
          budget: {
            id: result.id,
            category_id: result.category_id,
            amount: Number(result.amount),
            month: result.month,
            created_at: result.created_at.toISOString(),
            updated_at: result.updated_at.toISOString(),
          },
        });
      }

      case 'deleteBudget': {
        if (!id || !UUID_REGEX.test(id)) return NextResponse.json({ success: true });
        await prisma.budget.deleteMany({
          where: { id, user_id: userId },
        });
        return NextResponse.json({ success: true, id });
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
        return NextResponse.json({
          success: true,
          id: result.id,
          goal: {
            id: result.id,
            name: result.name,
            target_amount: Number(result.target_amount),
            current_amount: Number(result.current_amount),
            target_date: result.target_date ? (result.target_date instanceof Date ? result.target_date.toISOString().split('T')[0] : String(result.target_date).split('T')[0]) : '',
            description: result.description || undefined,
            color: '#10b981',
            icon: 'Target',
            created_at: result.created_at.toISOString(),
            updated_at: result.updated_at.toISOString(),
          },
        });
      }

      case 'deleteGoal': {
        if (!id || !UUID_REGEX.test(id)) return NextResponse.json({ success: true });
        await prisma.goal.deleteMany({
          where: { id, user_id: userId },
        });
        return NextResponse.json({ success: true, id });
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
          include: {
            payments: {
              orderBy: { payment_date: 'asc' },
            },
          },
        });

        return NextResponse.json({
          success: true,
          id: result.id,
          debt: {
            id: result.id,
            type: result.type,
            person_name: result.person_name,
            phone_number: result.phone_number || undefined,
            total_amount: Number(result.total_amount),
            paid_amount: Number(result.paid_amount),
            due_date: result.due_date ? (result.due_date instanceof Date ? result.due_date.toISOString().split('T')[0] : String(result.due_date).split('T')[0]) : undefined,
            account_id: result.account_id || undefined,
            notes: result.notes || undefined,
            created_at: result.created_at.toISOString(),
            updated_at: result.updated_at.toISOString(),
            payments: (result.payments || []).map((p) => ({
              id: p.id,
              debt_id: p.debt_id,
              amount: Number(p.amount),
              payment_date: p.payment_date instanceof Date ? p.payment_date.toISOString().split('T')[0] : String(p.payment_date).split('T')[0],
              account_id: p.account_id || undefined,
              notes: p.notes || undefined,
              created_at: p.created_at.toISOString(),
            })),
          },
        });
      }

      case 'deleteDebt': {
        if (!id || !UUID_REGEX.test(id)) return NextResponse.json({ success: true });
        await prisma.debt.deleteMany({
          where: { id, user_id: userId },
        });
        return NextResponse.json({ success: true, id });
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

        // Update paid_amount pada debt dan ambil data utang lengkap terkini
        const updatedDebt = await prisma.debt.update({
          where: { id: debtId },
          data: {
            paid_amount: {
              increment: payment.amount,
            },
          },
          include: {
            payments: {
              orderBy: { payment_date: 'asc' },
            },
          },
        });

        return NextResponse.json({
          success: true,
          id: newPayment.id,
          debt: {
            id: updatedDebt.id,
            type: updatedDebt.type,
            person_name: updatedDebt.person_name,
            phone_number: updatedDebt.phone_number || undefined,
            total_amount: Number(updatedDebt.total_amount),
            paid_amount: Number(updatedDebt.paid_amount),
            due_date: updatedDebt.due_date ? (updatedDebt.due_date instanceof Date ? updatedDebt.due_date.toISOString().split('T')[0] : String(updatedDebt.due_date).split('T')[0]) : undefined,
            account_id: updatedDebt.account_id || undefined,
            notes: updatedDebt.notes || undefined,
            created_at: updatedDebt.created_at.toISOString(),
            updated_at: updatedDebt.updated_at.toISOString(),
            payments: (updatedDebt.payments || []).map((p) => ({
              id: p.id,
              debt_id: p.debt_id,
              amount: Number(p.amount),
              payment_date: p.payment_date instanceof Date ? p.payment_date.toISOString().split('T')[0] : String(p.payment_date).split('T')[0],
              account_id: p.account_id || undefined,
              notes: p.notes || undefined,
              created_at: p.created_at.toISOString(),
            })),
          },
        });
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
