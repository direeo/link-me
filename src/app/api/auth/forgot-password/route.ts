// Forgot Password API endpoint
// POST /api/auth/forgot-password
// Sends a password-reset link to the given email address.
// Always returns 200 so attackers can't enumerate accounts.

import { NextRequest, NextResponse } from 'next/server';
import { randomBytes, createHash } from 'crypto';
import { getDb } from '@/lib/db';
import { forgotPasswordSchema, validateInput } from '@/lib/validation';
import { sendPasswordResetEmail } from '@/lib/email';
import { checkRateLimit, recordAttempt, RATE_LIMITS, getClientIP } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Ensure reset-token columns exist in Turso (safe no-op if already present)
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
        const validation = validateInput(forgotPasswordSchema, body);
        if (!validation.success) {
            // Still return 200 — same response regardless of validity
            return NextResponse.json({ success: true, message: 'If that email is registered, check your inbox.' });
        }

        const { email } = validation.data;
        const normalizedEmail = email.toLowerCase();

        // Rate limit by IP + email
        const clientIP = getClientIP(request.headers);
        const rateLimitKey = `forgot-password:${clientIP}:${normalizedEmail}`;
        const rateLimit = await checkRateLimit(rateLimitKey, RATE_LIMITS.forgotPassword);
        if (!rateLimit.allowed) {
            // Return 200 here too — don't reveal rate-limit to potential attacker
            return NextResponse.json({ success: true, message: 'If that email is registered, check your inbox.' });
        }
        await recordAttempt(rateLimitKey, RATE_LIMITS.forgotPassword);

        const db = getDb();
        const user = await db.user.findUnique({ where: { email: normalizedEmail } });

        // No user → return same success message (don't reveal account existence)
        if (!user) {
            return NextResponse.json({ success: true, message: 'If that email is registered, check your inbox.' });
        }

        // Generate secure token
        const plainToken = randomBytes(32).toString('hex');
        const hashedToken = createHash('sha256').update(plainToken).digest('hex');
        const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        // Store hashed token + expiry
        await db.user.update({
            where: { id: user.id },
            data: {
                resetPasswordToken: hashedToken,
                resetPasswordExpiry: expiry,
            },
        });

        // Build reset URL and send email
        const resetUrl = `${APP_URL}/reset-password?token=${plainToken}&email=${encodeURIComponent(normalizedEmail)}`;
        await sendPasswordResetEmail(user.email, user.name, resetUrl);

        return NextResponse.json({ success: true, message: 'If that email is registered, check your inbox.' });
    } catch (error) {
        console.error('forgot-password error:', error);
        // Return same message even on error — don't leak info
        return NextResponse.json({ success: true, message: 'If that email is registered, check your inbox.' });
    }
}
