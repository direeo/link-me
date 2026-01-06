// Email verification API endpoint
// POST /api/verify/email

import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { verifyEmailSchema, validateInput } from '@/lib/validation';
import { isTokenExpired, generateAccessToken, generateRefreshToken } from '@/lib/auth';
import { sendWelcomeEmail } from '@/lib/email';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    const prisma = getDb();

    try {
        // Parse and validate request body
        const body = await request.json();
        const validation = validateInput(verifyEmailSchema, body);

        if (!validation.success) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Invalid verification token',
                    errors: validation.errors,
                },
                { status: 400 }
            );
        }

        const { token } = validation.data;

        // Find verification token
        const verificationToken = await prisma.verificationToken.findUnique({
            where: { token },
            include: { user: true },
        });

        if (!verificationToken) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Invalid or expired verification token',
                },
                { status: 400 }
            );
        }

        // Check if token is expired
        if (isTokenExpired(verificationToken.expiresAt)) {
            // Delete expired token
            await prisma.verificationToken.delete({
                where: { id: verificationToken.id },
            });

            return NextResponse.json(
                {
                    success: false,
                    message: 'Verification token has expired. Please request a new one.',
                },
                { status: 400 }
            );
        }

        // Check if user is already verified
        if (verificationToken.user.emailVerified) {
            // Delete used token
            await prisma.verificationToken.delete({
                where: { id: verificationToken.id },
            });

            return NextResponse.json({
                success: true,
                message: 'Email already verified',
            });
        }

        // Update user as verified
        const user = await prisma.user.update({
            where: { id: verificationToken.userId },
            data: { emailVerified: true },
        });

        // Delete all verification tokens for this user
        await prisma.verificationToken.deleteMany({
            where: { userId: user.id },
        });

        // Send welcome email
        await sendWelcomeEmail(user.email, user.name || undefined);

        // Generate new auth tokens with updated emailVerified status
        const tokenPayload = {
            userId: user.id,
            email: user.email,
            emailVerified: true,
            isGuest: false,
        };

        const accessToken = generateAccessToken(tokenPayload);
        const refreshToken = generateRefreshToken(tokenPayload);

        // Create response with updated cookies
        const response = NextResponse.json({
            success: true,
            message: 'Email verified successfully',
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                emailVerified: true,
                isGuest: false,
            },
        });

        // Set updated auth cookies
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
        console.error('Email verification error:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'An error occurred during verification',
            },
            { status: 500 }
        );
    }
}
