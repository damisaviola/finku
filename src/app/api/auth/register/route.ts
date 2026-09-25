import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import type { Account } from '@prisma/client';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { formatUserFriendlyError } from '@/lib/utils/error-handler';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    // 1. Validasi Input
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json(
        { error: 'Nama lengkap wajib diisi minimal 2 karakter.' },
        { status: 400 }
      );
    }

    if (!email || typeof email !== 'string' || !/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json(
        { error: 'Format alamat email tidak valid.' },
        { status: 400 }
      );
    }

    if (!password || typeof password !== 'string' || password.length < 8) {
      return NextResponse.json(
        { error: 'Kata sandi minimal 8 karakter.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    // 2. Cek apakah user sudah ada di database public.users
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Alamat email ini sudah terdaftar. Silakan masuk menggunakan akun Anda.' },
        { status: 409 }
      );
    }

    let authUserId: string | null = null;

    // 3. Daftarkan juga ke Supabase Auth jika konfigurasi Supabase tersedia
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: normalizedEmail,
          password: password,
          options: {
            data: {
              full_name: cleanName,
              name: cleanName,
            },
          },
        });

        if (authError) {
          console.warn('Supabase Auth warning during signup:', authError.message);
          // Jika Supabase Auth mengembalikan error karena sudah terdaftar di auth.users
          if (authError.message.toLowerCase().includes('already registered')) {
            return NextResponse.json(
              { error: 'Akun dengan email ini sudah terdaftar di otentikasi. Silakan masuk.' },
              { status: 409 }
            );
          }
        } else if (authData?.user?.id) {
          authUserId = authData.user.id;
        }
      } catch (err) {
        console.warn('Supabase Auth signup call exception:', err);
      }
    }

    // 4. Buat / Simpan akun pengguna ke tabel public.users melalui Prisma
    const userId = authUserId || crypto.randomUUID();

    const newUser = await prisma.user.upsert({
      where: { email: normalizedEmail },
      create: {
        id: userId,
        email: normalizedEmail,
        name: cleanName,
        avatar_url: null,
      },
      update: {
        name: cleanName,
      },
    });

    // 5. Inisialisasi kategori dasar untuk pengguna baru jika belum ada
    const defaultCategories = [
      { user_id: newUser.id, name: 'Makanan', type: 'expense', icon: 'Utensils', color: '#f97316' },
      { user_id: newUser.id, name: 'Transportasi', type: 'expense', icon: 'Car', color: '#0284c7' },
      { user_id: newUser.id, name: 'Belanja', type: 'expense', icon: 'ShoppingBag', color: '#ec4899' },
      { user_id: newUser.id, name: 'Tagihan', type: 'expense', icon: 'Receipt', color: '#8b5cf6' },
      { user_id: newUser.id, name: 'Hiburan', type: 'expense', icon: 'Film', color: '#f43f5e' },
      { user_id: newUser.id, name: 'Kesehatan', type: 'expense', icon: 'HeartPulse', color: '#10b981' },
      { user_id: newUser.id, name: 'Pendidikan', type: 'expense', icon: 'GraduationCap', color: '#6366f1' },
      { user_id: newUser.id, name: 'Perjalanan', type: 'expense', icon: 'Plane', color: '#eab308' },
      { user_id: newUser.id, name: 'Langganan', type: 'expense', icon: 'CreditCard', color: '#64748b' },
      { user_id: newUser.id, name: 'Lainnya', type: 'expense', icon: 'MoreHorizontal', color: '#94a3b8' },
      { user_id: newUser.id, name: 'Gaji', type: 'income', icon: 'Briefcase', color: '#10b981' },
      { user_id: newUser.id, name: 'Freelance', type: 'income', icon: 'Laptop', color: '#3b82f6' },
      { user_id: newUser.id, name: 'Bisnis', type: 'income', icon: 'Store', color: '#8b5cf6' },
      { user_id: newUser.id, name: 'Bonus', type: 'income', icon: 'Award', color: '#f59e0b' },
      { user_id: newUser.id, name: 'Hadiah', type: 'income', icon: 'Gift', color: '#ec4899' },
      { user_id: newUser.id, name: 'Investasi', type: 'income', icon: 'TrendingUp', color: '#059669' },
    ];

    await prisma.category.createMany({
      data: defaultCategories,
      skipDuplicates: true,
    });

    const userCategories = await prisma.category.findMany({
      where: { user_id: newUser.id },
      orderBy: { created_at: 'asc' },
    });

    // 6. Inisialisasi rekening dasar untuk pengguna baru (Kas Tunai & Rekening Bank)
    const defaultAccounts = [
      {
        user_id: newUser.id,
        name: 'Kas Tunai',
        type: 'Uang Tunai',
        initial_balance: 0,
        currency: 'IDR',
        color: '#10b981',
        icon: 'Banknote',
        is_active: true,
      },
      {
        user_id: newUser.id,
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

    const userAccounts = await prisma.account.findMany({
      where: { user_id: newUser.id },
      orderBy: { created_at: 'asc' },
    });

    return NextResponse.json({
      success: true,
      message: 'Pendaftaran berhasil! Akun Anda telah disimpan di database Supabase.',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        avatar_url: newUser.avatar_url,
        provider: 'email',
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
        type: cat.type,
        icon: cat.icon || 'Tag',
        color: cat.color || '#3b82f6',
        is_active: cat.is_active,
        created_at: cat.created_at.toISOString(),
        updated_at: cat.updated_at.toISOString(),
      })),
      transactions: [],
      budgets: [],
      goals: [],
      debts: [],
    });
  } catch (error: unknown) {
    console.error('Error during user registration:', error);
    const friendlyMsg = formatUserFriendlyError(
      error,
      'Terjadi kesalahan pada server saat pendaftaran akun. Silakan coba kembali.'
    );
    return NextResponse.json({ error: friendlyMsg }, { status: 500 });
  }
}
