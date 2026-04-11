// 2FA login verification endpoint
// POST /api/auth/2fa/login
// Called after password is correct and 2FA is required

import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { generateAccessToken, generateRefreshToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, token } = body;

        if (!email || !token) {
            return NextResponse.json(
                { success: false, message: 'Email and code are required' },
                { status: 400 }
            );
        }

        const db = getDb();
        const user = await db.user.findUnique({
            where: { email: email.toLowerCase() },
        });

        if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
            return NextResponse.json(
                { success: false, message: 'Invalid request' },
                { status: 400 }
            );
        }

        // Verify TOTP token using speakeasy
        let isValid = false;
        try {
            const speakeasy = (await import('speakeasy')).default || (await import('speakeasy'));
            isValid = speakeasy.totp.verify({
                secret: user.twoFactorSecret,
                encoding: 'base32',
                token,
                window: 1 // allow 1 window of 30sec before/after
            });
        } catch (e) {
            console.error('2FA verification failed:', e);
            isValid = false;
        }

        if (!isValid) {
            return NextResponse.json(
                { success: false, message: 'Incorrect authentication code. Please try again.' },
                { status: 401 }
            );
        }

        // 2FA passed — generate full auth tokens
        const tokenPayload = {
            userId: user.id,
            email: user.email,
            emailVerified: user.emailVerified,
            isGuest: false,
        };

        const accessToken = generateAccessToken(tokenPayload);
        const refreshToken = generateRefreshToken(tokenPayload);

        const response = NextResponse.json({
            success: true,
            message: 'Authentication successful',
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                emailVerified: user.emailVerified,
                isGuest: false,
            },
        });

        response.cookies.set('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 15 * 60,
            path: '/',
        });

        response.cookies.set('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60,
            path: '/',
        });

        return response;
    } catch (error) {
        console.error('2FA login error:', error);
        return NextResponse.json(
            { success: false, message: 'Authentication failed' },
            { status: 500 }
        );
    }
}
