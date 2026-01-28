// YouTube connection status endpoint
// GET - Check if user has connected YouTube
// DELETE - Disconnect YouTube account

import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { verifyAccessToken } from '@/lib/auth';
import { disconnectYouTube } from '@/lib/youtube-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const prisma = getDb();

    try {
        // Auth check
        const accessToken = request.cookies.get('accessToken')?.value;
        if (!accessToken) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const decoded = verifyAccessToken(accessToken);
        if (!decoded || decoded.isGuest) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get user's YouTube connection status
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                youtubeChannelId: true,
                youtubeChannelName: true,
                youtubeAccessToken: true,
            },
        });

        if (!user) {
            return NextResponse.json(
                { success: false, message: 'User not found' },
                { status: 404 }
            );
        }

        const isConnected = Boolean(user.youtubeAccessToken);

        return NextResponse.json({
            success: true,
            connected: isConnected,
            channelId: user.youtubeChannelId || null,
            channelName: user.youtubeChannelName || null,
        });
    } catch (error) {
        console.error('YouTube status error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to get YouTube status' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        // Auth check
        const accessToken = request.cookies.get('accessToken')?.value;
        if (!accessToken) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const decoded = verifyAccessToken(accessToken);
        if (!decoded || decoded.isGuest) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Disconnect YouTube
        await disconnectYouTube(decoded.userId);

        return NextResponse.json({
            success: true,
            message: 'YouTube account disconnected',
        });
    } catch (error) {
        console.error('YouTube disconnect error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to disconnect YouTube' },
            { status: 500 }
        );
    }
}
