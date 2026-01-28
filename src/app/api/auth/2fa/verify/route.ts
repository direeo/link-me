// 2FA Verify API endpoint
// POST - Verify TOTP code during login

import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { generateAccessToken, generateRefreshToken } from '@/lib/auth';
import { verifyTOTP, decryptSecret, verifyBackupCode } from '@/lib/two-factor';
import { checkRateLimit, recordAttempt, RATE_LIMITS, getClientIP } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        // Rate limiting - stricter for 2FA verification
        const clientIP = getClientIP(request.headers);
        const rateLimitKey = `2fa-verify:${clientIP}`;
        const rateLimit = await checkRateLimit(rateLimitKey, {
            ...RATE_LIMITS.login,
            maxAttempts: 5, // Even stricter for 2FA
        });

        if (!rateLimit.allowed) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Too many attempts. Please try again later.',
                },
                { status: 429 }
            );
        }

        const body = await request.json();
        const { email, code, isBackupCode } = body;

        if (!email || !code) {
            return NextResponse.json(
                { success: false, message: 'Email and code are required' },
                { status: 400 }
            );
        }

        const prisma = getDb();
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
            select: {
                id: true,
                email: true,
                name: true,
                emailVerified: true,
                twoFactorEnabled: true,
                twoFactorSecret: true,
                twoFactorBackupCodes: true,
            },
        });

        if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
            await recordAttempt(rateLimitKey, RATE_LIMITS.login);
            return NextResponse.json(
                { success: false, message: 'Invalid verification attempt' },
                { status: 400 }
            );
        }

        let isValid = false;

        if (isBackupCode) {
            // Verify backup code
            const hashedCodes: string[] = JSON.parse(user.twoFactorBackupCodes || '[]');
            const matchIndex = await verifyBackupCode(code, hashedCodes);

            if (matchIndex >= 0) {
                isValid = true;
                // Remove the used backup code
                hashedCodes.splice(matchIndex, 1);
                await prisma.user.update({
                    where: { id: user.id },
                    data: {
                        twoFactorBackupCodes: JSON.stringify(hashedCodes),
                    },
                });
            }
        } else {
            // Verify TOTP code
            const secret = decryptSecret(user.twoFactorSecret);
            isValid = verifyTOTP(code.replace(/\s/g, ''), secret);
        }

        if (!isValid) {
            await recordAttempt(rateLimitKey, RATE_LIMITS.login);
            return NextResponse.json(
                { success: false, message: 'Invalid verification code' },
                { status: 400 }
            );
        }

        // Generate tokens and complete login
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
            message: 'Login successful!',
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                emailVerified: user.emailVerified,
                isGuest: false,
            },
        });

        // Set auth cookies
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
        console.error('2FA verification error:', error);
        return NextResponse.json(
            { success: false, message: 'Verification failed' },
            { status: 500 }
        );
    }
}
