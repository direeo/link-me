// API route to verify email using 6-digit code
// POST /api/auth/verify

import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { isTokenExpired } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, code } = body;

        if (!email || !code) {
            return NextResponse.json(
                { success: false, message: 'Email and verification code are required' },
                { status: 400 }
            );
        }

        const db = getDb();

        // Find the user first to get their ID
        const user = await db.user.findUnique({
            where: { email: email.toLowerCase() },
            include: { verificationTokens: true }
        });

        if (!user) {
            return NextResponse.json(
                { success: false, message: 'Account not found' },
                { status: 404 }
            );
        }

        // Find valid token for this user
        const tokenEntry = await db.verificationToken.findFirst({
            where: {
                token: code,
                userId: user.id
            },
            orderBy: { createdAt: 'desc' }
        });

        if (!tokenEntry) {
            return NextResponse.json(
                { success: false, message: 'Invalid verification code' },
                { status: 400 }
            );
        }

        if (isTokenExpired(tokenEntry.expiresAt)) {
            return NextResponse.json(
                { success: false, message: 'Verification code has expired' },
                { status: 400 }
            );
        }

        // Verification success - Update user and delete token
        await db.$transaction([
            db.user.update({
                where: { id: user.id },
                data: { emailVerified: true }
            }),
            db.verificationToken.delete({
                where: { id: tokenEntry.id }
            })
        ]);

        return NextResponse.json({
            success: true,
            message: 'Email verified successfully! Welcome to LinkMe.'
        });

    } catch (error) {
        console.error('Verification error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to complete verification' },
            { status: 500 }
        );
    }
}
