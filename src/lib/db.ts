// Database client for LinkMe
// Supports both local SQLite and Turso (for Vercel deployment)

import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

// Global to prevent multiple instances in development
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Check if we're using Turso (has libsql:// URL) or local SQLite
const isTurso = process.env.DATABASE_URL?.startsWith('libsql://');

function createPrismaClient(): PrismaClient {
  if (isTurso && process.env.DATABASE_AUTH_TOKEN) {
    // Turso configuration for production - pass config directly to adapter
    const adapter = new PrismaLibSql({
      url: process.env.DATABASE_URL!,
      authToken: process.env.DATABASE_AUTH_TOKEN,
    });
    // @ts-expect-error - Prisma adapter types may not be fully compatible
    return new PrismaClient({ adapter });
  } else {
    // Local SQLite for development
    return new PrismaClient();
  }
}

// Create singleton instance
let prismaInstance: PrismaClient | undefined;

export function getDb(): PrismaClient {
  if (!prismaInstance) {
    prismaInstance = globalThis.prisma ?? createPrismaClient();

    if (process.env.NODE_ENV !== 'production') {
      globalThis.prisma = prismaInstance;
    }
  }
  return prismaInstance;
}

// For backwards compatibility
export const prisma = getDb();
export default prisma;
