// Database setup script for Turso
// Run with: node scripts/setup-db.mjs

import { createClient } from '@libsql/client';

const db = createClient({
    url: process.env.DATABASE_URL || 'libsql://linkme-temidireojo.aws-eu-west-1.turso.io',
    authToken: process.env.DATABASE_AUTH_TOKEN,
});

const schema = `
-- User table
CREATE TABLE IF NOT EXISTS User (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    passwordHash TEXT NOT NULL,
    name TEXT,
    emailVerified INTEGER DEFAULT 0,
    createdAt TEXT DEFAULT (datetime('now')),
    updatedAt TEXT DEFAULT (datetime('now'))
);

-- Verification tokens
CREATE TABLE IF NOT EXISTS VerificationToken (
    id TEXT PRIMARY KEY,
    token TEXT UNIQUE NOT NULL,
    userId TEXT NOT NULL,
    expiresAt TEXT NOT NULL,
    createdAt TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_verification_token ON VerificationToken(token);
CREATE INDEX IF NOT EXISTS idx_verification_userId ON VerificationToken(userId);

-- Chat history
CREATE TABLE IF NOT EXISTS ChatHistory (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    messages TEXT NOT NULL,
    createdAt TEXT DEFAULT (datetime('now')),
    updatedAt TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_chat_userId ON ChatHistory(userId);

-- Rate limiting
CREATE TABLE IF NOT EXISTS RateLimitEntry (
    id TEXT PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    count INTEGER DEFAULT 1,
    windowStart TEXT DEFAULT (datetime('now')),
    blockedUntil TEXT
);
CREATE INDEX IF NOT EXISTS idx_ratelimit_key ON RateLimitEntry(key);
`;

async function setup() {
    console.log('Setting up Turso database...');

    try {
        // Split by semicolon and execute each statement
        const statements = schema.split(';').filter(s => s.trim());

        for (const stmt of statements) {
            if (stmt.trim()) {
                await db.execute(stmt);
                console.log('✓ Executed:', stmt.trim().substring(0, 50) + '...');
            }
        }

        console.log('\n✅ Database setup complete!');
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

setup();
