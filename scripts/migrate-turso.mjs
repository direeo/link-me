// Migration script to create tables on Turso
// Run with: node scripts/migrate-turso.mjs

import { createClient } from '@libsql/client';
import 'dotenv/config';

const DATABASE_URL = process.env.DATABASE_URL;
const DATABASE_AUTH_TOKEN = process.env.DATABASE_AUTH_TOKEN;

if (!DATABASE_URL) {
    console.error('❌ DATABASE_URL not set');
    process.exit(1);
}

console.log('Connecting to:', DATABASE_URL);

const client = createClient({
    url: DATABASE_URL,
    authToken: DATABASE_AUTH_TOKEN,
});

async function migrate() {
    console.log('Creating tables on Turso...\n');

    try {
        // Create User table
        await client.execute(`
      CREATE TABLE IF NOT EXISTS User (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        passwordHash TEXT NOT NULL,
        name TEXT,
        emailVerified INTEGER DEFAULT 0,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        twoFactorEnabled INTEGER DEFAULT 0,
        twoFactorSecret TEXT,
        twoFactorBackupCodes TEXT,
        youtubeAccessToken TEXT,
        youtubeRefreshToken TEXT,
        youtubeTokenExpiry TEXT,
        youtubeChannelId TEXT,
        youtubeChannelName TEXT
      )
    `);
        console.log('✅ User table created');

        // Create VerificationToken table
        await client.execute(`
      CREATE TABLE IF NOT EXISTS VerificationToken (
        id TEXT PRIMARY KEY,
        token TEXT UNIQUE NOT NULL,
        userId TEXT NOT NULL,
        expiresAt TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
      )
    `);
        console.log('✅ VerificationToken table created');

        // Create RateLimitEntry table
        await client.execute(`
      CREATE TABLE IF NOT EXISTS RateLimitEntry (
        id TEXT PRIMARY KEY,
        key TEXT UNIQUE NOT NULL,
        count INTEGER DEFAULT 1,
        windowStart TEXT NOT NULL,
        blockedUntil TEXT
      )
    `);
        console.log('✅ RateLimitEntry table created');

        // Create ChatHistory table
        await client.execute(`
      CREATE TABLE IF NOT EXISTS ChatHistory (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        messages TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
      )
    `);
        console.log('✅ ChatHistory table created');

        // Create SavedLearningPath table
        await client.execute(`
      CREATE TABLE IF NOT EXISTS SavedLearningPath (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        topic TEXT NOT NULL,
        userLevel TEXT NOT NULL,
        userGoal TEXT NOT NULL,
        totalVideos INTEGER NOT NULL,
        estimatedTotalTime TEXT NOT NULL,
        stages TEXT NOT NULL,
        completionGoals TEXT NOT NULL,
        summary TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
      )
    `);
        console.log('✅ SavedLearningPath table created');

        // Create VideoProgress table
        await client.execute(`
      CREATE TABLE IF NOT EXISTS VideoProgress (
        id TEXT PRIMARY KEY,
        learningPathId TEXT NOT NULL,
        videoId TEXT NOT NULL,
        watched INTEGER DEFAULT 0,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        FOREIGN KEY (learningPathId) REFERENCES SavedLearningPath(id) ON DELETE CASCADE,
        UNIQUE(learningPathId, videoId)
      )
    `);
        console.log('✅ VideoProgress table created');

        console.log('\n🎉 All tables created successfully!');
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

migrate();
