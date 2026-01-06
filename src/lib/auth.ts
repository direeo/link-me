// Authentication utilities
// Handles password hashing, JWT tokens, and verification tokens

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10);
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-me';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'default-refresh-secret-change-me';

// Token expiration times
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';
const VERIFICATION_TOKEN_EXPIRY_HOURS = 24;

// Payload types
export interface TokenPayload {
    userId: string;
    email: string;
    emailVerified: boolean;
    isGuest?: boolean;
}

export interface DecodedToken extends TokenPayload {
    iat: number;
    exp: number;
}

// ============================================
// Password Functions
// ============================================

/**
 * Hash a password using bcrypt
 * @param password - Plain text password
 * @returns Hashed password string
 */
export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify a password against its hash
 * @param password - Plain text password
 * @param hash - Stored password hash
 * @returns True if password matches
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

// ============================================
// JWT Token Functions
// ============================================

/**
 * Generate an access token
 * @param payload - Token payload with user info
 * @returns Signed JWT access token
 */
export function generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
}

/**
 * Generate a refresh token
 * @param payload - Token payload with user info
 * @returns Signed JWT refresh token
 */
export function generateRefreshToken(payload: TokenPayload): string {
    return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
}

/**
 * Verify and decode an access token
 * @param token - JWT access token
 * @returns Decoded token payload or null if invalid
 */
export function verifyAccessToken(token: string): DecodedToken | null {
    try {
        return jwt.verify(token, JWT_SECRET) as DecodedToken;
    } catch {
        return null;
    }
}

/**
 * Verify and decode a refresh token
 * @param token - JWT refresh token
 * @returns Decoded token payload or null if invalid
 */
export function verifyRefreshToken(token: string): DecodedToken | null {
    try {
        return jwt.verify(token, JWT_REFRESH_SECRET) as DecodedToken;
    } catch {
        return null;
    }
}

// ============================================
// Verification Token Functions
// ============================================

/**
 * Generate a cryptographically secure verification token
 * @returns Object with token string and expiration date
 */
export function generateVerificationToken(): { token: string; expiresAt: Date } {
    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + VERIFICATION_TOKEN_EXPIRY_HOURS);

    return { token, expiresAt };
}

/**
 * Check if a verification token is expired
 * @param expiresAt - Token expiration date
 * @returns True if token is expired
 */
export function isTokenExpired(expiresAt: Date): boolean {
    return new Date() > new Date(expiresAt);
}

// ============================================
// Guest Token Functions
// ============================================

/**
 * Generate a guest access token (limited permissions)
 * @returns Signed JWT token for guest user
 */
export function generateGuestToken(): string {
    const payload: TokenPayload = {
        userId: `guest_${uuidv4()}`,
        email: '',
        emailVerified: false,
        isGuest: true,
    };

    return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}

/**
 * Check if a token belongs to a guest user
 * @param token - Decoded token payload
 * @returns True if user is a guest
 */
export function isGuestToken(token: DecodedToken): boolean {
    return token.isGuest === true;
}
