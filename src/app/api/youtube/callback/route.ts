// YouTube OAuth callback endpoint
// GET - Handles redirect from YouTube OAuth, stores tokens

import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { exchangeCodeForTokens, createOAuth2Client, getChannelInfo } from '@/lib/youtube-auth';
import { google } from 'googleapis';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const prisma = getDb();

    try {
        const searchParams = request.nextUrl.searchParams;
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');

        // Handle OAuth errors
        if (error) {
            console.error('YouTube OAuth error:', error);
            return NextResponse.redirect(
                new URL('/settings?youtube_error=access_denied', request.url)
            );
        }

        if (!code || !state) {
            return NextResponse.redirect(
                new URL('/settings?youtube_error=missing_params', request.url)
            );
        }

        // Decode state to get user ID
        let userId: string;
        try {
            const stateData = JSON.parse(Buffer.from(state, 'base64').toString());
            userId = stateData.userId;
        } catch {
            return NextResponse.redirect(
                new URL('/settings?youtube_error=invalid_state', request.url)
            );
        }

        // Verify user exists
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            return NextResponse.redirect(
                new URL('/settings?youtube_error=user_not_found', request.url)
            );
        }

        // Exchange code for tokens
        const { accessToken, refreshToken, expiryDate } = await exchangeCodeForTokens(code);

        // Get channel info
        const oauth2Client = createOAuth2Client();
        oauth2Client.setCredentials({
            access_token: accessToken,
            refresh_token: refreshToken,
        });

        const youtube = google.youtube({
            version: 'v3',
            auth: oauth2Client,
        });

        const channelInfo = await getChannelInfo(youtube);

        // Store tokens in database
        await prisma.user.update({
            where: { id: userId },
            data: {
                youtubeAccessToken: accessToken,
                youtubeRefreshToken: refreshToken,
                youtubeTokenExpiry: expiryDate,
                youtubeChannelId: channelInfo?.channelId || null,
                youtubeChannelName: channelInfo?.channelName || null,
            },
        });

        // Redirect to settings with success
        return NextResponse.redirect(
            new URL('/settings?youtube_connected=true', request.url)
        );
    } catch (error) {
        console.error('YouTube callback error:', error);
        return NextResponse.redirect(
            new URL('/settings?youtube_error=token_exchange_failed', request.url)
        );
    }
}
