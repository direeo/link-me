// Rate limiting utility for brute force protection
// Uses database store for persistence

import { getDb } from './db';

interface RateLimitConfig {
    maxAttempts: number;
    windowMs: number;       // Time window in milliseconds
    blockDurationMs: number; // How long to block after max attempts
}

const DEFAULT_CONFIG: RateLimitConfig = {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    blockDurationMs: 30 * 60 * 1000, // 30 minutes block
};

// ============================================
// Rate Limiter Functions
// ============================================

/**
 * Check if a key (IP or email) is rate limited
 * @param key - Unique identifier (e.g., IP address or email)
 * @param config - Rate limit configuration
 * @returns Object with allowed status and remaining attempts
 */
export async function checkRateLimit(
    key: string,
    config: RateLimitConfig = DEFAULT_CONFIG
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

    // Check if window has expired
    const windowStart = new Date(now.getTime() - config.windowMs);
    if (entry.lastAttempt < windowStart) {
        // Reset the counter
        await prisma.rateLimitEntry.update({
            where: { key },
            data: { attempts: 0, blockedUntil: null },
        });
        return { allowed: true, remainingAttempts: config.maxAttempts - 1 };
    }

    // Check if max attempts reached
    if (entry.attempts >= config.maxAttempts) {
        return { allowed: false, remainingAttempts: 0 };
    }

    return { allowed: true, remainingAttempts: config.maxAttempts - entry.attempts - 1 };
}

/**
 * Record a rate limit attempt (call on failed attempts)
 * @param key - Unique identifier
 * @param config - Rate limit configuration
 */
export async function recordAttempt(
    key: string,
    config: RateLimitConfig = DEFAULT_CONFIG
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
                attempts: 1,
                lastAttempt: now,
            },
        });
        return;
    }

    // Check if window has expired
    const windowStart = new Date(now.getTime() - config.windowMs);
    if (entry.lastAttempt < windowStart) {
        // Reset and start new window
        await prisma.rateLimitEntry.update({
            where: { key },
            data: { attempts: 1, lastAttempt: now, blockedUntil: null },
        });
        return;
    }

    // Increment attempts
    const newAttempts = entry.attempts + 1;
    const blockedUntil = newAttempts >= config.maxAttempts
        ? new Date(now.getTime() + config.blockDurationMs)
        : null;

    await prisma.rateLimitEntry.update({
        where: { key },
        data: {
            attempts: newAttempts,
            lastAttempt: now,
            blockedUntil,
        },
    });
}

/**
 * Reset rate limit for a key (call on successful attempts)
 * @param key - Unique identifier
 */
export async function resetRateLimit(key: string): Promise<void> {
    const prisma = getDb();
    await prisma.rateLimitEntry.deleteMany({
        where: { key },
    });
}

/**
 * Get client IP from request headers
 * Handles proxies and load balancers
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
