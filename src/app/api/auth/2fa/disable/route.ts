// 2FA Disable API endpoint
// POST - Disable 2FA (requires password verification)

import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { verifyAccessToken, verifyPassword } from '@/lib/auth';

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
        const { password } = body;

        if (!password) {
            return NextResponse.json(
                { success: false, message: 'Password is required to disable 2FA' },
                { status: 400 }
            );
        }

        const prisma = getDb();
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                passwordHash: true,
                twoFactorEnabled: true,
            },
        });

        if (!user) {
            return NextResponse.json(
                { success: false, message: 'User not found' },
                { status: 404 }
            );
        }

        if (!user.twoFactorEnabled) {
            return NextResponse.json(
                { success: false, message: '2FA is not enabled' },
                { status: 400 }
            );
        }

        // Verify password
        const isPasswordValid = await verifyPassword(password, user.passwordHash);
        if (!isPasswordValid) {
            return NextResponse.json(
                { success: false, message: 'Invalid password' },
                { status: 400 }
            );
        }

        // Disable 2FA
        await prisma.user.update({
            where: { id: decoded.userId },
            data: {
                twoFactorEnabled: false,
                twoFactorSecret: null,
                twoFactorBackupCodes: null,
            },
        });

        return NextResponse.json({
            success: true,
            message: '2FA has been disabled',
        });
    } catch (error) {
        console.error('2FA disable error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to disable 2FA' },
            { status: 500 }
        );
    }
}
