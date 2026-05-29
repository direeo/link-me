// Admin API to view all users
// GET /api/admin/users
// Requires header: Authorization: Bearer YOUR_ADMIN_SECRET

import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';
import { getDb, DbUser } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        // Check admin secret via Authorization header (never in query params — those appear in logs)
        const adminSecret = process.env.ADMIN_SECRET;
        const authHeader = request.headers.get('authorization') ?? '';
        const provided = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

        const isAuthorized = adminSecret && provided.length > 0 &&
            timingSafeEqual(Buffer.from(provided), Buffer.from(adminSecret));

        if (!isAuthorized) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const db = getDb();

        // Get all users
        const users = await db.user.findMany();

        // Get total counts
        const totalUsers = await db.user.count();
        const verifiedUsers = await db.user.count({ where: { emailVerified: true } });

        return NextResponse.json({
            success: true,
            data: {
                totalUsers,
                verifiedUsers,
                users: (users as DbUser[]).map(user => ({
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    emailVerified: user.emailVerified,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt,
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
