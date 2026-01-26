// API endpoint for tracking video progress
// POST /api/learning-path/progress - Mark video as watched/unwatched
// GET /api/learning-path/progress?learningPathId=xxx - Get progress for a learning path

import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        // Check auth - must be logged in (not guest)
        const accessToken = request.cookies.get('accessToken')?.value;

        if (!accessToken) {
            return NextResponse.json({
                success: false,
                message: 'Please log in to track progress',
            }, { status: 401 });
        }

        const decoded = verifyAccessToken(accessToken);

        if (!decoded || decoded.isGuest) {
            return NextResponse.json({
                success: false,
                message: 'Please create an account to track progress',
            }, { status: 401 });
        }

        const body = await request.json();
        const { learningPathId, videoId, watched } = body;

        if (!learningPathId || !videoId) {
            return NextResponse.json({
                success: false,
                message: 'Learning path ID and video ID are required',
            }, { status: 400 });
        }

        const db = getDb();

        // Verify the learning path belongs to this user
        const learningPath = await db.savedLearningPath.findFirst({
            where: {
                id: learningPathId,
                userId: decoded.userId,
            },
        });

        if (!learningPath) {
            return NextResponse.json({
                success: false,
                message: 'Learning path not found',
            }, { status: 404 });
        }

        // Upsert the video progress
        const progress = await db.videoProgress.upsert({
            where: {
                learningPathId_videoId: {
                    learningPathId,
                    videoId,
                },
            },
            update: {
                watched: watched === true,
                watchedAt: watched ? new Date() : null,
            },
            create: {
                userId: decoded.userId,
                learningPathId,
                videoId,
                watched: watched === true,
                watchedAt: watched ? new Date() : null,
            },
        });

        // Get total progress for this learning path
        const allProgress = await db.videoProgress.findMany({
            where: { learningPathId },
        });

        const watchedCount = allProgress.filter((p: { watched: boolean }) => p.watched).length;
        const progressPercent = learningPath.totalVideos > 0
            ? Math.round((watchedCount / learningPath.totalVideos) * 100)
            : 0;

        return NextResponse.json({
            success: true,
            message: watched ? 'Video marked as watched!' : 'Video unmarked',
            progress: {
                videoId,
                watched: progress.watched,
                totalProgress: progressPercent,
                watchedCount,
                totalVideos: learningPath.totalVideos,
            },
        });

    } catch (error) {
        console.error('Update progress error:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to update progress',
        }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        // Check auth
        const accessToken = request.cookies.get('accessToken')?.value;

        if (!accessToken) {
            return NextResponse.json({
                success: false,
                message: 'Please log in to view progress',
            }, { status: 401 });
        }

        const decoded = verifyAccessToken(accessToken);

        if (!decoded || decoded.isGuest) {
            return NextResponse.json({
                success: false,
                message: 'Please create an account to track progress',
            }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const learningPathId = searchParams.get('learningPathId');

        if (!learningPathId) {
            return NextResponse.json({
                success: false,
                message: 'Learning path ID is required',
            }, { status: 400 });
        }

        const db = getDb();

        // Verify ownership
        const learningPath = await db.savedLearningPath.findFirst({
            where: {
                id: learningPathId,
                userId: decoded.userId,
            },
        });

        if (!learningPath) {
            return NextResponse.json({
                success: false,
                message: 'Learning path not found',
            }, { status: 404 });
        }

        // Get all video progress for this learning path
        const progress = await db.videoProgress.findMany({
            where: { learningPathId },
        });

        // Create a map of videoId -> watched status
        const progressMap: Record<string, boolean> = {};
        progress.forEach((p: { videoId: string; watched: boolean }) => {
            progressMap[p.videoId] = p.watched;
        });

        const watchedCount = progress.filter((p: { watched: boolean }) => p.watched).length;
        const progressPercent = learningPath.totalVideos > 0
            ? Math.round((watchedCount / learningPath.totalVideos) * 100)
            : 0;

        return NextResponse.json({
            success: true,
            progress: progressMap,
            stats: {
                watchedCount,
                totalVideos: learningPath.totalVideos,
                progressPercent,
            },
        });

    } catch (error) {
        console.error('Get progress error:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to load progress',
        }, { status: 500 });
    }
}
