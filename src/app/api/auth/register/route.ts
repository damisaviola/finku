import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import type { Account } from '@prisma/client';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

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

    // 5. Inisialisasi rekening awal default untuk pengguna baru jika belum ada
    const defaultAccounts = [
      {
        user_id: newUser.id,
        name: 'Kas Tunai',
        type: 'Uang Tunai',
        initial_balance: 0,
        currency: 'IDR',
        color: '#10b981',
      },
      {
        user_id: newUser.id,
        name: 'Rekening Bank',
        type: 'Bank',
        initial_balance: 0,
        currency: 'IDR',
        color: '#3b82f6',
      },
    ];

    await prisma.account.createMany({
      data: defaultAccounts,
      skipDuplicates: true,
    });

    // 6. Inisialisasi kategori dasar untuk pengguna baru jika belum ada
    const defaultCategories = [
      { user_id: newUser.id, name: 'Makanan & Minuman', type: 'expense', color: '#ef4444' },
      { user_id: newUser.id, name: 'Transportasi', type: 'expense', color: '#f59e0b' },
      { user_id: newUser.id, name: 'Belanja & Kebutuhan', type: 'expense', color: '#ec4899' },
      { user_id: newUser.id, name: 'Gaji & Pendapatan', type: 'income', color: '#10b981' },
      { user_id: newUser.id, name: 'Investasi & Bonus', type: 'income', color: '#8b5cf6' },
    ];

    await prisma.category.createMany({
      data: defaultCategories,
      skipDuplicates: true,
    });

    // Ambil data rekening yang baru dibuat untuk dikembalikan ke klien
    const createdAccounts = await prisma.account.findMany({
      where: { user_id: newUser.id },
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
      accounts: createdAccounts.map((acc: Account) => ({
        id: acc.id,
        name: acc.name,
        type: acc.type,
        balance: Number(acc.initial_balance),
        color: acc.color || '#3b82f6',
      })),
    });
  } catch (error: unknown) {
    console.error('Error during user registration:', error);
    const msg = error instanceof Error ? error.message : 'Terjadi kesalahan pada server saat pendaftaran.';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
