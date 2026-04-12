// API route to verify email using 6-digit code
// POST /api/auth/verify

import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { isTokenExpired, generateAccessToken, generateRefreshToken } from '@/lib/auth';

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

        // Verification success - Update user and delete token sequentially
        await db.user.update({
            where: { id: user.id },
            data: { emailVerified: true }
        });
        
        await db.verificationToken.delete({
            where: { id: tokenEntry.id }
        });

        // Generate auth tokens since they are newly verified
        const tokenPayload = {
            userId: user.id,
            email: user.email,
            emailVerified: true,
            isGuest: false,
        };

        const accessToken = generateAccessToken(tokenPayload);
        const refreshToken = generateRefreshToken(tokenPayload);

        const response = NextResponse.json({
            success: true,
            message: 'Email verified successfully! Welcome to LinkMe.',
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                emailVerified: true,
                isGuest: false,
            }
        });

        // Set HTTP-only cookies
        response.cookies.set('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 15 * 60, // 15 minutes
            path: '/',
        });

        response.cookies.set('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60, // 7 days
            path: '/',
        });

        return response;

    } catch (error) {
        console.error('Verification error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to complete verification' },
            { status: 500 }
        );
    }
}
