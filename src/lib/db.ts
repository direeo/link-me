// Database client for LinkMe
// Uses Prisma with SQLite (local) or Turso (production)
// Initialization is lazy to avoid build-time errors on Vercel

import { PrismaClient } from '@prisma/client';

// Global to prevent multiple instances in development
declare global {
  // eslint-disable-next-line no-var
  var __db: PrismaClient | undefined;
}

// Lazy singleton - only initializes on first call
export function getDb(): PrismaClient {
  if (globalThis.__db) {
    return globalThis.__db;
  }

  let client: PrismaClient;

  // Check if running with Turso (libsql URL)
  const dbUrl = process.env.DATABASE_URL;
  const authToken = process.env.DATABASE_AUTH_TOKEN;

  if (dbUrl?.startsWith('libsql://') && authToken) {
    // Production: Use Turso adapter
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { PrismaLibSql } = require('@prisma/adapter-libsql');
      const adapter = new PrismaLibSql({
        url: dbUrl,
        authToken: authToken,
      });
      client = new PrismaClient({ adapter });
    } catch (error) {
      console.error('Failed to initialize Turso adapter:', error);
      // Fallback to standard client
      client = new PrismaClient();
    }
  } else {
    // Development: Use local SQLite
    client = new PrismaClient();
  }

  // Cache for reuse (except in production where each request may be fresh)
  if (process.env.NODE_ENV !== 'production') {
    globalThis.__db = client;
  }

  return client;
}

// Default export for convenience
export default getDb;
