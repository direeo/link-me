// Database client singleton for Prisma
// Prevents multiple instances during hot reloading in development

import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// For backward compatibility with getDb calls
export function getDb(): PrismaClient {
  return prisma;
}

export default prisma;
