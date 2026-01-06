// Admin API to view all users
// GET /api/admin/users?secret=YOUR_ADMIN_SECRET

import { NextRequest, NextResponse } from 'next/server';
import { getDb, DbUser } from '@/lib/db';

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
