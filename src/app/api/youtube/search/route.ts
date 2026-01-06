// Direct YouTube search API endpoint
// POST /api/youtube/search

import { NextRequest, NextResponse } from 'next/server';
import { youtubeSearchSchema, validateInput, sanitizeInput } from '@/lib/validation';
import { searchTutorials } from '@/lib/youtube';
import { verifyAccessToken } from '@/lib/auth';
import { checkRateLimit, recordAttempt, RATE_LIMITS, getClientIP } from '@/lib/rate-limit';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        // Rate limiting
        const clientIP = getClientIP(request.headers);
        const rateLimitKey = `youtube:${clientIP}`;
        const rateLimit = await checkRateLimit(rateLimitKey, RATE_LIMITS.chat);

        if (!rateLimit.allowed) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Too many requests. Please slow down.',
                },
                { status: 429 }
            );
        }

        // Check authentication (allow guests but log differently)
        const accessToken = request.cookies.get('accessToken')?.value;
        if (accessToken) {
            const decoded = verifyAccessToken(accessToken);
            // Could log or track usage differently for authenticated users
            if (decoded) {
                // User is authenticated
            }
        }

        // Parse and validate request body
        const body = await request.json();
        const validation = validateInput(youtubeSearchSchema, body);

        if (!validation.success) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Invalid search query',
                    errors: validation.errors,
                },
                { status: 400 }
            );
        }

        const { query, maxResults } = validation.data;
        const sanitizedQuery = sanitizeInput(query);

        // Record rate limit attempt
        await recordAttempt(rateLimitKey, RATE_LIMITS.chat);

        // Search YouTube
        try {
            const tutorials = await searchTutorials(sanitizedQuery, maxResults);

            return NextResponse.json({
                success: true,
                results: tutorials,
                query: sanitizedQuery,
                count: tutorials.length,
            });
        } catch (error) {
            console.error('YouTube search error:', error);

            if (error instanceof Error && error.message.includes('API key')) {
                return NextResponse.json(
                    {
                        success: false,
                        message: 'YouTube API configuration error',
                    },
                    { status: 503 }
                );
            }

            return NextResponse.json(
                {
                    success: false,
                    message: 'Failed to search YouTube. Please try again.',
                },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('YouTube search endpoint error:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'An error occurred',
            },
            { status: 500 }
        );
    }
}
