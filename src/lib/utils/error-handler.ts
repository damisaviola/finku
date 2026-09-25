/**
 * Utility untuk menangkap, memetakan, dan menerjemahkan pesan error teknis/server/database
 * menjadi pesan bahasa Indonesia yang ramah, jelas, dan informatif di sisi pengguna (UI/Toast).
 */

export interface FriendlyError {
  title: string;
  message: string;
}

/**
 * Menerjemahkan berbagai pesan error teknis (Prisma, Supabase, Network, HTTP)
 * menjadi pesan ramah pengguna.
 */
export function formatUserFriendlyError(
  error: unknown,
  fallbackMessage: string = 'Terjadi kendala saat memproses permintaan Anda. Silakan coba kembali.'
): string {
  const result = getFriendlyErrorDetails(error, fallbackMessage);
  return result.message;
}

/**
 * Mengembalikan objek detail error yang ramah (judul dan pesan penjelasan).
 */
export function getFriendlyErrorDetails(
  error: unknown,
  fallbackMessage: string = 'Terjadi kendala saat memproses permintaan Anda. Silakan coba kembali.'
): FriendlyError {
  // 1. Ekstrak pesan mentah
  let rawMessage = '';

  if (typeof error === 'string') {
    rawMessage = error;
  } else if (error && typeof error === 'object') {
    if ('message' in error && typeof (error as any).message === 'string') {
      rawMessage = (error as any).message;
    } else if ('error' in error && typeof (error as any).error === 'string') {
      rawMessage = (error as any).error;
    } else {
      rawMessage = String(error);
    }
  }

  // Bersihkan format error bawaan seperti "Error: "
  rawMessage = rawMessage.replace(/^Error:\s*/i, '').trim();

  if (!rawMessage) {
    return {
      title: 'Terjadi Kendala',
      message: fallbackMessage,
    };
  }

  const lower = rawMessage.toLowerCase();

  // 2. Database & Koneksi Server (Prisma / PostgreSQL / Supabase Pooler)
  if (
    lower.includes("can't reach database server") ||
    lower.includes('timed out fetching a new connection') ||
    lower.includes('connection pool') ||
    lower.includes('connection refused') ||
    lower.includes('econnrefused') ||
    lower.includes('etimedout') ||
    lower.includes('enotfound') ||
    lower.includes('closed connection') ||
    lower.includes('prepared statement')
  ) {
    return {
      title: 'Koneksi Database Terputus',
      message: 'Tidak dapat terhubung ke server database. Silakan periksa koneksi internet Anda atau coba beberapa saat lagi.',
    };
  }

  // Prisma Unique Constraint (P2002)
  if (lower.includes('p2002') || lower.includes('unique constraint') || lower.includes('duplicate key')) {
    if (lower.includes('email')) {
      return {
        title: 'Email Sudah Terdaftar',
        message: 'Alamat email ini sudah terdaftar di sistem. Silakan langsung masuk ke akun Anda.',
      };
    }
    return {
      title: 'Data Duplikat',
      message: 'Data dengan informasi ini sudah ada sebelumnya. Silakan gunakan nama atau identitas yang berbeda.',
    };
  }

  // Prisma Foreign Key Constraint (P2003)
  if (lower.includes('p2003') || lower.includes('foreign key') || lower.includes('violates foreign key')) {
    return {
      title: 'Data Masih Terkait',
      message: 'Data ini tidak dapat dihapus karena masih terkait dengan transaksi atau catatan lain yang aktif.',
    };
  }

  // Prisma Record Not Found (P2025)
  if (lower.includes('p2025') || lower.includes('record to update not found') || lower.includes('record to delete does not exist')) {
    return {
      title: 'Data Tidak Ditemukan',
      message: 'Data yang ingin Anda ubah atau hapus tidak ditemukan atau mungkin sudah dihapus sebelumnya.',
    };
  }

  // 3. Autentikasi & Akun Pengguna
  if (
    lower.includes('invalid login credentials') ||
    lower.includes('invalid credentials') ||
    lower.includes('email atau kata sandi tidak valid') ||
    lower.includes('email atau kata sandi tidak sesuai')
  ) {
    return {
      title: 'Gagal Masuk',
      message: 'Email atau kata sandi yang Anda masukkan salah. Silakan periksa kembali.',
    };
  }

  if (lower.includes('email not confirmed')) {
    return {
      title: 'Email Belum Dikonfirmasi',
      message: 'Email Anda belum dikonfirmasi. Silakan periksa pesan verifikasi pada kotak masuk atau folder spam email Anda.',
    };
  }

  if (lower.includes('user already registered') || lower.includes('already registered')) {
    return {
      title: 'Email Sudah Terdaftar',
      message: 'Alamat email ini sudah terdaftar. Silakan langsung masuk menggunakan akun Anda.',
    };
  }

  if (lower.includes('password should be at least') || lower.includes('kata sandi minimal 8')) {
    return {
      title: 'Kata Sandi Kurang Aman',
      message: 'Kata sandi harus terdiri dari minimal 8 karakter untuk keamanan akun Anda.',
    };
  }

  if (
    lower.includes('rate limit') ||
    lower.includes('too many requests') ||
    lower.includes('over_email_send_rate_limit')
  ) {
    return {
      title: 'Terlalu Banyak Permintaan',
      message: 'Terlalu banyak percobaan dalam waktu singkat. Mohon tunggu beberapa saat sebelum mencoba kembali.',
    };
  }

  if (
    lower.includes('jwt expired') ||
    lower.includes('token expired') ||
    lower.includes('sesi pengguna tidak valid') ||
    lower.includes('silakan masuk ke akun anda terlebih dahulu')
  ) {
    return {
      title: 'Sesi Berakhir',
      message: 'Sesi akun Anda telah berakhir. Silakan masuk kembali untuk melanjutkan.',
    };
  }

  // 4. Jaringan & Koneksi Internet
  if (
    lower.includes('failed to fetch') ||
    lower.includes('networkerror') ||
    lower.includes('network request failed') ||
    lower.includes('load failed')
  ) {
    return {
      title: 'Gagal Terhubung ke Jaringan',
      message: 'Gagal menghubungi server. Pastikan perangkat Anda terhubung ke internet dan coba kembali.',
    };
  }

  if (lower.includes('aborterror') || lower.includes('timeout')) {
    return {
      title: 'Waktu Habis (Timeout)',
      message: 'Permintaan membutuhkan waktu terlalu lama. Silakan coba kembali beberapa saat lagi.',
    };
  }

  // 5. Validasi Bisnis Finansial
  if (lower.includes('saldo tidak mencukupi')) {
    return {
      title: 'Saldo Tidak Mencukupi',
      message: 'Saldo pada rekening yang dipilih tidak mencukupi untuk melakukan transaksi ini.',
    };
  }

  if (lower.includes('nominal melebihi sisa tagihan')) {
    return {
      title: 'Nominal Melebihi Tagihan',
      message: rawMessage, // Biasanya sudah diformat dengan nominal rupiah yang pas
    };
  }

  if (lower.includes('nominal pembayaran harus lebih besar')) {
    return {
      title: 'Nominal Tidak Valid',
      message: 'Nominal pembayaran harus lebih besar dari Rp0.',
    };
  }

  // 6. Filter Heuristik untuk Error Teknis / Kode Mentah / Stack Trace
  // Jika pesan mengandung kode sistem, tag SQL, atau stack trace Next.js/Prisma:
  if (
    lower.includes('prisma.') ||
    lower.includes('invocation') ||
    lower.includes('stack trace') ||
    lower.includes('syntaxerror') ||
    lower.includes('typeerror') ||
    lower.includes('referenceerror') ||
    lower.includes('at ') ||
    lower.includes('node_modules') ||
    lower.includes('internal server error') ||
    rawMessage.includes('{') ||
    rawMessage.includes('}')
  ) {
    return {
      title: 'Terjadi Kendala Sistem',
      message: 'Terjadi kendala pada server saat memproses permintaan. Silakan segarkan halaman atau coba sesaat lagi.',
    };
  }

  // 7. Pesan sudah berupa teks ramah bahasa Indonesia normal
  return {
    title: 'Perhatian',
    message: rawMessage,
  };
}
