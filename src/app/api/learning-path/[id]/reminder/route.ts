// PATCH /api/learning-path/[id]/reminder
// Toggle the per-path daily reminder opt-in for the authenticated user.
// Body: { reminderEnabled: boolean }
// Next.js 16: params is a Promise — must be awaited.

import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const accessToken = request.cookies.get('accessToken')?.value;
        if (!accessToken) {
            return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
        }

        const decoded = verifyAccessToken(accessToken);
        if (!decoded || decoded.isGuest) {
            return NextResponse.json({ success: false, message: 'Account required' }, { status: 401 });
        }

        const body = await request.json();
        if (typeof body.reminderEnabled !== 'boolean') {
            return NextResponse.json({ success: false, message: 'reminderEnabled must be a boolean' }, { status: 400 });
        }

        const db = getDb();

        // Safe Turso migration: add column if it doesn't exist yet
        try {
            const { createClient } = await import('@libsql/client');
            const url = process.env.DATABASE_URL?.trim();
            const authToken = process.env.DATABASE_AUTH_TOKEN?.trim();
            if (url && (url.startsWith('libsql://') || authToken)) {
                const client = createClient({ url, authToken });
                await client.execute(
                    'ALTER TABLE SavedLearningPath ADD COLUMN reminderEnabled INTEGER DEFAULT 1'
                ).catch(() => { /* already exists — fine */ });
            }
        } catch {
            // Local Prisma dev env — schema already migrated
        }

        // Confirm path belongs to this user before updating
        const path = await db.savedLearningPath.findUnique({ where: { id } });
        if (!path || path.userId !== decoded.userId) {
            return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
        }

        await db.savedLearningPath.update({
            where: { id },
            data: { reminderEnabled: body.reminderEnabled },
        });

        return NextResponse.json({ success: true, reminderEnabled: body.reminderEnabled });
    } catch (error) {
        console.error('PATCH learning-path reminder error:', error);
        return NextResponse.json({ success: false, message: 'Failed to update reminder' }, { status: 500 });
    }
}
