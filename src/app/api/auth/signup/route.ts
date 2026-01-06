// Signup API endpoint
// POST /api/auth/signup

import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { hashPassword, generateAccessToken, generateRefreshToken, generateVerificationToken } from '@/lib/auth';
import { signupSchema, validateInput } from '@/lib/validation';
import { sendVerificationEmail } from '@/lib/email';
import { checkRateLimit, recordAttempt, RATE_LIMITS, getClientIP } from '@/lib/rate-limit';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    const prisma = getDb();

    try {
        // Rate limiting check
        const clientIP = getClientIP(request.headers);
        const rateLimitKey = `signup:${clientIP}`;
        const rateLimit = await checkRateLimit(rateLimitKey, RATE_LIMITS.signup);

        if (!rateLimit.allowed) {
            return NextResponse.json(
                {
                    success: false,
                    message: `Too many signup attempts. Please try again in ${Math.ceil((rateLimit.retryAfter || 3600) / 60)} minutes.`,
                },
                { status: 429 }
            );
        }

        // Parse and validate request body
        const body = await request.json();
        const validation = validateInput(signupSchema, body);

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

        const { email, password, name } = validation.data;

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });

        if (existingUser) {
            await recordAttempt(rateLimitKey, RATE_LIMITS.signup);
            return NextResponse.json(
                {
                    success: false,
                    message: 'An account with this email already exists',
                },
                { status: 409 }
            );
        }

        // Hash password
        const passwordHash = await hashPassword(password);

        // Create user
        const user = await prisma.user.create({
            data: {
                email: email.toLowerCase(),
                passwordHash,
                name: name || null,
                emailVerified: false,
            },
        });

        // Generate verification token
        const { token: verificationToken, expiresAt } = generateVerificationToken();

        await prisma.verificationToken.create({
            data: {
                token: verificationToken,
                userId: user.id,
                expiresAt,
            },
        });

        // Send verification email
        await sendVerificationEmail(user.email, verificationToken, user.name || undefined);

        // Generate auth tokens
        const tokenPayload = {
            userId: user.id,
            email: user.email,
            emailVerified: false,
            isGuest: false,
        };

        const accessToken = generateAccessToken(tokenPayload);
        const refreshToken = generateRefreshToken(tokenPayload);

        // Create response with cookies
        const response = NextResponse.json({
            success: true,
            message: 'Account created successfully. Please check your email to verify your account.',
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                emailVerified: false,
                isGuest: false,
            },
        });

        // Set HTTP-only cookies for tokens
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
        console.error('Signup error:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'An error occurred during signup',
            },
            { status: 500 }
        );
    }
}
