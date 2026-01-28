// YouTube OAuth 2.0 authentication utilities
// Handles OAuth flow for YouTube playlist creation

import { google } from 'googleapis';
import { getDb } from './db';

// OAuth2 client configuration
const YOUTUBE_CLIENT_ID = process.env.YOUTUBE_CLIENT_ID;
const YOUTUBE_CLIENT_SECRET = process.env.YOUTUBE_CLIENT_SECRET;
const YOUTUBE_REDIRECT_URI = process.env.YOUTUBE_REDIRECT_URI || 'http://localhost:3000/api/youtube/callback';

// Required scopes for playlist management
const YOUTUBE_SCOPES = [
    'https://www.googleapis.com/auth/youtube',
    'https://www.googleapis.com/auth/youtube.force-ssl',
];

/**
 * Create an OAuth2 client
 */
export function createOAuth2Client() {
    if (!YOUTUBE_CLIENT_ID || !YOUTUBE_CLIENT_SECRET) {
        throw new Error('YouTube OAuth credentials not configured');
    }

    return new google.auth.OAuth2(
        YOUTUBE_CLIENT_ID,
        YOUTUBE_CLIENT_SECRET,
        YOUTUBE_REDIRECT_URI
    );
}

/**
 * Generate the OAuth authorization URL
 */
export function getAuthUrl(state?: string): string {
    const oauth2Client = createOAuth2Client();

    return oauth2Client.generateAuthUrl({
        access_type: 'offline', // Required to get refresh token
        scope: YOUTUBE_SCOPES,
        prompt: 'consent', // Force consent screen to get refresh token
        state: state || '',
    });
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeCodeForTokens(code: string): Promise<{
    accessToken: string;
    refreshToken: string;
    expiryDate: Date;
}> {
    const oauth2Client = createOAuth2Client();

    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.access_token || !tokens.refresh_token) {
        throw new Error('Failed to get tokens from Google');
    }

    return {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiryDate: new Date(tokens.expiry_date || Date.now() + 3600000),
    };
}

/**
 * Refresh an expired access token
 */
export async function refreshAccessToken(refreshToken: string): Promise<{
    accessToken: string;
    expiryDate: Date;
}> {
    const oauth2Client = createOAuth2Client();
    oauth2Client.setCredentials({ refresh_token: refreshToken });

    const { credentials } = await oauth2Client.refreshAccessToken();

    if (!credentials.access_token) {
        throw new Error('Failed to refresh access token');
    }

    return {
        accessToken: credentials.access_token,
        expiryDate: new Date(credentials.expiry_date || Date.now() + 3600000),
    };
}

/**
 * Get an authenticated OAuth2 client for a user
 * Automatically refreshes the token if expired
 */
export async function getAuthenticatedClient(userId: string): Promise<{
    client: ReturnType<typeof google.auth.OAuth2>;
    youtube: ReturnType<typeof google.youtube>;
} | null> {
    const prisma = getDb();

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            youtubeAccessToken: true,
            youtubeRefreshToken: true,
            youtubeTokenExpiry: true,
        },
    });

    if (!user?.youtubeAccessToken || !user?.youtubeRefreshToken) {
        return null; // User hasn't connected YouTube
    }

    const oauth2Client = createOAuth2Client();

    // Check if token is expired (with 5 minute buffer)
    const isExpired = user.youtubeTokenExpiry &&
        new Date(user.youtubeTokenExpiry).getTime() < Date.now() + 5 * 60 * 1000;

    if (isExpired) {
        try {
            // Refresh the token
            const { accessToken, expiryDate } = await refreshAccessToken(user.youtubeRefreshToken);

            // Update in database
            await prisma.user.update({
                where: { id: userId },
                data: {
                    youtubeAccessToken: accessToken,
                    youtubeTokenExpiry: expiryDate,
                },
            });

            oauth2Client.setCredentials({
                access_token: accessToken,
                refresh_token: user.youtubeRefreshToken,
            });
        } catch (error) {
            console.error('Failed to refresh YouTube token:', error);
            // Clear tokens if refresh fails
            await prisma.user.update({
                where: { id: userId },
                data: {
                    youtubeAccessToken: null,
                    youtubeRefreshToken: null,
                    youtubeTokenExpiry: null,
                    youtubeChannelId: null,
                    youtubeChannelName: null,
                },
            });
            return null;
        }
    } else {
        oauth2Client.setCredentials({
            access_token: user.youtubeAccessToken,
            refresh_token: user.youtubeRefreshToken,
        });
    }

    const youtube = google.youtube({
        version: 'v3',
        auth: oauth2Client,
    });

    return { client: oauth2Client, youtube };
}

/**
 * Get the user's YouTube channel info
 */
export async function getChannelInfo(youtube: ReturnType<typeof google.youtube>): Promise<{
    channelId: string;
    channelName: string;
} | null> {
    try {
        const response = await youtube.channels.list({
            part: ['snippet'],
            mine: true,
        });

        const channel = response.data.items?.[0];
        if (!channel) return null;

        return {
            channelId: channel.id || '',
            channelName: channel.snippet?.title || '',
        };
    } catch (error) {
        console.error('Failed to get channel info:', error);
        return null;
    }
}

/**
 * Disconnect YouTube from user account
 */
export async function disconnectYouTube(userId: string): Promise<void> {
    const prisma = getDb();

    await prisma.user.update({
        where: { id: userId },
        data: {
            youtubeAccessToken: null,
            youtubeRefreshToken: null,
            youtubeTokenExpiry: null,
            youtubeChannelId: null,
            youtubeChannelName: null,
        },
    });
}
