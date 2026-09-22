import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { Account } from '@prisma/client';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

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
          include: { accounts: true },
        });

        if (dbUser) {
          return NextResponse.json({
            success: true,
            user: {
              id: dbUser.id,
              name: dbUser.name,
              email: dbUser.email,
              avatar_url: dbUser.avatar_url,
              provider: 'email',
            },
            accounts: dbUser.accounts.map((acc: Account) => ({
              id: acc.id,
              name: acc.name,
              type: acc.type,
              balance: Number(acc.initial_balance),
              color: acc.color || '#3b82f6',
            })),
          });
        }
      } else if (authError) {
        // Jika Supabase Auth menolak kredensial
        console.warn('Supabase Auth signIn error:', authError.message);
      }
    }

    // 2. Jika Supabase Auth belum mengonfirmasi email atau fallback ke database Prisma
    const dbUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: { accounts: true },
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: 'Email atau kata sandi tidak sesuai, atau akun belum terdaftar.' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        avatar_url: dbUser.avatar_url,
        provider: 'email',
      },
      accounts: dbUser.accounts.map((acc: Account) => ({
        id: acc.id,
        name: acc.name,
        type: acc.type,
        balance: Number(acc.initial_balance),
        color: acc.color || '#3b82f6',
      })),
    });
  } catch (error: unknown) {
    console.error('Error during login:', error);
    const msg = error instanceof Error ? error.message : 'Terjadi kesalahan pada server saat masuk.';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
