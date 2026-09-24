import { PrismaClient } from '@prisma/client';

const TOKYO_POOLER_URL =
  'postgresql://postgres.wbdfribhkcwhlkfmgytf:9WvF3oZB6XdBrgQ3@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true';

function getResolvedDatabaseUrl(): string {
  const currentUrl = process.env.DATABASE_URL;
  // Jika URL belum diset atau masih menggunakan direct connection IPv6 lama, gunakan connection pooler resmi
  if (!currentUrl || currentUrl.includes('db.wbdfribhkcwhlkfmgytf.supabase.co')) {
    return TOKYO_POOLER_URL;
  }
  return currentUrl;
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: getResolvedDatabaseUrl(),
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
