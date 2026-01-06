// Database client for LinkMe
// Uses Prisma for local SQLite, Turso libsql client for production

import { PrismaClient } from '@prisma/client';
import { createClient, Client } from '@libsql/client';

// Type definitions for Turso-wrapped Prisma-like interface
interface TursoDb {
  user: {
    findUnique: (args: { where: { email?: string; id?: string } }) => Promise<unknown>;
    findMany: (args?: { select?: unknown; orderBy?: unknown; where?: unknown }) => Promise<unknown[]>;
    create: (args: { data: unknown }) => Promise<unknown>;
    update: (args: { where: { email?: string; id?: string }; data: unknown }) => Promise<unknown>;
    count: (args?: { where?: unknown }) => Promise<number>;
  };
  verificationToken: {
    findUnique: (args: { where: { token?: string; id?: string } }) => Promise<unknown>;
    findFirst: (args: { where: unknown; orderBy?: unknown }) => Promise<unknown>;
    create: (args: { data: unknown }) => Promise<unknown>;
    delete: (args: { where: { id: string } }) => Promise<unknown>;
    deleteMany: (args: { where: unknown }) => Promise<unknown>;
  };
  rateLimitEntry: {
    findUnique: (args: { where: { key: string } }) => Promise<unknown>;
    create: (args: { data: unknown }) => Promise<unknown>;
    update: (args: { where: { key: string }; data: unknown }) => Promise<unknown>;
    deleteMany: (args: { where: unknown }) => Promise<unknown>;
  };
  chatHistory: {
    create: (args: { data: unknown }) => Promise<unknown>;
    findMany: (args: { where: unknown }) => Promise<unknown[]>;
  };
}

// Global instances
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
  // eslint-disable-next-line no-var
  var __turso: Client | undefined;
}

// Turso client singleton
function getTursoClient(): Client {
  if (globalThis.__turso) {
    return globalThis.__turso;
  }

  const client = createClient({
    url: process.env.DATABASE_URL!,
    authToken: process.env.DATABASE_AUTH_TOKEN,
  });

  globalThis.__turso = client;
  return client;
}

// Create Turso-based database wrapper
function createTursoWrapper(): TursoDb {
  const client = getTursoClient();

  return {
    user: {
      async findUnique({ where }) {
        const key = where.email ? 'email' : 'id';
        const value = where.email || where.id;
        const result = await client.execute({
          sql: `SELECT * FROM User WHERE ${key} = ?`,
          args: [value!],
        });
        return result.rows[0] || null;
      },
      async findMany(args) {
        const result = await client.execute('SELECT id, email, name, emailVerified, createdAt, updatedAt FROM User ORDER BY createdAt DESC');
        return result.rows;
      },
      async create({ data }) {
        const d = data as Record<string, unknown>;
        const id = crypto.randomUUID();
        await client.execute({
          sql: 'INSERT INTO User (id, email, passwordHash, name, emailVerified, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, datetime("now"), datetime("now"))',
          args: [id, d.email, d.passwordHash, d.name || null, d.emailVerified ? 1 : 0],
        });
        return { id, ...d };
      },
      async update({ where, data }) {
        const key = where.email ? 'email' : 'id';
        const value = where.email || where.id;
        const d = data as Record<string, unknown>;
        const sets: string[] = [];
        const args: unknown[] = [];

        for (const [k, v] of Object.entries(d)) {
          sets.push(`${k} = ?`);
          args.push(k === 'emailVerified' ? (v ? 1 : 0) : v);
        }
        sets.push('updatedAt = datetime("now")');
        args.push(value);

        await client.execute({
          sql: `UPDATE User SET ${sets.join(', ')} WHERE ${key} = ?`,
          args,
        });
        return { [key]: value, ...d };
      },
      async count(args) {
        let sql = 'SELECT COUNT(*) as count FROM User';
        const sqlArgs: unknown[] = [];

        if (args?.where) {
          const w = args.where as Record<string, unknown>;
          const conditions: string[] = [];
          for (const [k, v] of Object.entries(w)) {
            conditions.push(`${k} = ?`);
            sqlArgs.push(k === 'emailVerified' ? (v ? 1 : 0) : v);
          }
          if (conditions.length) {
            sql += ' WHERE ' + conditions.join(' AND ');
          }
        }

        const result = await client.execute({ sql, args: sqlArgs });
        return Number(result.rows[0]?.count || 0);
      },
    },
    verificationToken: {
      async findUnique({ where }) {
        const key = where.token ? 'token' : 'id';
        const value = where.token || where.id;
        const result = await client.execute({
          sql: `SELECT * FROM VerificationToken WHERE ${key} = ?`,
          args: [value!],
        });
        return result.rows[0] || null;
      },
      async findFirst({ where }) {
        const w = where as Record<string, unknown>;
        const conditions: string[] = [];
        const args: unknown[] = [];
        for (const [k, v] of Object.entries(w)) {
          conditions.push(`${k} = ?`);
          args.push(v);
        }
        const result = await client.execute({
          sql: `SELECT * FROM VerificationToken WHERE ${conditions.join(' AND ')} LIMIT 1`,
          args,
        });
        return result.rows[0] || null;
      },
      async create({ data }) {
        const d = data as Record<string, unknown>;
        const id = crypto.randomUUID();
        await client.execute({
          sql: 'INSERT INTO VerificationToken (id, token, userId, expiresAt, createdAt) VALUES (?, ?, ?, ?, datetime("now"))',
          args: [id, d.token, d.userId, d.expiresAt],
        });
        return { id, ...d };
      },
      async delete({ where }) {
        await client.execute({
          sql: 'DELETE FROM VerificationToken WHERE id = ?',
          args: [where.id],
        });
        return {};
      },
      async deleteMany({ where }) {
        const w = where as Record<string, unknown>;
        const conditions: string[] = [];
        const args: unknown[] = [];
        for (const [k, v] of Object.entries(w)) {
          conditions.push(`${k} = ?`);
          args.push(v);
        }
        await client.execute({
          sql: `DELETE FROM VerificationToken WHERE ${conditions.join(' AND ')}`,
          args,
        });
        return {};
      },
    },
    rateLimitEntry: {
      async findUnique({ where }) {
        const result = await client.execute({
          sql: 'SELECT * FROM RateLimitEntry WHERE key = ?',
          args: [where.key],
        });
        const row = result.rows[0];
        if (!row) return null;
        return {
          ...row,
          windowStart: new Date(row.windowStart as string),
          blockedUntil: row.blockedUntil ? new Date(row.blockedUntil as string) : null,
        };
      },
      async create({ data }) {
        const d = data as Record<string, unknown>;
        const id = crypto.randomUUID();
        await client.execute({
          sql: 'INSERT INTO RateLimitEntry (id, key, count, windowStart) VALUES (?, ?, ?, datetime("now"))',
          args: [id, d.key, d.count || 1],
        });
        return { id, ...d };
      },
      async update({ where, data }) {
        const d = data as Record<string, unknown>;
        const sets: string[] = [];
        const args: unknown[] = [];

        for (const [k, v] of Object.entries(d)) {
          if (k === 'windowStart') {
            sets.push('windowStart = datetime("now")');
          } else if (k === 'blockedUntil') {
            sets.push('blockedUntil = ?');
            args.push(v ? (v as Date).toISOString() : null);
          } else {
            sets.push(`${k} = ?`);
            args.push(v);
          }
        }
        args.push(where.key);

        await client.execute({
          sql: `UPDATE RateLimitEntry SET ${sets.join(', ')} WHERE key = ?`,
          args,
        });
        return { key: where.key, ...d };
      },
      async deleteMany({ where }) {
        const w = where as Record<string, unknown>;
        await client.execute({
          sql: 'DELETE FROM RateLimitEntry WHERE key = ?',
          args: [w.key],
        });
        return {};
      },
    },
    chatHistory: {
      async create({ data }) {
        const d = data as Record<string, unknown>;
        const id = crypto.randomUUID();
        await client.execute({
          sql: 'INSERT INTO ChatHistory (id, userId, messages, createdAt, updatedAt) VALUES (?, ?, ?, datetime("now"), datetime("now"))',
          args: [id, d.userId, d.messages],
        });
        return { id, ...d };
      },
      async findMany({ where }) {
        const w = where as Record<string, unknown>;
        const result = await client.execute({
          sql: 'SELECT * FROM ChatHistory WHERE userId = ?',
          args: [w.userId],
        });
        return result.rows;
      },
    },
  };
}

// Prisma client singleton
function getPrismaClient(): PrismaClient {
  if (globalThis.__prisma) {
    return globalThis.__prisma;
  }

  const client = new PrismaClient();

  if (process.env.NODE_ENV !== 'production') {
    globalThis.__prisma = client;
  }

  return client;
}

// Main database getter - returns Prisma client or Turso wrapper
export function getDb(): PrismaClient | TursoDb {
  // Check if using Turso (libsql URL)
  if (process.env.DATABASE_URL?.startsWith('libsql://') && process.env.DATABASE_AUTH_TOKEN) {
    return createTursoWrapper();
  }

  // Use Prisma for local SQLite
  return getPrismaClient();
}

export default getDb;
