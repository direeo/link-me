// Test endpoint to diagnose signup database operations
// GET /api/test-db

import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
    const results: Record<string, unknown> = {
        timestamp: new Date().toISOString(),
    };

    const db = getDb();
    const testEmail = `test-${Date.now()}@example.com`;

    try {
        // Test 1: Create user
        results.step1_createUser = 'starting';
        const user = await db.user.create({
            data: {
                email: testEmail,
                passwordHash: 'test-hash-12345',
                name: 'Test User',
                emailVerified: false,
            },
        });
        results.step1_createUser = 'success';
        results.createdUserId = user.id;

        // Test 2: Find user
        results.step2_findUser = 'starting';
        const foundUser = await db.user.findUnique({
            where: { email: testEmail },
        });
        results.step2_findUser = foundUser ? 'success' : 'failed';

        // Test 3: Create verification token
        results.step3_createToken = 'starting';
        const token = await db.verificationToken.create({
            data: {
                token: 'test-token-12345',
                userId: user.id,
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
            },
        });
        results.step3_createToken = 'success';
        results.createdTokenId = token.id;

        // Test 4: Check rate limit
        results.step4_rateLimit = 'starting';
        const rateEntry = await db.rateLimitEntry.create({
            data: {
                key: `test:${testEmail}`,
                count: 1,
                windowStart: new Date(),
            },
        });
        results.step4_rateLimit = 'success';
        results.createdRateLimitId = rateEntry.id;

        // Cleanup - delete test data
        await db.rateLimitEntry.deleteMany({ where: { key: `test:${testEmail}` } });
        await db.verificationToken.deleteMany({ where: { userId: user.id } });
        // Note: Can't easily delete user with this wrapper, but that's ok for testing

        results.overallStatus = 'ALL TESTS PASSED';
    } catch (error) {
        results.overallStatus = 'FAILED';
        results.error = error instanceof Error ? error.message : String(error);
        results.errorStack = error instanceof Error ? error.stack : undefined;
    }

    return NextResponse.json(results);
}
