// Logout API endpoint
// POST /api/auth/logout

import { NextResponse } from 'next/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function POST() {
    try {
        const response = NextResponse.json({
            success: true,
            message: 'Logged out successfully',
        });

        // Clear auth cookies
        response.cookies.set('accessToken', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 0,
            path: '/',
        });

        response.cookies.set('refreshToken', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 0,
            path: '/',
        });

        return response;
    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'An error occurred during logout',
            },
            { status: 500 }
        );
    }
}
