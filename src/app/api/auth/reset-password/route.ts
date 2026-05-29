// Reset Password API endpoint
// POST /api/auth/reset-password
// Verifies the reset token and updates the password.

import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { getDb } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { resetPasswordSchema, validateInput } from '@/lib/validation';
import { checkRateLimit, recordAttempt, resetRateLimit, RATE_LIMITS, getClientIP } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

async function ensureResetColumns() {
    try {
        const { createClient } = await import('@libsql/client');
        const url = process.env.DATABASE_URL?.trim();
        const authToken = process.env.DATABASE_AUTH_TOKEN?.trim();
        if (url && (url.startsWith('libsql://') || authToken)) {
            const client = createClient({ url, authToken });
            await client.execute('ALTER TABLE User ADD COLUMN resetPasswordToken TEXT').catch(() => {});
            await client.execute('ALTER TABLE User ADD COLUMN resetPasswordExpiry TEXT').catch(() => {});
        }
    } catch { /* local dev */ }
}

export async function POST(request: NextRequest) {
    await ensureResetColumns();

    try {
        const body = await request.json();
        const validation = validateInput(resetPasswordSchema, body);
        if (!validation.success) {
            return NextResponse.json(
                { success: false, message: Array.isArray(validation.errors) ? validation.errors[0] : 'Invalid request' },
                { status: 400 }
            );
        }

        const { email, token, password } = validation.data;
        const normalizedEmail = email.toLowerCase();

        // Rate limit by IP + email
        const clientIP = getClientIP(request.headers);
        const rateLimitKey = `reset-password:${clientIP}:${normalizedEmail}`;
        const rateLimit = await checkRateLimit(rateLimitKey, RATE_LIMITS.resetPassword);
        if (!rateLimit.allowed) {
            const waitMins = Math.ceil((rateLimit.retryAfter || 3600) / 60);
            return NextResponse.json(
                { success: false, message: `Too many attempts. Try again in ${waitMins} minute${waitMins !== 1 ? 's' : ''}.` },
                { status: 429 }
            );
        }
        await recordAttempt(rateLimitKey, RATE_LIMITS.resetPassword);

        const db = getDb();
        const user = await db.user.findUnique({ where: { email: normalizedEmail } });

        if (!user || !user.resetPasswordToken || !user.resetPasswordExpiry) {
            return NextResponse.json(
                { success: false, message: 'This reset link is invalid or has expired. Please request a new one.' },
                { status: 400 }
            );
        }

        // Check expiry
        if (new Date() > user.resetPasswordExpiry) {
            // Clear expired token
            await db.user.update({
                where: { id: user.id },
                data: { resetPasswordToken: null, resetPasswordExpiry: null },
            });
            return NextResponse.json(
                { success: false, message: 'This reset link has expired. Please request a new one.' },
                { status: 400 }
            );
        }

        // Hash received token and compare
        const hashedToken = createHash('sha256').update(token).digest('hex');
        if (hashedToken !== user.resetPasswordToken) {
            return NextResponse.json(
                { success: false, message: 'This reset link is invalid. Please request a new one.' },
                { status: 400 }
            );
        }

        // All good — update password and clear token
        const passwordHash = await hashPassword(password);
        await db.user.update({
            where: { id: user.id },
            data: {
                passwordHash,
                resetPasswordToken: null,
                resetPasswordExpiry: null,
            },
        });

        await resetRateLimit(rateLimitKey);

        return NextResponse.json({ success: true, message: 'Password updated successfully.' });
    } catch (error) {
        console.error('reset-password error:', error);
        return NextResponse.json(
            { success: false, message: 'An error occurred. Please try again.' },
            { status: 500 }
        );
    }
}
