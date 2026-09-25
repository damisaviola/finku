import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { Account } from '@prisma/client';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { formatUserFriendlyError } from '@/lib/utils/error-handler';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || typeof email !== 'string' || !/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json(
        { error: 'Format alamat email tidak valid.' },
        { status: 400 }
      );
    }

    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Kata sandi wajib diisi.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    const userInclude = {
      accounts: true,
      categories: true,
      transactions: true,
      budgets: true,
      goals: true,
      debts: {
        include: {
          payments: {
            orderBy: { payment_date: 'asc' as const },
          },
        },
        orderBy: { created_at: 'desc' as const },
      },
    };

    const formatResponse = (userRecord: any) => ({
      success: true,
      user: {
        id: userRecord.id,
        name: userRecord.name,
        email: userRecord.email,
        avatar_url: userRecord.avatar_url,
        provider: 'email',
      },
      accounts: userRecord.accounts.map((acc: any) => ({
        id: acc.id,
        name: acc.name,
        type: acc.type,
        account_number: acc.account_number || undefined,
        initial_balance: Number(acc.initial_balance),
        currency: acc.currency || 'IDR',
        color: acc.color || '#3b82f6',
        icon: acc.icon || 'Wallet',
        is_active: acc.is_active ?? true,
        created_at: acc.created_at instanceof Date ? acc.created_at.toISOString() : acc.created_at,
        updated_at: acc.updated_at instanceof Date ? acc.updated_at.toISOString() : acc.updated_at,
      })),
      categories: userRecord.categories.map((cat: any) => ({
        id: cat.id,
        name: cat.name,
        type: cat.type,
        icon: cat.icon || 'Tag',
        color: cat.color || '#3b82f6',
        is_active: cat.is_active ?? true,
        created_at: cat.created_at instanceof Date ? cat.created_at.toISOString() : cat.created_at,
        updated_at: cat.updated_at instanceof Date ? cat.updated_at.toISOString() : cat.updated_at,
      })),
      transactions: userRecord.transactions.map((tx: any) => ({
        id: tx.id,
        type: tx.type,
        amount: Number(tx.amount),
        account_id: tx.account_id,
        destination_account_id: tx.destination_account_id || undefined,
        category_id: tx.category_id || undefined,
        description: tx.description,
        date: tx.date instanceof Date ? tx.date.toISOString().split('T')[0] : String(tx.date).split('T')[0],
        notes: tx.notes || undefined,
        created_at: tx.created_at instanceof Date ? tx.created_at.toISOString() : tx.created_at,
        updated_at: tx.updated_at instanceof Date ? tx.updated_at.toISOString() : tx.updated_at,
      })),
      budgets: userRecord.budgets.map((b: any) => ({
        id: b.id,
        category_id: b.category_id,
        amount: Number(b.amount),
        month: b.month,
        created_at: b.created_at instanceof Date ? b.created_at.toISOString() : b.created_at,
        updated_at: b.updated_at instanceof Date ? b.updated_at.toISOString() : b.updated_at,
      })),
      goals: userRecord.goals.map((g: any) => ({
        id: g.id,
        name: g.name,
        target_amount: Number(g.target_amount),
        current_amount: Number(g.current_amount),
        target_date: g.target_date ? (g.target_date instanceof Date ? g.target_date.toISOString().split('T')[0] : String(g.target_date).split('T')[0]) : '',
        description: g.description || undefined,
        color: '#10b981',
        icon: 'Target',
        created_at: g.created_at instanceof Date ? g.created_at.toISOString() : g.created_at,
        updated_at: g.updated_at instanceof Date ? g.updated_at.toISOString() : g.updated_at,
      })),
      debts: (userRecord.debts || []).map((d: any) => ({
        id: d.id,
        type: d.type,
        person_name: d.person_name,
        phone_number: d.phone_number || undefined,
        total_amount: Number(d.total_amount),
        paid_amount: Number(d.paid_amount),
        due_date: d.due_date ? (d.due_date instanceof Date ? d.due_date.toISOString().split('T')[0] : String(d.due_date).split('T')[0]) : undefined,
        account_id: d.account_id || undefined,
        notes: d.notes || undefined,
        created_at: d.created_at instanceof Date ? d.created_at.toISOString() : d.created_at,
        updated_at: d.updated_at instanceof Date ? d.updated_at.toISOString() : d.updated_at,
        payments: (d.payments || []).map((p: any) => ({
          id: p.id,
          debt_id: p.debt_id,
          amount: Number(p.amount),
          payment_date: p.payment_date instanceof Date ? p.payment_date.toISOString().split('T')[0] : String(p.payment_date).split('T')[0],
          account_id: p.account_id || undefined,
          notes: p.notes || undefined,
          created_at: p.created_at instanceof Date ? p.created_at.toISOString() : p.created_at,
        })),
      })),
    });

    // 1. Coba otentikasi via Supabase Auth jika dikonfigurasi
    if (isSupabaseConfigured && supabase) {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password: password,
      });

      if (!authError && authData?.user) {
        // Cari data profil di tabel public.users
        const dbUser = await prisma.user.findUnique({
          where: { email: normalizedEmail },
          include: userInclude,
        });

        if (dbUser) {
          return NextResponse.json(formatResponse(dbUser));
        }
      } else if (authError) {
        // Jika Supabase Auth menolak kredensial
        console.warn('Supabase Auth signIn error:', authError.message);
      }
    }

    // 2. Jika Supabase Auth belum mengonfirmasi email atau fallback ke database Prisma
    const dbUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: userInclude,
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: 'Email atau kata sandi tidak sesuai, atau akun belum terdaftar.' },
        { status: 401 }
      );
    }

    return NextResponse.json(formatResponse(dbUser));
  } catch (error: unknown) {
    console.error('Error during login:', error);
    const friendlyMsg = formatUserFriendlyError(
      error,
      'Terjadi kesalahan pada server saat masuk ke akun. Silakan coba kembali.'
    );
    return NextResponse.json({ error: friendlyMsg }, { status: 500 });
  }
}
