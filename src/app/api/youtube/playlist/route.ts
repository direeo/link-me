// YouTube playlist creation endpoint
// POST - Creates a YouTube playlist from a learning path

import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';
import { exportLearningPathToPlaylist } from '@/lib/youtube-playlist';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
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

        const body = await request.json();
        const { learningPathId, title } = body;

        if (!learningPathId) {
            return NextResponse.json(
                { success: false, message: 'Learning path ID is required' },
                { status: 400 }
            );
        }

        // Export to YouTube playlist
        const result = await exportLearningPathToPlaylist(
            decoded.userId,
            learningPathId,
            title
        );

        if (!result.success) {
            return NextResponse.json(
                { success: false, message: result.error },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Playlist created successfully!',
            playlistId: result.playlistId,
            playlistUrl: result.playlistUrl,
            videosAdded: result.videosAdded,
            videosFailed: result.videosFailed,
        });
    } catch (error) {
        console.error('Playlist creation error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to create playlist' },
            { status: 500 }
        );
    }
}
