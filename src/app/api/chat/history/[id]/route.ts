// Get single chat history detail
// GET /api/chat/history/[id]

import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        if (!id) return NextResponse.json({ success: false, message: 'ID required' }, { status: 400 });

        // Check auth
        const accessToken = request.cookies.get('accessToken')?.value;
        if (!accessToken) return NextResponse.json({ success: false, message: 'Please log in' }, { status: 401 });

        const decoded = verifyAccessToken(accessToken);
        if (!decoded || decoded.isGuest) return NextResponse.json({ success: false, message: 'Account required' }, { status: 401 });

        const db = getDb();
        const entry = await db.chatHistory.findUnique({
            where: { id, userId: decoded.userId },
        });

        if (!entry) return NextResponse.json({ success: false, message: 'History node not found' }, { status: 404 });

        try {
            const data = JSON.parse(entry.messages);
            console.log('Parsed history data successfully:', { id: entry.id, hasMessages: !!data.messages });
            
            // Ensure messages is an array - handle old format
            let messages = data.messages || [];
            if (!Array.isArray(messages)) {
                console.warn('Messages is not an array, converting...');
                messages = [];
            }

            return NextResponse.json({
                success: true,
                data: {
                    id: entry.id,
                    messages: messages,
                    topic: data.topic || 'Untitled',
                    skillLevel: data.skillLevel,
                    goal: data.goal,
                    query: data.query,
                    tutorials: data.tutorials,
                    learningPath: data.learningPath,
                    timestamp: data.timestamp || entry.createdAt,
                    tutorialCount: data.tutorialCount,
                    createdAt: entry.createdAt,
                    updatedAt: entry.updatedAt,
                }
            });
        } catch (parseError) {
            console.error('Failed to parse history messages:', parseError);
            console.error('Raw messages string:', entry.messages.substring(0, 500));
            return NextResponse.json({ 
                success: false, 
                message: 'This conversation data is corrupted and cannot be loaded. Please create a new conversation.' 
            }, { status: 500 });
        }

    } catch (error) {
        console.error('History detail error:', error);
        return NextResponse.json({ success: false, message: 'Failed to access history registry' }, { status: 500 });
    }
}
