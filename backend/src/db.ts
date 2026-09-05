import { PrismaClient } from '@prisma/client';

function buildClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });
}

export const prisma = buildClient();

export async function disconnect(): Promise<void> {
  await prisma.$disconnect();
}

// Retry helper for transient Neon/Postgres disconnects
export async function withRetry<T>(fn: () => Promise<T>, attempts = 3, delayMs = 500): Promise<T> {
  let lastErr: any;
  for (let i = 0; i < attempts; i++) {
    try { return await fn(); } catch (e: any) {
      lastErr = e;
      const transient = e?.code === 'P1001' || e?.code === 'P1002' || e?.code === 'P1017' || /Can't reach database server/i.test(String(e?.message));
      if (!transient || i === attempts - 1) throw e;
      await new Promise((r) => setTimeout(r, delayMs * (i + 1)));
    }
  }
  throw lastErr;
}