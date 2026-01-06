// Database client for LinkMe
// Uses Prisma with SQLite (local) or Turso (production via libsql)

import { PrismaClient } from '@prisma/client';

// Global to prevent multiple instances in development
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Create singleton instance
let prismaInstance: PrismaClient | undefined;

export function getDb(): PrismaClient {
  if (!prismaInstance) {
    // Check if running on Vercel with Turso
    if (process.env.DATABASE_URL?.startsWith('libsql://') && process.env.DATABASE_AUTH_TOKEN) {
      // Dynamic import for Turso - only runs on server
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { PrismaLibSql } = require('@prisma/adapter-libsql');
      const adapter = new PrismaLibSql({
        url: process.env.DATABASE_URL,
        authToken: process.env.DATABASE_AUTH_TOKEN,
      });
      prismaInstance = new PrismaClient({ adapter });
    } else {
      // Local SQLite
      prismaInstance = new PrismaClient();
    }

    if (process.env.NODE_ENV !== 'production') {
      globalThis.prisma = prismaInstance;
    }
  }
  return prismaInstance;
}

// For backwards compatibility
export const prisma = getDb();
export default prisma;
