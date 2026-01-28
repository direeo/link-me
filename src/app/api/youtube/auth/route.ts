// YouTube OAuth initiation endpoint
// GET - Redirects to YouTube OAuth consent screen

import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';
import { getAuthUrl } from '@/lib/youtube-auth';

export const dynamic = 'force-dynamic';

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

        // Generate OAuth URL with user ID in state for callback
        const state = Buffer.from(JSON.stringify({ userId: decoded.userId })).toString('base64');
        const authUrl = getAuthUrl(state);

        // Redirect to YouTube OAuth
        return NextResponse.redirect(authUrl);
    } catch (error) {
        console.error('YouTube auth error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to initiate YouTube authentication' },
            { status: 500 }
        );
    }
}
