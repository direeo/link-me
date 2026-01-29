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
  // 2FA fields
  twoFactorEnabled: boolean;
  twoFactorSecret: string | null;
  twoFactorBackupCodes: string | null;
  // YouTube OAuth fields
  youtubeAccessToken: string | null;
  youtubeRefreshToken: string | null;
  youtubeTokenExpiry: Date | null;
  youtubeChannelId: string | null;
  youtubeChannelName: string | null;
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
    const url = process.env.DATABASE_URL;
    const authToken = process.env.DATABASE_AUTH_TOKEN;

    if (!url) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    tursoClient = createClient({
      url,
      authToken,
    });
  }
  return tursoClient;
}

function generateId(): string {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 25);
}

async function tursoExecute(sql: string, args: unknown[] = []): Promise<unknown[]> {
  try {
    const client = getTurso();
    const result = await client.execute({ sql, args: args as (string | number | null)[] });
    return result.rows as unknown[];
  } catch (error) {
    console.error('Turso execute error:', { sql, args, error });
    throw error;
  }
}

// ============================================
// Turso Database Implementation
// ============================================

const tursoDb = {
  user: {
    async findUnique(args: { where: { email?: string; id?: string }; select?: Record<string, boolean> }): Promise<DbUser | null> {
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
        // 2FA fields
        twoFactorEnabled: Boolean(r.twoFactorEnabled),
        twoFactorSecret: r.twoFactorSecret ? String(r.twoFactorSecret) : null,
        twoFactorBackupCodes: r.twoFactorBackupCodes ? String(r.twoFactorBackupCodes) : null,
        // YouTube OAuth fields
        youtubeAccessToken: r.youtubeAccessToken ? String(r.youtubeAccessToken) : null,
        youtubeRefreshToken: r.youtubeRefreshToken ? String(r.youtubeRefreshToken) : null,
        youtubeTokenExpiry: r.youtubeTokenExpiry ? new Date(String(r.youtubeTokenExpiry)) : null,
        youtubeChannelId: r.youtubeChannelId ? String(r.youtubeChannelId) : null,
        youtubeChannelName: r.youtubeChannelName ? String(r.youtubeChannelName) : null,
      };
    },
    async create(args: { data: { email: string; passwordHash: string; name?: string | null; emailVerified?: boolean } }): Promise<DbUser> {
      const id = generateId();
      const now = new Date().toISOString();
      await tursoExecute(
        'INSERT INTO User (id, email, passwordHash, name, emailVerified, createdAt, updatedAt, twoFactorEnabled) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [id, args.data.email, args.data.passwordHash, args.data.name ?? null, args.data.emailVerified ? 1 : 0, now, now, 0]
      );
      return {
        id,
        email: args.data.email,
        passwordHash: args.data.passwordHash,
        name: args.data.name ?? null,
        emailVerified: args.data.emailVerified ?? false,
        createdAt: new Date(now),
        updatedAt: new Date(now),
        twoFactorEnabled: false,
        twoFactorSecret: null,
        twoFactorBackupCodes: null,
        youtubeAccessToken: null,
        youtubeRefreshToken: null,
        youtubeTokenExpiry: null,
        youtubeChannelId: null,
        youtubeChannelName: null,
      };
    },
    async update(args: { where: { email?: string; id?: string }; data: Record<string, unknown> }): Promise<DbUser> {
      const key = args.where.email ? 'email' : 'id';
      const value = args.where.email ?? args.where.id;
      const updates: string[] = [];
      const values: unknown[] = [];

      // Handle all possible update fields
      const fieldMappings: Record<string, string> = {
        emailVerified: 'emailVerified',
        name: 'name',
        twoFactorEnabled: 'twoFactorEnabled',
        twoFactorSecret: 'twoFactorSecret',
        twoFactorBackupCodes: 'twoFactorBackupCodes',
        youtubeAccessToken: 'youtubeAccessToken',
        youtubeRefreshToken: 'youtubeRefreshToken',
        youtubeTokenExpiry: 'youtubeTokenExpiry',
        youtubeChannelId: 'youtubeChannelId',
        youtubeChannelName: 'youtubeChannelName',
      };

      for (const [dataKey, dbField] of Object.entries(fieldMappings)) {
        if (args.data[dataKey] !== undefined) {
          updates.push(`${dbField} = ?`);
          let val = args.data[dataKey];
          // Convert booleans to integers for SQLite
          if (typeof val === 'boolean') val = val ? 1 : 0;
          // Convert dates to ISO strings
          if (val instanceof Date) val = val.toISOString();
          values.push(val);
        }
      }

      updates.push('updatedAt = ?');
      values.push(new Date().toISOString());
      values.push(value);

      if (updates.length > 1) {
        await tursoExecute(`UPDATE User SET ${updates.join(', ')} WHERE ${key} = ?`, values);
      }
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
          twoFactorEnabled: Boolean(row.twoFactorEnabled),
          twoFactorSecret: row.twoFactorSecret ? String(row.twoFactorSecret) : null,
          twoFactorBackupCodes: row.twoFactorBackupCodes ? String(row.twoFactorBackupCodes) : null,
          youtubeAccessToken: row.youtubeAccessToken ? String(row.youtubeAccessToken) : null,
          youtubeRefreshToken: row.youtubeRefreshToken ? String(row.youtubeRefreshToken) : null,
          youtubeTokenExpiry: row.youtubeTokenExpiry ? new Date(String(row.youtubeTokenExpiry)) : null,
          youtubeChannelId: row.youtubeChannelId ? String(row.youtubeChannelId) : null,
          youtubeChannelName: row.youtubeChannelName ? String(row.youtubeChannelName) : null,
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

      // Only run update if there are fields to update
      if (updates.length > 0) {
        await tursoExecute(`UPDATE RateLimitEntry SET ${updates.join(', ')} WHERE key = ?`, values);
      }
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
    async findMany(args: { where: { userId: string } }): Promise<Array<{ id: string; userId: string; messages: string; createdAt: Date }>> {
      const rows = await tursoExecute('SELECT * FROM ChatHistory WHERE userId = ? ORDER BY createdAt DESC', [args.where.userId]);
      return rows.map((r: unknown) => {
        const row = r as Record<string, unknown>;
        return {
          id: String(row.id),
          userId: String(row.userId),
          messages: String(row.messages),
          createdAt: new Date(String(row.createdAt)),
        };
      });
    },
  },
  savedLearningPath: {
    async create(args: { data: { userId: string; topic: string; userLevel: string; userGoal: string; totalVideos: number; estimatedTotalTime: string; stages: string; completionGoals: string; summary: string } }): Promise<{ id: string }> {
      const id = generateId();
      const now = new Date().toISOString();
      await tursoExecute(
        'INSERT INTO SavedLearningPath (id, userId, topic, userLevel, userGoal, totalVideos, estimatedTotalTime, stages, completionGoals, summary, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [id, args.data.userId, args.data.topic, args.data.userLevel, args.data.userGoal, args.data.totalVideos, args.data.estimatedTotalTime, args.data.stages, args.data.completionGoals, args.data.summary, now, now]
      );
      return { id };
    },
    async findUnique(args: { where: { id: string } }): Promise<Record<string, unknown> | null> {
      const rows = await tursoExecute('SELECT * FROM SavedLearningPath WHERE id = ?', [args.where.id]);
      if (rows.length === 0) return null;
      const r = rows[0] as Record<string, unknown>;
      return {
        id: String(r.id),
        userId: String(r.userId),
        topic: String(r.topic),
        userLevel: String(r.userLevel),
        userGoal: String(r.userGoal),
        totalVideos: Number(r.totalVideos),
        estimatedTotalTime: String(r.estimatedTotalTime),
        stages: String(r.stages),
        completionGoals: String(r.completionGoals),
        summary: String(r.summary),
        createdAt: new Date(String(r.createdAt)),
        updatedAt: new Date(String(r.updatedAt)),
      };
    },
    async findMany(args: { where: { userId: string }; orderBy?: { createdAt: string } }): Promise<Array<Record<string, unknown>>> {
      const rows = await tursoExecute('SELECT * FROM SavedLearningPath WHERE userId = ? ORDER BY createdAt DESC', [args.where.userId]);
      return rows.map((r: unknown) => {
        const row = r as Record<string, unknown>;
        return {
          id: String(row.id),
          userId: String(row.userId),
          topic: String(row.topic),
          userLevel: String(row.userLevel),
          userGoal: String(row.userGoal),
          totalVideos: Number(row.totalVideos),
          estimatedTotalTime: String(row.estimatedTotalTime),
          stages: String(row.stages),
          completionGoals: String(row.completionGoals),
          summary: String(row.summary),
          createdAt: new Date(String(row.createdAt)),
          updatedAt: new Date(String(row.updatedAt)),
        };
      });
    },
    async delete(args: { where: { id: string } }): Promise<void> {
      await tursoExecute('DELETE FROM SavedLearningPath WHERE id = ?', [args.where.id]);
    },
    async count(args?: { where?: { userId?: string } }): Promise<number> {
      let sql = 'SELECT COUNT(*) as count FROM SavedLearningPath';
      const values: unknown[] = [];
      if (args?.where?.userId) {
        sql += ' WHERE userId = ?';
        values.push(args.where.userId);
      }
      const rows = await tursoExecute(sql, values);
      return Number((rows[0] as Record<string, unknown>).count);
    },
  },
  videoProgress: {
    async findMany(args: { where: { learningPathId: string } }): Promise<Array<{ id: string; videoId: string; watched: boolean }>> {
      const rows = await tursoExecute('SELECT * FROM VideoProgress WHERE learningPathId = ?', [args.where.learningPathId]);
      return rows.map((r: unknown) => {
        const row = r as Record<string, unknown>;
        return {
          id: String(row.id),
          videoId: String(row.videoId),
          watched: Boolean(row.watched),
        };
      });
    },
    async upsert(args: { where: { learningPathId_videoId: { learningPathId: string; videoId: string } }; create: { learningPathId: string; videoId: string; watched: boolean }; update: { watched: boolean } }): Promise<void> {
      const { learningPathId, videoId } = args.where.learningPathId_videoId;
      const rows = await tursoExecute('SELECT id FROM VideoProgress WHERE learningPathId = ? AND videoId = ?', [learningPathId, videoId]);

      if (rows.length > 0) {
        // Update existing
        await tursoExecute('UPDATE VideoProgress SET watched = ?, updatedAt = ? WHERE learningPathId = ? AND videoId = ?',
          [args.update.watched ? 1 : 0, new Date().toISOString(), learningPathId, videoId]);
      } else {
        // Create new
        const id = generateId();
        const now = new Date().toISOString();
        await tursoExecute('INSERT INTO VideoProgress (id, learningPathId, videoId, watched, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)',
          [id, learningPathId, videoId, args.create.watched ? 1 : 0, now, now]);
      }
    },
    async deleteMany(args: { where: { learningPathId: string } }): Promise<{ count: number }> {
      await tursoExecute('DELETE FROM VideoProgress WHERE learningPathId = ?', [args.where.learningPathId]);
      return { count: 0 };
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getDb(): any {
  // Check dynamically at runtime (not module load time) for Vercel compatibility
  const databaseUrl = process.env.DATABASE_URL || '';
  const isTurso = databaseUrl.startsWith('libsql://');

  if (isTurso) {
    return tursoDb;
  }
  return getPrismaClient();
}

export default getDb;
