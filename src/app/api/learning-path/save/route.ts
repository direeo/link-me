// API endpoint for saving and managing learning paths
// POST /api/learning-path/save - Save a learning path
// GET /api/learning-path/save - Get user's saved learning paths

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
                message: 'Please log in to save learning paths',
            }, { status: 401 });
        }

        const decoded = verifyAccessToken(accessToken);

        if (!decoded || decoded.isGuest) {
            return NextResponse.json({
                success: false,
                message: 'Please create an account to save learning paths',
            }, { status: 401 });
        }

        const body = await request.json();
        const { learningPath } = body;

        if (!learningPath || !learningPath.topic) {
            return NextResponse.json({
                success: false,
                message: 'Learning path data is required',
            }, { status: 400 });
        }

        const db = getDb();

        // Check if this learning path already exists for users (by topic + level + goal)
        const existing = await db.savedLearningPath.findFirst({
            where: {
                userId: decoded.userId,
                topic: learningPath.topic,
                userLevel: learningPath.userLevel,
                userGoal: learningPath.userGoal,
            },
        });

        if (existing) {
            // Update existing
            const updated = await db.savedLearningPath.update({
                where: { id: existing.id },
                data: {
                    totalVideos: learningPath.totalVideos,
                    estimatedTotalTime: learningPath.estimatedTotalTime,
                    summary: learningPath.summary,
                    completionGoals: JSON.stringify(learningPath.completionGoals || []),
                    stages: JSON.stringify(learningPath.stages || []),
                },
            });

            return NextResponse.json({
                success: true,
                message: 'Learning path updated',
                learningPathId: updated.id,
            });
        }

        // Create new
        const saved = await db.savedLearningPath.create({
            data: {
                userId: decoded.userId,
                topic: learningPath.topic,
                userLevel: learningPath.userLevel || 'beginner',
                userGoal: learningPath.userGoal || 'learn',
                totalVideos: learningPath.totalVideos || 0,
                estimatedTotalTime: learningPath.estimatedTotalTime || '',
                summary: learningPath.summary || '',
                completionGoals: JSON.stringify(learningPath.completionGoals || []),
                stages: JSON.stringify(learningPath.stages || []),
            },
        });

        return NextResponse.json({
            success: true,
            message: 'Learning path saved!',
            learningPathId: saved.id,
        });

    } catch (error) {
        console.error('Save learning path error:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to save learning path',
        }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        // Check auth - must be logged in (not guest)
        const accessToken = request.cookies.get('accessToken')?.value;

        if (!accessToken) {
            return NextResponse.json({
                success: false,
                message: 'Please log in to view saved learning paths',
            }, { status: 401 });
        }

        const decoded = verifyAccessToken(accessToken);

        if (!decoded || decoded.isGuest) {
            return NextResponse.json({
                success: false,
                message: 'Please create an account to save learning paths',
            }, { status: 401 });
        }

        const db = getDb();

        // Get all saved learning paths for this user with their progress
        const learningPaths = await db.savedLearningPath.findMany({
            where: { userId: decoded.userId },
            include: {
                videoProgress: true,
            },
            orderBy: { updatedAt: 'desc' },
        });

        // Format with progress percentage
        const formatted = learningPaths.map((lp: {
            id: string;
            topic: string;
            userLevel: string;
            userGoal: string;
            totalVideos: number;
            estimatedTotalTime: string;
            summary: string;
            completionGoals: string;
            stages: string;
            createdAt: Date;
            updatedAt: Date;
            videoProgress: Array<{ watched: boolean }>;
        }) => {
            const watchedCount = lp.videoProgress.filter((vp) => vp.watched).length;
            const progress = lp.totalVideos > 0 ? Math.round((watchedCount / lp.totalVideos) * 100) : 0;

            return {
                id: lp.id,
                topic: lp.topic,
                userLevel: lp.userLevel,
                userGoal: lp.userGoal,
                totalVideos: lp.totalVideos,
                watchedVideos: watchedCount,
                progress,
                estimatedTotalTime: lp.estimatedTotalTime,
                summary: lp.summary,
                completionGoals: JSON.parse(lp.completionGoals),
                stages: JSON.parse(lp.stages),
                createdAt: lp.createdAt,
                updatedAt: lp.updatedAt,
            };
        });

        return NextResponse.json({
            success: true,
            learningPaths: formatted,
            count: formatted.length,
        });

    } catch (error) {
        console.error('Get learning paths error:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to load learning paths',
        }, { status: 500 });
    }
}
