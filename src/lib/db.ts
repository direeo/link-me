// Database client for LinkMe
// Uses Prisma - will use local SQLite for development
// For Vercel, configure DATABASE_URL to use a hosted database

import { PrismaClient } from '@prisma/client';

// Global to prevent multiple instances in development
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

// Create singleton instance
let prismaInstance: PrismaClient | undefined;

export function getDb(): PrismaClient {
  if (prismaInstance) {
    return prismaInstance;
  }

  prismaInstance = globalThis.__prisma ?? new PrismaClient();

  if (process.env.NODE_ENV !== 'production') {
    globalThis.__prisma = prismaInstance;
  }

  return prismaInstance;
}

// Default export
export const prisma = getDb();
export default prisma;
