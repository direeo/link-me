// Chat history API endpoint
// GET /api/chat/history - Get user's chat history

import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        // Check auth - must be logged in (not guest)
        const accessToken = request.cookies.get('accessToken')?.value;

        if (!accessToken) {
            return NextResponse.json({
                success: false,
                message: 'Please log in to view your chat history',
            }, { status: 401 });
        }

        const decoded = verifyAccessToken(accessToken);

        if (!decoded || decoded.isGuest) {
            return NextResponse.json({
                success: false,
                message: 'Please create an account to save your chat history',
            }, { status: 401 });
        }

        const db = getDb();

        // Get chat history for this user
        const history = await db.chatHistory.findMany({
            where: { userId: decoded.userId },
        });

        // Parse and format the history
        const formattedHistory = history.map((entry: { id: string; messages: string; createdAt: Date }) => {
            try {
                const data = JSON.parse(entry.messages);
                return {
                    id: entry.id,
                    topic: data.topic,
                    skillLevel: data.skillLevel,
                    goal: data.goal,
                    tutorialCount: data.tutorialCount,
                    timestamp: data.timestamp || entry.createdAt,
                };
            } catch {
                return {
                    id: entry.id,
                    topic: 'Unknown',
                    timestamp: entry.createdAt,
                };
            }
        });

        // Sort by timestamp, newest first
        formattedHistory.sort((a: { timestamp: string | Date }, b: { timestamp: string | Date }) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        return NextResponse.json({
            success: true,
            history: formattedHistory,
            count: formattedHistory.length,
        });

    } catch (error) {
        console.error('Chat history error:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to load chat history',
        }, { status: 500 });
    }
}
