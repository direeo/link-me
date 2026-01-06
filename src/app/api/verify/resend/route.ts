// Resend verification email API endpoint
// POST /api/verify/resend

import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { resendVerificationSchema, validateInput } from '@/lib/validation';
import { generateVerificationToken } from '@/lib/auth';
import { sendVerificationEmail } from '@/lib/email';
import { checkRateLimit, recordAttempt, RATE_LIMITS, getClientIP } from '@/lib/rate-limit';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    const prisma = getDb();

    try {
        // Rate limiting check
        const clientIP = getClientIP(request.headers);
        const rateLimitKey = `resend:${clientIP}`;
        const rateLimit = await checkRateLimit(rateLimitKey, RATE_LIMITS.resendVerification);

        if (!rateLimit.allowed) {
            return NextResponse.json(
                {
                    success: false,
                    message: `Too many requests. Please try again in ${Math.ceil((rateLimit.retryAfter || 3600) / 60)} minutes.`,
                },
                { status: 429 }
            );
        }

        // Parse and validate request body
        const body = await request.json();
        const validation = validateInput(resendVerificationSchema, body);

        if (!validation.success) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Validation failed',
                    errors: validation.errors,
                },
                { status: 400 }
            );
        }

        const { email } = validation.data;
        const normalizedEmail = email.toLowerCase();

        // Find user
        const user = await prisma.user.findUnique({
            where: { email: normalizedEmail },
        });

        // Always return success to prevent email enumeration
        if (!user) {
            await recordAttempt(rateLimitKey, RATE_LIMITS.resendVerification);
            return NextResponse.json({
                success: true,
                message: 'If an account exists with that email, a verification link has been sent.',
            });
        }

        // Check if already verified
        if (user.emailVerified) {
            return NextResponse.json({
                success: true,
                message: 'Your email is already verified.',
            });
        }

        // Delete any existing verification tokens for this user
        await prisma.verificationToken.deleteMany({
            where: { userId: user.id },
        });

        // Generate new verification token
        const { token, expiresAt } = generateVerificationToken();

        await prisma.verificationToken.create({
            data: {
                token,
                userId: user.id,
                expiresAt,
            },
        });

        // Send verification email
        const emailResult = await sendVerificationEmail(user.email, token, user.name || undefined);

        if (!emailResult.success) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Failed to send verification email. Please try again later.',
                },
                { status: 500 }
            );
        }

        await recordAttempt(rateLimitKey, RATE_LIMITS.resendVerification);

        return NextResponse.json({
            success: true,
            message: 'Verification email sent. Please check your inbox.',
        });
    } catch (error) {
        console.error('Resend verification error:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'An error occurred',
            },
            { status: 500 }
        );
    }
}
