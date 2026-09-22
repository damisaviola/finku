import { prisma } from '../src/lib/prisma';
import crypto from 'crypto';

async function verify() {
  console.log('=== TEST VERIFIKASI PENDAFTARAN KE DATABASE SUPABASE ===');

  const testEmail = `verif_${Date.now()}@example.org`;
  const testName = 'Pengguna Uji Registrasi';
  const testId = crypto.randomUUID();

  console.log(`1. Mendaftarkan user baru: ${testName} (${testEmail})`);

  // Simulasi logika /api/auth/register
  const createdUser = await prisma.user.upsert({
    where: { email: testEmail },
    create: {
      id: testId,
      email: testEmail,
      name: testName,
      avatar_url: null,
    },
    update: {
      name: testName,
    },
  });

  console.log('✅ User berhasil disimpan ke tabel public.users:', createdUser.id);

  // Buat default accounts
  await prisma.account.createMany({
    data: [
      { user_id: createdUser.id, name: 'Kas Tunai', type: 'Uang Tunai', initial_balance: 0, color: '#10b981' },
      { user_id: createdUser.id, name: 'Rekening Bank', type: 'Bank', initial_balance: 0, color: '#3b82f6' },
    ],
    skipDuplicates: true,
  });

  const accounts = await prisma.account.findMany({
    where: { user_id: createdUser.id },
  });

  console.log(`✅ Rekening default dibuat di tabel public.accounts: ${accounts.length} rekening`);

  // Buat default categories
  await prisma.category.createMany({
    data: [
      { user_id: createdUser.id, name: 'Makanan & Minuman', type: 'expense', color: '#ef4444' },
      { user_id: createdUser.id, name: 'Transportasi', type: 'expense', color: '#f59e0b' },
      { user_id: createdUser.id, name: 'Gaji & Pendapatan', type: 'income', color: '#10b981' },
    ],
    skipDuplicates: true,
  });

  const categories = await prisma.category.findMany({
    where: { user_id: createdUser.id },
  });

  console.log(`✅ Kategori default dibuat di tabel public.categories: ${categories.length} kategori`);

  // Verifikasi query relasi
  const userWithRelations = await prisma.user.findUnique({
    where: { id: createdUser.id },
    include: { accounts: true, categories: true },
  });

  if (!userWithRelations || userWithRelations.accounts.length !== 2 || userWithRelations.categories.length !== 3) {
    throw new Error('Verifikasi gagal: relasi data tidak lengkap di database Supabase!');
  }

  console.log('✅ Verifikasi relasi user, accounts, dan categories 100% LULUS!');

  // Cleanup
  await prisma.user.delete({ where: { id: createdUser.id } });
  console.log('🧹 Berhasil membersihkan user uji coba dari database.');

  console.log('🎉 SEMUA PENGUJIAN PENYIMPANAN KE DATABASE SUPABASE BERHASIL 100%!');
}

verify()
  .catch((err) => {
    console.error('❌ Error during verification:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
