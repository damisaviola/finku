import { z } from 'zod';

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Nama lengkap wajib diisi.')
      .min(2, 'Nama lengkap minimal 2 karakter.')
      .max(100, 'Nama lengkap maksimal 100 karakter.'),
    email: z
      .string()
      .min(1, 'Alamat email wajib diisi.')
      .email('Masukkan alamat email yang valid.'),
    password: z
      .string()
      .min(1, 'Kata sandi wajib diisi.')
      .min(8, 'Kata sandi minimal 8 karakter.'),
    confirmPassword: z.string().min(1, 'Konfirmasi kata sandi wajib diisi.'),
    terms: z.boolean().refine((val) => val === true, {
      message: 'Anda harus menyetujui syarat dan ketentuan.',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Konfirmasi kata sandi tidak cocok.',
    path: ['confirmPassword'],
  });

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Alamat email wajib diisi.')
    .email('Masukkan alamat email yang valid.'),
  password: z.string().min(1, 'Kata sandi wajib diisi.'),
});

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Alamat email wajib diisi.')
    .email('Masukkan alamat email yang valid.'),
});

export const accountSchema = z.object({
  name: z.string().min(1, 'Nama rekening wajib diisi.'),
  type: z.enum(['Bank', 'Uang Tunai', 'Dompet Digital', 'Tabungan', 'Lainnya'], {
    error: 'Silakan pilih jenis rekening yang valid.',
  }),
  initial_balance: z
    .number({ message: 'Saldo awal harus berupa angka.' })
    .min(0, 'Saldo awal tidak boleh negatif.'),
  currency: z.string().default('IDR'),
  color: z.string().optional(),
});

export const transactionSchema = z
  .object({
    type: z.enum(['income', 'expense', 'transfer']),
    amount: z
      .number({ message: 'Jumlah harus berupa angka.' })
      .gt(0, 'Jumlah harus lebih besar dari nol.'),
    account_id: z.string().min(1, 'Silakan pilih rekening.'),
    destination_account_id: z.string().optional().nullable(),
    category_id: z.string().optional().nullable(),
    description: z.string().min(1, 'Keterangan transaksi wajib diisi.'),
    date: z.string().min(1, 'Silakan pilih tanggal.'),
    notes: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.type === 'transfer') {
        return (
          data.destination_account_id &&
          data.destination_account_id !== data.account_id
        );
      }
      return true;
    },
    {
      message: 'Rekening asal dan rekening tujuan tidak boleh sama.',
      path: ['destination_account_id'],
    }
  )
  .refine(
    (data) => {
      if (data.type !== 'transfer') {
        return !!data.category_id;
      }
      return true;
    },
    {
      message: 'Silakan pilih kategori.',
      path: ['category_id'],
    }
  );

export const budgetSchema = z.object({
  category_id: z.string().min(1, 'Silakan pilih kategori.'),
  amount: z
    .number({ message: 'Jumlah anggaran harus berupa angka.' })
    .gt(0, 'Jumlah harus lebih besar dari nol.'),
  month: z.string().min(1, 'Silakan pilih bulan anggaran.'),
});

export const goalSchema = z.object({
  name: z.string().min(1, 'Nama target tabungan wajib diisi.'),
  target_amount: z
    .number({ message: 'Jumlah target harus berupa angka.' })
    .gt(0, 'Jumlah target harus lebih besar dari nol.'),
  current_amount: z
    .number({ message: 'Jumlah saat ini harus berupa angka.' })
    .min(0, 'Jumlah saat ini tidak boleh negatif.')
    .default(0),
  target_date: z.string().optional(),
  description: z.string().optional(),
  color: z.string().optional(),
});

export const categorySchema = z.object({
  name: z.string().min(1, 'Nama kategori wajib diisi.'),
  type: z.enum(['income', 'expense'], {
    error: 'Pilih jenis kategori.',
  }),
  color: z.string().optional(),
  icon: z.string().optional(),
});
