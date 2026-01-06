// Rate limiting utility for brute force protection
// Uses database store for persistence

import { getDb } from './db';

interface RateLimitConfig {
    maxAttempts: number;
    windowMs: number;       // Time window in milliseconds
    blockDurationMs: number; // How long to block after max attempts
}

// ============================================
// Rate Limiter Functions
// ============================================

/**
 * Check if a key (IP or email) is rate limited
 */
export async function checkRateLimit(
    key: string,
    config: RateLimitConfig
): Promise<{ allowed: boolean; remainingAttempts: number; retryAfter?: number }> {
    const prisma = getDb();
    const now = new Date();

    // Find existing rate limit entry
    const entry = await prisma.rateLimitEntry.findUnique({
        where: { key },
    });

    if (!entry) {
        return { allowed: true, remainingAttempts: config.maxAttempts - 1 };
    }

    // Check if blocked
    if (entry.blockedUntil && entry.blockedUntil > now) {
        const retryAfter = Math.ceil((entry.blockedUntil.getTime() - now.getTime()) / 1000);
        return { allowed: false, remainingAttempts: 0, retryAfter };
    }

    // Check if window has expired (using windowStart field from schema)
    const windowExpiry = new Date(now.getTime() - config.windowMs);
    if (entry.windowStart < windowExpiry) {
        // Reset the counter
        await prisma.rateLimitEntry.update({
            where: { key },
            data: { count: 0, windowStart: now, blockedUntil: null },
        });
        return { allowed: true, remainingAttempts: config.maxAttempts - 1 };
    }

    // Check if max attempts reached (using count field from schema)
    if (entry.count >= config.maxAttempts) {
        return { allowed: false, remainingAttempts: 0 };
    }

    return { allowed: true, remainingAttempts: config.maxAttempts - entry.count - 1 };
}

/**
 * Record a rate limit attempt (call on failed attempts)
 */
export async function recordAttempt(
    key: string,
    config: RateLimitConfig
): Promise<void> {
    const prisma = getDb();
    const now = new Date();

    const entry = await prisma.rateLimitEntry.findUnique({
        where: { key },
    });

    if (!entry) {
        // Create new entry
        await prisma.rateLimitEntry.create({
            data: {
                key,
                count: 1,
                windowStart: now,
            },
        });
        return;
    }

    // Check if window has expired
    const windowExpiry = new Date(now.getTime() - config.windowMs);
    if (entry.windowStart < windowExpiry) {
        // Reset and start new window
        await prisma.rateLimitEntry.update({
            where: { key },
            data: { count: 1, windowStart: now, blockedUntil: null },
        });
        return;
    }

    // Increment count
    const newCount = entry.count + 1;
    const blockedUntil = newCount >= config.maxAttempts
        ? new Date(now.getTime() + config.blockDurationMs)
        : null;

    await prisma.rateLimitEntry.update({
        where: { key },
        data: {
            count: newCount,
            windowStart: now,
            blockedUntil,
        },
    });
}

/**
 * Reset rate limit for a key (call on successful attempts)
 */
export async function resetRateLimit(key: string): Promise<void> {
    const prisma = getDb();
    await prisma.rateLimitEntry.deleteMany({
        where: { key },
    });
}

/**
 * Get client IP from request headers
 */
export function getClientIP(headers: Headers): string {
    const forwarded = headers.get('x-forwarded-for');
    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }

    const realIp = headers.get('x-real-ip');
    if (realIp) {
        return realIp;
    }

    return 'unknown';
}

// ============================================
// Rate Limit Configurations for Different Endpoints
// ============================================

export const RATE_LIMITS = {
    login: {
        maxAttempts: 5,
        windowMs: 15 * 60 * 1000, // 15 minutes
        blockDurationMs: 30 * 60 * 1000, // 30 minutes
    },
    signup: {
        maxAttempts: 3,
        windowMs: 60 * 60 * 1000, // 1 hour
        blockDurationMs: 60 * 60 * 1000, // 1 hour
    },
    resendVerification: {
        maxAttempts: 3,
        windowMs: 60 * 60 * 1000, // 1 hour
        blockDurationMs: 60 * 60 * 1000, // 1 hour
    },
    chat: {
        maxAttempts: 30,
        windowMs: 60 * 1000, // 1 minute
        blockDurationMs: 5 * 60 * 1000, // 5 minutes
    },
};
