// User preferences API
// GET  /api/settings/preferences  - get current user preferences
// PATCH /api/settings/preferences - update preferences

import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Ensure the emailReminders column exists (safe migration for existing deployments)
async function ensureEmailRemindersColumn() {
    try {
        const db = getDb();
        // Try to add the column; it's a no-op if it already exists in Prisma dev,
        // and for Turso we attempt it and silently ignore "duplicate column" errors.
        await db.user.update({
            where: { id: '__schema_check__' },
            data: { emailReminders: false },
        });
    } catch {
        // Expected to fail either because user doesn't exist OR column doesn't exist yet.
        // We'll try the actual ALTER TABLE for Turso separately via a raw query approach.
    }
}

export async function GET(request: NextRequest) {
    try {
        const accessToken = request.cookies.get('accessToken')?.value;
        if (!accessToken) {
            return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
        }

        const decoded = verifyAccessToken(accessToken);
        if (!decoded || decoded.isGuest) {
            return NextResponse.json({ success: false, message: 'Account required' }, { status: 401 });
        }

        const db = getDb();
        const user = await db.user.findUnique({ where: { id: decoded.userId } });
        if (!user) {
            return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            preferences: {
                emailReminders: user.emailReminders ?? false,
            },
        });
    } catch (error) {
        console.error('GET preferences error:', error);
        return NextResponse.json({ success: false, message: 'Failed to load preferences' }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const accessToken = request.cookies.get('accessToken')?.value;
        if (!accessToken) {
            return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
        }

        const decoded = verifyAccessToken(accessToken);
        if (!decoded || decoded.isGuest) {
            return NextResponse.json({ success: false, message: 'Account required' }, { status: 401 });
        }

        const body = await request.json();
        const { emailReminders } = body;

        if (typeof emailReminders !== 'boolean') {
            return NextResponse.json({ success: false, message: 'Invalid preferences data' }, { status: 400 });
        }

        const db = getDb();

        // Attempt to add the column first (safe for Turso; silently fails if already exists)
        try {
            const { createClient } = await import('@libsql/client');
            const url = process.env.DATABASE_URL?.trim();
            const authToken = process.env.DATABASE_AUTH_TOKEN?.trim();
            if (url && (url.startsWith('libsql://') || authToken)) {
                const client = createClient({ url, authToken });
                await client.execute('ALTER TABLE User ADD COLUMN emailReminders INTEGER DEFAULT 0').catch(() => {
                    // Column already exists — that's fine
                });
            }
        } catch {
            // Not using Turso directly — Prisma dev env, schema already migrated
        }

        await db.user.update({
            where: { id: decoded.userId },
            data: { emailReminders },
        });

        return NextResponse.json({
            success: true,
            message: 'Preferences updated',
            preferences: { emailReminders },
        });
    } catch (error) {
        console.error('PATCH preferences error:', error);
        return NextResponse.json({ success: false, message: 'Failed to save preferences' }, { status: 500 });
    }
}
