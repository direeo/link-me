// Health check API to diagnose database connection
// GET /api/health

import { NextResponse } from 'next/server';
import { createClient } from '@libsql/client';

export const dynamic = 'force-dynamic';

export async function GET() {
    const results: Record<string, unknown> = {
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        databaseUrl: process.env.DATABASE_URL ?
            (process.env.DATABASE_URL.startsWith('libsql://') ? 'libsql://' + process.env.DATABASE_URL.slice(9, 30) + '...' : 'file://...') :
            'NOT SET',
        authTokenSet: !!process.env.DATABASE_AUTH_TOKEN,
        youtubeApiKeySet: !!process.env.YOUTUBE_API_KEY,
        jwtSecretSet: !!process.env.JWT_SECRET,
        adminSecretSet: !!process.env.ADMIN_SECRET,
    };

    // Test Turso connection
    if (process.env.DATABASE_URL?.startsWith('libsql://') && process.env.DATABASE_AUTH_TOKEN) {
        try {
            const client = createClient({
                url: process.env.DATABASE_URL,
                authToken: process.env.DATABASE_AUTH_TOKEN,
            });

            // Try a simple query
            const result = await client.execute('SELECT 1 as test');
            results.tursoConnection = 'SUCCESS';
            results.tursoTestResult = result.rows[0];

            // Check if tables exist
            const tables = await client.execute("SELECT name FROM sqlite_master WHERE type='table'");
            results.tables = tables.rows.map(r => r.name);

        } catch (error) {
            results.tursoConnection = 'FAILED';
            results.tursoError = error instanceof Error ? error.message : String(error);
        }
    } else {
        results.tursoConnection = 'NOT_CONFIGURED';
    }

    return NextResponse.json(results);
}
