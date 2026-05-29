// Learning path completion endpoint
// POST /api/learning-path/complete
// Called when a user marks all videos in a learning path as watched.
// Sends a congratulations email if the user has email reminders enabled.

import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { sendLearningPathCompletionEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
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
        const { topic, totalVideos, estimatedTotalTime } = body;

        if (!topic) {
            return NextResponse.json({ success: false, message: 'Missing topic' }, { status: 400 });
        }

        const db = getDb();
        const user = await db.user.findUnique({ where: { id: decoded.userId } });

        if (!user) {
            return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
        }

        // Only send if user has email reminders enabled
        if (!user.emailReminders) {
            return NextResponse.json({ success: true, message: 'Reminders disabled — no email sent' });
        }

        const result = await sendLearningPathCompletionEmail(
            user.email,
            user.name,
            topic,
            totalVideos || 0,
            estimatedTotalTime || 'Unknown'
        );

        return NextResponse.json({
            success: result.success,
            message: result.message,
        });
    } catch (error) {
        console.error('Learning path completion error:', error);
        return NextResponse.json({ success: false, message: 'Failed to process completion' }, { status: 500 });
    }
}
