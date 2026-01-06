// Guest login API endpoint
// POST /api/auth/guest

import { NextResponse } from 'next/server';
import { generateGuestToken } from '@/lib/auth';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function POST() {
    try {
        // Generate guest token
        const guestToken = generateGuestToken();

        // Create response
        const response = NextResponse.json({
            success: true,
            message: 'Guest session created',
            user: {
                id: 'guest',
                email: '',
                name: 'Guest',
                emailVerified: false,
                isGuest: true,
            },
        });

        // Set guest access token cookie (24 hour expiry)
        response.cookies.set('accessToken', guestToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 24 * 60 * 60, // 24 hours
            path: '/',
        });

        // Clear any existing refresh token
        response.cookies.set('refreshToken', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 0,
            path: '/',
        });

        return response;
    } catch (error) {
        console.error('Guest login error:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'An error occurred',
            },
            { status: 500 }
        );
    }
}
