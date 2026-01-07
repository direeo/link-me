// Test endpoint to diagnose chat flow
// GET /api/test-chat

import { NextResponse } from 'next/server';
import { checkRateLimit, recordAttempt, RATE_LIMITS } from '@/lib/rate-limit';
import { searchTutorials } from '@/lib/youtube';

export const dynamic = 'force-dynamic';

export async function GET() {
    const results: Record<string, unknown> = {
        timestamp: new Date().toISOString(),
    };

    const testKey = `test:${Date.now()}`;

    try {
        // Test 1: Rate limit check
        results.step1_rateLimit = 'starting';
        const rateLimit = await checkRateLimit(testKey, RATE_LIMITS.chat);
        results.step1_rateLimit = 'success';
        results.rateLimitResult = rateLimit;

        // Test 2: Record attempt
        results.step2_recordAttempt = 'starting';
        await recordAttempt(testKey, RATE_LIMITS.chat);
        results.step2_recordAttempt = 'success';

        // Test 3: YouTube search
        results.step3_youtubeSearch = 'starting';
        const tutorials = await searchTutorials('React tutorial for beginners', 3);
        results.step3_youtubeSearch = 'success';
        results.tutorialCount = tutorials.length;
        results.firstTutorialTitle = tutorials[0]?.title;

        results.overallStatus = 'ALL TESTS PASSED';
    } catch (error) {
        results.overallStatus = 'FAILED';
        results.error = error instanceof Error ? error.message : String(error);
        results.errorStack = error instanceof Error ? error.stack?.split('\n').slice(0, 5) : undefined;
    }

    return NextResponse.json(results);
}
