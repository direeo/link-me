// Admin API to view all users
// GET /api/admin/users?secret=YOUR_ADMIN_SECRET

import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        // Check admin secret
        const { searchParams } = new URL(request.url);
        const secret = searchParams.get('secret');
        const adminSecret = process.env.ADMIN_SECRET;

        if (!adminSecret || secret !== adminSecret) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const db = getDb();

        // Get all users (excluding password hash for security)
        const users = await db.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                emailVerified: true,
                createdAt: true,
                updatedAt: true,
                _count: {
                    select: {
                        chatHistories: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        // Get total counts
        const totalUsers = await db.user.count();
        const verifiedUsers = await db.user.count({
            where: { emailVerified: true },
        });

        return NextResponse.json({
            success: true,
            data: {
                totalUsers,
                verifiedUsers,
                users: users.map(user => ({
                    ...user,
                    chatCount: user._count.chatHistories,
                    _count: undefined,
                })),
            },
        });
    } catch (error) {
        console.error('Admin users error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch users' },
            { status: 500 }
        );
    }
}
