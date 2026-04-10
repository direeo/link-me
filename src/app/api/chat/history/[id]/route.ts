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
            return NextResponse.json({
                success: true,
                data: {
                    id: entry.id,
                    ...data,
                    createdAt: entry.createdAt,
                    updatedAt: entry.updatedAt,
                }
            });
        } catch {
            return NextResponse.json({ success: false, message: 'Syntax failure in history registry' }, { status: 500 });
        }

    } catch (error) {
        console.error('History detail error:', error);
        return NextResponse.json({ success: false, message: 'Failed to access history registry' }, { status: 500 });
    }
}
