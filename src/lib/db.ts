// Database client for LinkMe
// Uses @libsql/client for Turso (production) or Prisma for SQLite (local dev)

import { createClient, Client } from '@libsql/client';

// Note: PrismaClient is dynamically imported only when needed for local development
// This prevents bundle-time schema validation errors on Vercel

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

export interface DbSavedLearningPath {
  id: string;
  userId: string;
  topic: string;
  userLevel: string;
  userGoal: string;
  totalVideos: number;
  estimatedTotalTime: string;
  stages: string;
  completionGoals: string;
  summary: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DbVideoProgress {
  id: string;
  userId: string;
  learningPathId: string;
  videoId: string;
  watched: boolean;
  watchedAt: Date | null;
}

// ============================================
// Turso Client for Production
// ============================================

let tursoClient: Client | null = null;

function getTurso(): Client {
  if (!tursoClient) {
    const url = process.env.DATABASE_URL?.trim();
    const authToken = process.env.DATABASE_AUTH_TOKEN?.trim();

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
    async findFirst(args: { where: { token?: string; id?: string; userId?: string } }): Promise<DbVerificationToken | null> {
      // findFirst is similar to findUnique but supports more conditions
      let sql = 'SELECT * FROM VerificationToken WHERE 1=1';
      const values: unknown[] = [];

      if (args.where.token) {
        sql += ' AND token = ?';
        values.push(args.where.token);
      }
      if (args.where.id) {
        sql += ' AND id = ?';
        values.push(args.where.id);
      }
      if (args.where.userId) {
        sql += ' AND userId = ?';
        values.push(args.where.userId);
      }

      const rows = await tursoExecute(sql, values);
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
    async findMany(args: { where?: { userId?: string } }): Promise<DbVerificationToken[]> {
      let sql = 'SELECT * FROM VerificationToken';
      const values: unknown[] = [];

      if (args.where?.userId) {
        sql += ' WHERE userId = ?';
        values.push(args.where.userId);
      }

      const rows = await tursoExecute(sql, values);
      return rows.map((r: unknown) => {
        const row = r as Record<string, unknown>;
        return {
          id: String(row.id),
          token: String(row.token),
          userId: String(row.userId),
          expiresAt: new Date(String(row.expiresAt)),
          createdAt: new Date(String(row.createdAt)),
        };
      });
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
    async findFirst(args: { where: { userId?: string; topic?: string; userLevel?: string; userGoal?: string; id?: string } }): Promise<DbSavedLearningPath | null> {
      const conditions: string[] = [];
      const values: unknown[] = [];

      if (args.where.id) {
        conditions.push('id = ?');
        values.push(args.where.id);
      }
      if (args.where.userId) {
        conditions.push('userId = ?');
        values.push(args.where.userId);
      }
      if (args.where.topic) {
        conditions.push('topic = ?');
        values.push(args.where.topic);
      }
      if (args.where.userLevel) {
        conditions.push('userLevel = ?');
        values.push(args.where.userLevel);
      }
      if (args.where.userGoal) {
        conditions.push('userGoal = ?');
        values.push(args.where.userGoal);
      }

      let sql = 'SELECT * FROM SavedLearningPath';
      if (conditions.length > 0) {
        sql += ` WHERE ${conditions.join(' AND ')}`;
      }
      sql += ' ORDER BY createdAt DESC LIMIT 1';

      const rows = await tursoExecute(sql, values);
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
    async update(args: { where: { id: string }; data: { totalVideos?: number; estimatedTotalTime?: string; summary?: string; completionGoals?: string; stages?: string } }): Promise<DbSavedLearningPath> {
      const updates: string[] = [];
      const values: unknown[] = [];

      if (args.data.totalVideos !== undefined) {
        updates.push('totalVideos = ?');
        values.push(args.data.totalVideos);
      }
      if (args.data.estimatedTotalTime !== undefined) {
        updates.push('estimatedTotalTime = ?');
        values.push(args.data.estimatedTotalTime);
      }
      if (args.data.summary !== undefined) {
        updates.push('summary = ?');
        values.push(args.data.summary);
      }
      if (args.data.completionGoals !== undefined) {
        updates.push('completionGoals = ?');
        values.push(args.data.completionGoals);
      }
      if (args.data.stages !== undefined) {
        updates.push('stages = ?');
        values.push(args.data.stages);
      }

      updates.push('updatedAt = ?');
      values.push(new Date().toISOString());
      values.push(args.where.id);

      if (updates.length > 1) {
        await tursoExecute(`UPDATE SavedLearningPath SET ${updates.join(', ')} WHERE id = ?`, values);
      }
      
      const path = await tursoDb.savedLearningPath.findUnique({ where: { id: args.where.id } });
      return path!;
    },
    async findUnique(args: { where: { id: string } }): Promise<DbSavedLearningPath | null> {
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
    async findMany(args: { where: { userId: string }; orderBy?: { createdAt: string } }): Promise<DbSavedLearningPath[]> {
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
    async findMany(args: { where: { learningPathId: string } }): Promise<DbVideoProgress[]> {
      const rows = await tursoExecute('SELECT * FROM VideoProgress WHERE learningPathId = ?', [args.where.learningPathId]);
      return rows.map((r: unknown) => {
        const row = r as Record<string, unknown>;
        return {
          id: String(row.id),
          userId: String(row.userId),
          learningPathId: String(row.learningPathId),
          videoId: String(row.videoId),
          watched: Boolean(row.watched),
          watchedAt: row.watchedAt ? new Date(String(row.watchedAt)) : null,
        };
      });
    },
    async upsert(args: { where: { learningPathId_videoId: { learningPathId: string; videoId: string } }; create: { userId: string; learningPathId: string; videoId: string; watched: boolean; watchedAt?: Date | null }; update: { watched: boolean; watchedAt?: Date | null } }): Promise<DbVideoProgress> {
      const { learningPathId, videoId } = args.where.learningPathId_videoId;
      const rows = await tursoExecute('SELECT id FROM VideoProgress WHERE learningPathId = ? AND videoId = ?', [learningPathId, videoId]);

      if (rows.length > 0) {
        // Update existing
        const row = rows[0] as Record<string, unknown>;
        const id = String(row.id);
        await tursoExecute('UPDATE VideoProgress SET watched = ?, watchedAt = ?, updatedAt = ? WHERE learningPathId = ? AND videoId = ?',
          [args.update.watched ? 1 : 0, args.update.watchedAt?.toISOString() ?? null, new Date().toISOString(), learningPathId, videoId]);
        
        return {
          id,
          userId: '', // Not needed for return here
          learningPathId,
          videoId,
          watched: args.update.watched,
          watchedAt: args.update.watchedAt ?? null,
        };
      } else {
        // Create new
        const id = generateId();
        const now = new Date().toISOString();
        const watchedAt = args.create.watchedAt?.toISOString() ?? null;
        await tursoExecute('INSERT INTO VideoProgress (id, userId, learningPathId, videoId, watched, watchedAt, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [id, args.create.userId, learningPathId, videoId, args.create.watched ? 1 : 0, watchedAt, now, now]);
        
        return {
          id,
          userId: args.create.userId,
          learningPathId,
          videoId,
          watched: args.create.watched,
          watchedAt: args.create.watchedAt ?? null,
        };
      }
    },
    async deleteMany(args: { where: { learningPathId: string } }): Promise<{ count: number }> {
      await tursoExecute('DELETE FROM VideoProgress WHERE learningPathId = ?', [args.where.learningPathId]);
      return { count: 0 };
    },
  },
};

// ============================================
// Prisma Client for Local Development (dynamically imported)
// ============================================

declare global {
  // eslint-disable-next-line no-var, @typescript-eslint/no-explicit-any
  var __prisma: any;
}

async function getPrismaClient(): Promise<any> {
  if (globalThis.__prisma) return globalThis.__prisma;
  // Dynamic import to avoid bundle-time schema validation
  const { PrismaClient } = await import('@prisma/client');
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
  const databaseUrl = process.env.DATABASE_URL?.trim() || '';
  const authToken = process.env.DATABASE_AUTH_TOKEN?.trim();

  // Turso is detected by either:
  // 1. DATABASE_URL starting with libsql://
  // 2. DATABASE_AUTH_TOKEN being set (Turso-specific)
  const isTurso = databaseUrl.startsWith('libsql://') || !!authToken;

  console.log('[getDb] DATABASE_URL starts with:', databaseUrl.substring(0, 20));
  console.log('[getDb] AUTH_TOKEN present:', !!authToken);
  console.log('[getDb] Using:', isTurso ? 'Turso' : 'Prisma');

  if (isTurso) {
    return tursoDb;
  }

  // Local development fallback - getPrismaClient is async but we handle it
  // Note: This path should NOT be reached in production
  console.warn('[getDb] WARNING: Using Prisma in production is not supported');
  throw new Error('Prisma is not available in production. Please set DATABASE_URL and DATABASE_AUTH_TOKEN.');
}

export default getDb;
