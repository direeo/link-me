// 2FA Setup API endpoint
// GET - Generate new TOTP secret and QR code
// POST - Verify TOTP code and enable 2FA

import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { verifyAccessToken } from '@/lib/auth';
import { checkRateLimit, recordAttempt, resetRateLimit, RATE_LIMITS, getClientIP } from '@/lib/rate-limit';
import {
    generateTOTPSecret,
    generateQRCode,
    verifyTOTP,
    generateBackupCodes,
    encryptSecret,
} from '@/lib/two-factor';

export const dynamic = 'force-dynamic';

// GET - Generate new TOTP secret and QR code for setup
export async function GET(request: NextRequest) {
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

        const prisma = getDb();
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { email: true, twoFactorEnabled: true },
        });

        if (!user) {
            return NextResponse.json(
                { success: false, message: 'User not found' },
                { status: 404 }
            );
        }

        if (user.twoFactorEnabled) {
            return NextResponse.json(
                { success: false, message: '2FA is already enabled' },
                { status: 400 }
            );
        }

        // Generate new secret
        const secret = generateTOTPSecret();
        const qrCodeDataUrl = await generateQRCode(user.email, secret);

        // Store the secret temporarily (encrypted) - user must verify before it's active
        // We'll store it in twoFactorSecret but keep twoFactorEnabled = false
        await prisma.user.update({
            where: { id: decoded.userId },
            data: {
                twoFactorSecret: encryptSecret(secret),
                twoFactorEnabled: false, // Not enabled until verified
            },
        });

        return NextResponse.json({
            success: true,
            qrCode: qrCodeDataUrl,
            // Return plain secret for manual entry in authenticator app
            // (only shown once during setup — stored encrypted server-side)
            secret: secret,
        });
    } catch (error) {
        console.error('2FA setup error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to generate 2FA setup' },
            { status: 500 }
        );
    }
}

// POST - Verify TOTP code and enable 2FA
// Verifies the TOTP code entered by user and enables 2FA if valid
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

        // Rate limit 2FA attempts per user
        const rateLimitKey = `2fa-setup:${decoded.userId}`;
        const rateLimit = await checkRateLimit(rateLimitKey, RATE_LIMITS.twoFactor);
        if (!rateLimit.allowed) {
            const waitMins = Math.ceil((rateLimit.retryAfter || 900) / 60);
            return NextResponse.json(
                { success: false, message: `Too many attempts. Try again in ${waitMins} minute${waitMins !== 1 ? 's' : ''}.` },
                { status: 429 }
            );
        }

        let body;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { success: false, message: 'Invalid request body' },
                { status: 400 }
            );
        }

        const { code } = body;

        if (!code || typeof code !== 'string') {
            console.log('[2FA POST] Missing or invalid code:', code);
            return NextResponse.json(
                { success: false, message: 'Verification code is required' },
                { status: 400 }
            );
        }

        const prisma = getDb();
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                twoFactorEnabled: true,
                twoFactorSecret: true,
            },
        });

        if (!user) {
            return NextResponse.json(
                { success: false, message: 'User not found' },
                { status: 404 }
            );
        }

        if (user.twoFactorEnabled) {
            return NextResponse.json(
                { success: false, message: '2FA is already enabled' },
                { status: 400 }
            );
        }

        if (!user.twoFactorSecret) {
            return NextResponse.json(
                { success: false, message: 'Please start 2FA setup first' },
                { status: 400 }
            );
        }

        // Import decrypt function
        const { decryptSecret } = await import('@/lib/two-factor');
        const secret = decryptSecret(user.twoFactorSecret);

        // Verify the code
        const isValid = verifyTOTP(code.replace(/\s/g, ''), secret);

        if (!isValid) {
            await recordAttempt(rateLimitKey, RATE_LIMITS.twoFactor);
            return NextResponse.json(
                { success: false, message: 'Invalid verification code. Please try again.' },
                { status: 400 }
            );
        }

        await resetRateLimit(rateLimitKey);

        // Generate backup codes
        const { plainCodes, hashedCodes } = await generateBackupCodes(10);

        // Enable 2FA and save backup codes
        await prisma.user.update({
            where: { id: decoded.userId },
            data: {
                twoFactorEnabled: true,
                twoFactorBackupCodes: JSON.stringify(hashedCodes),
            },
        });

        return NextResponse.json({
            success: true,
            message: '2FA has been enabled successfully!',
            backupCodes: plainCodes, // Only shown once!
        });
    } catch (error) {
        console.error('2FA verification error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to enable 2FA' },
            { status: 500 }
        );
    }
}
