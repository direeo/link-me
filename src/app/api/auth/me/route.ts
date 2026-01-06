// Get current user API endpoint
// GET /api/auth/me

import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { verifyAccessToken, verifyRefreshToken, generateAccessToken } from '@/lib/auth';

// Force dynamic rendering to avoid static build issues
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const prisma = getDb();
    try {
        // Get tokens from cookies
        const accessToken = request.cookies.get('accessToken')?.value;
        const refreshToken = request.cookies.get('refreshToken')?.value;

        // Try to verify access token first
        if (accessToken) {
            const decoded = verifyAccessToken(accessToken);

            if (decoded) {
                // Check if guest user
                if (decoded.isGuest) {
                    return NextResponse.json({
                        success: true,
                        user: {
                            id: decoded.userId,
                            email: '',
                            name: 'Guest',
                            emailVerified: false,
                            isGuest: true,
                        },
                    });
                }

                // Get fresh user data from database
                const user = await prisma.user.findUnique({
                    where: { id: decoded.userId },
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        emailVerified: true,
                    },
                });

                if (user) {
                    return NextResponse.json({
                        success: true,
                        user: {
                            ...user,
                            isGuest: false,
                        },
                    });
                }
            }
        }

        // Try to refresh using refresh token
        if (refreshToken) {
            const decoded = verifyRefreshToken(refreshToken);

            if (decoded && !decoded.isGuest) {
                // Get user from database
                const user = await prisma.user.findUnique({
                    where: { id: decoded.userId },
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        emailVerified: true,
                    },
                });

                if (user) {
                    // Generate new access token
                    const newAccessToken = generateAccessToken({
                        userId: user.id,
                        email: user.email,
                        emailVerified: user.emailVerified,
                        isGuest: false,
                    });

                    const response = NextResponse.json({
                        success: true,
                        user: {
                            ...user,
                            isGuest: false,
                        },
                    });

                    // Set new access token cookie
                    response.cookies.set('accessToken', newAccessToken, {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === 'production',
                        sameSite: 'lax',
                        maxAge: 15 * 60, // 15 minutes
                        path: '/',
                    });

                    return response;
                }
            }
        }

        // No valid authentication
        return NextResponse.json({
            success: false,
            message: 'Not authenticated',
        }, { status: 401 });
    } catch (error) {
        console.error('Auth check error:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'An error occurred',
            },
            { status: 500 }
        );
    }
}
