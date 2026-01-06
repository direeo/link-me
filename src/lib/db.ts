// Database client for LinkMe
// Uses @libsql/client for Turso (production) or Prisma for SQLite (local dev)

import { PrismaClient } from '@prisma/client';
import { createClient, Client } from '@libsql/client';

// ============================================
// Types
// ============================================

export interface DbUser {
  id: string;
  email: string;
  passwordHash: string;
  name: string | null;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DbVerificationToken {
  id: string;
  token: string;
  userId: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface DbRateLimitEntry {
  id: string;
  key: string;
  count: number;
  windowStart: Date;
  blockedUntil: Date | null;
}

// ============================================
// Turso Client for Production
// ============================================

let tursoClient: Client | null = null;

function getTurso(): Client {
  if (!tursoClient) {
    tursoClient = createClient({
      url: process.env.DATABASE_URL!,
      authToken: process.env.DATABASE_AUTH_TOKEN,
    });
  }
  return tursoClient;
}

function generateId(): string {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 25);
}

async function tursoExecute(sql: string, args: unknown[] = []): Promise<unknown[]> {
  const client = getTurso();
  const result = await client.execute({ sql, args: args as (string | number | null)[] });
  return result.rows as unknown[];
}

// ============================================
// Turso Database Implementation
// ============================================

const tursoDb = {
  user: {
    async findUnique(args: { where: { email?: string; id?: string } }): Promise<DbUser | null> {
      const key = args.where.email ? 'email' : 'id';
      const value = args.where.email ?? args.where.id;
      const rows = await tursoExecute(`SELECT * FROM User WHERE ${key} = ?`, [value]);
      if (rows.length === 0) return null;
      const r = rows[0] as Record<string, unknown>;
      return {
        id: String(r.id),
        email: String(r.email),
        passwordHash: String(r.passwordHash),
        name: r.name ? String(r.name) : null,
        emailVerified: Boolean(r.emailVerified),
        createdAt: new Date(String(r.createdAt)),
        updatedAt: new Date(String(r.updatedAt)),
      };
    },
    async create(args: { data: { email: string; passwordHash: string; name?: string | null; emailVerified?: boolean } }): Promise<DbUser> {
      const id = generateId();
      const now = new Date().toISOString();
      await tursoExecute(
        'INSERT INTO User (id, email, passwordHash, name, emailVerified, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [id, args.data.email, args.data.passwordHash, args.data.name ?? null, args.data.emailVerified ? 1 : 0, now, now]
      );
      return {
        id,
        email: args.data.email,
        passwordHash: args.data.passwordHash,
        name: args.data.name ?? null,
        emailVerified: args.data.emailVerified ?? false,
        createdAt: new Date(now),
        updatedAt: new Date(now),
      };
    },
    async update(args: { where: { email?: string; id?: string }; data: { emailVerified?: boolean; name?: string | null } }): Promise<DbUser> {
      const key = args.where.email ? 'email' : 'id';
      const value = args.where.email ?? args.where.id;
      const updates: string[] = [];
      const values: unknown[] = [];

      if (args.data.emailVerified !== undefined) {
        updates.push('emailVerified = ?');
        values.push(args.data.emailVerified ? 1 : 0);
      }
      if (args.data.name !== undefined) {
        updates.push('name = ?');
        values.push(args.data.name);
      }
      updates.push('updatedAt = ?');
      values.push(new Date().toISOString());
      values.push(value);

      await tursoExecute(`UPDATE User SET ${updates.join(', ')} WHERE ${key} = ?`, values);
      const user = await tursoDb.user.findUnique(args);
      return user!;
    },
    async findMany(): Promise<DbUser[]> {
      const rows = await tursoExecute('SELECT * FROM User ORDER BY createdAt DESC');
      return rows.map((r: unknown) => {
        const row = r as Record<string, unknown>;
        return {
          id: String(row.id),
          email: String(row.email),
          passwordHash: String(row.passwordHash),
          name: row.name ? String(row.name) : null,
          emailVerified: Boolean(row.emailVerified),
          createdAt: new Date(String(row.createdAt)),
          updatedAt: new Date(String(row.updatedAt)),
        };
      });
    },
    async count(args?: { where?: { emailVerified?: boolean } }): Promise<number> {
      let sql = 'SELECT COUNT(*) as count FROM User';
      const values: unknown[] = [];
      if (args?.where?.emailVerified !== undefined) {
        sql += ' WHERE emailVerified = ?';
        values.push(args.where.emailVerified ? 1 : 0);
      }
      const rows = await tursoExecute(sql, values);
      return Number((rows[0] as Record<string, unknown>).count);
    },
  },
  verificationToken: {
    async findUnique(args: { where: { token?: string; id?: string } }): Promise<DbVerificationToken | null> {
      const key = args.where.token ? 'token' : 'id';
      const value = args.where.token ?? args.where.id;
      const rows = await tursoExecute(`SELECT * FROM VerificationToken WHERE ${key} = ?`, [value]);
      if (rows.length === 0) return null;
      const r = rows[0] as Record<string, unknown>;
      return {
        id: String(r.id),
        token: String(r.token),
        userId: String(r.userId),
        expiresAt: new Date(String(r.expiresAt)),
        createdAt: new Date(String(r.createdAt)),
      };
    },
    async create(args: { data: { token: string; userId: string; expiresAt: Date } }): Promise<DbVerificationToken> {
      const id = generateId();
      const now = new Date().toISOString();
      await tursoExecute(
        'INSERT INTO VerificationToken (id, token, userId, expiresAt, createdAt) VALUES (?, ?, ?, ?, ?)',
        [id, args.data.token, args.data.userId, args.data.expiresAt.toISOString(), now]
      );
      return {
        id,
        token: args.data.token,
        userId: args.data.userId,
        expiresAt: args.data.expiresAt,
        createdAt: new Date(now),
      };
    },
    async delete(args: { where: { id: string } }): Promise<void> {
      await tursoExecute('DELETE FROM VerificationToken WHERE id = ?', [args.where.id]);
    },
    async deleteMany(args: { where: { userId: string } }): Promise<{ count: number }> {
      await tursoExecute('DELETE FROM VerificationToken WHERE userId = ?', [args.where.userId]);
      return { count: 0 };
    },
  },
  rateLimitEntry: {
    async findUnique(args: { where: { key: string } }): Promise<DbRateLimitEntry | null> {
      const rows = await tursoExecute('SELECT * FROM RateLimitEntry WHERE key = ?', [args.where.key]);
      if (rows.length === 0) return null;
      const r = rows[0] as Record<string, unknown>;
      return {
        id: String(r.id),
        key: String(r.key),
        count: Number(r.count),
        windowStart: new Date(String(r.windowStart)),
        blockedUntil: r.blockedUntil ? new Date(String(r.blockedUntil)) : null,
      };
    },
    async create(args: { data: { key: string; count?: number; windowStart?: Date } }): Promise<DbRateLimitEntry> {
      const id = generateId();
      const now = new Date();
      await tursoExecute(
        'INSERT INTO RateLimitEntry (id, key, count, windowStart) VALUES (?, ?, ?, ?)',
        [id, args.data.key, args.data.count ?? 1, (args.data.windowStart ?? now).toISOString()]
      );
      return {
        id,
        key: args.data.key,
        count: args.data.count ?? 1,
        windowStart: args.data.windowStart ?? now,
        blockedUntil: null,
      };
    },
    async update(args: { where: { key: string }; data: { count?: number; windowStart?: Date; blockedUntil?: Date | null } }): Promise<DbRateLimitEntry> {
      const updates: string[] = [];
      const values: unknown[] = [];

      if (args.data.count !== undefined) {
        updates.push('count = ?');
        values.push(args.data.count);
      }
      if (args.data.windowStart !== undefined) {
        updates.push('windowStart = ?');
        values.push(args.data.windowStart.toISOString());
      }
      if (args.data.blockedUntil !== undefined) {
        updates.push('blockedUntil = ?');
        values.push(args.data.blockedUntil?.toISOString() ?? null);
      }
      values.push(args.where.key);

      await tursoExecute(`UPDATE RateLimitEntry SET ${updates.join(', ')} WHERE key = ?`, values);
      const entry = await tursoDb.rateLimitEntry.findUnique(args);
      return entry!;
    },
    async deleteMany(args: { where: { key: string } }): Promise<{ count: number }> {
      await tursoExecute('DELETE FROM RateLimitEntry WHERE key = ?', [args.where.key]);
      return { count: 0 };
    },
  },
  chatHistory: {
    async create(args: { data: { userId: string; messages: string } }): Promise<void> {
      const id = generateId();
      const now = new Date().toISOString();
      await tursoExecute(
        'INSERT INTO ChatHistory (id, userId, messages, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)',
        [id, args.data.userId, args.data.messages, now, now]
      );
    },
  },
};

// ============================================
// Prisma Client for Local Development
// ============================================

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

function getPrismaClient(): PrismaClient {
  if (globalThis.__prisma) return globalThis.__prisma;
  const client = new PrismaClient();
  if (process.env.NODE_ENV !== 'production') {
    globalThis.__prisma = client;
  }
  return client;
}

// ============================================
// Main Export - Auto-detect which to use
// ============================================

const isTurso = process.env.DATABASE_URL?.startsWith('libsql://');

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getDb(): any {
  if (isTurso) {
    return tursoDb;
  }
  return getPrismaClient();
}

export default getDb;
