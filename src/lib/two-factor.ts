// Two-Factor Authentication utilities
// Uses TOTP (Time-based One-Time Password) for 2FA

import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// App name for authenticator apps
const APP_NAME = 'LinkMe';

// ============================================
// TOTP Secret Generation
// ============================================

/**
 * Generate a new TOTP secret for a user
 */
export function generateTOTPSecret(): string {
    const secret = speakeasy.generateSecret({
        name: APP_NAME,
        length: 20,
    });
    return secret.base32;
}

/**
 * Generate a QR code data URL for authenticator app setup
 */
export async function generateQRCode(email: string, secret: string): Promise<string> {
    const otpauthUrl = speakeasy.otpauthURL({
        secret: secret,
        label: email,
        issuer: APP_NAME,
        encoding: 'base32',
    });
    return QRCode.toDataURL(otpauthUrl);
}

/**
 * Verify a TOTP token
 */
export function verifyTOTP(token: string, secret: string): boolean {
    try {
        return speakeasy.totp.verify({
            secret: secret,
            encoding: 'base32',
            token: token,
            window: 1, // Allow 1 step before and after for clock drift
        });
    } catch {
        return false;
    }
}

// ============================================
// Backup Codes
// ============================================

/**
 * Generate a set of backup codes
 * Returns both the plain codes (to show user once) and hashed codes (to store)
 */
export async function generateBackupCodes(count: number = 10): Promise<{
    plainCodes: string[];
    hashedCodes: string[];
}> {
    const plainCodes: string[] = [];
    const hashedCodes: string[] = [];

    for (let i = 0; i < count; i++) {
        // Generate a random 8-character code
        const code = crypto.randomBytes(4).toString('hex').toUpperCase();
        plainCodes.push(code);

        // Hash the code for secure storage
        const hashedCode = await bcrypt.hash(code, 10);
        hashedCodes.push(hashedCode);
    }

    return { plainCodes, hashedCodes };
}

/**
 * Verify a backup code against stored hashed codes
 * Returns the index of the matched code (for removal) or -1 if not found
 */
export async function verifyBackupCode(
    code: string,
    hashedCodes: string[]
): Promise<number> {
    const normalizedCode = code.toUpperCase().replace(/\s/g, '');

    for (let i = 0; i < hashedCodes.length; i++) {
        const isValid = await bcrypt.compare(normalizedCode, hashedCodes[i]);
        if (isValid) {
            return i;
        }
    }

    return -1;
}

// ============================================
// Secret Encryption (for database storage)
// ============================================

const ENCRYPTION_KEY = process.env.TWO_FACTOR_ENCRYPTION_KEY || 'default-key-change-in-production';

/**
 * Encrypt the TOTP secret before storing
 */
export function encryptSecret(secret: string): string {
    const key = crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);

    let encrypted = cipher.update(secret, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return iv.toString('hex') + ':' + encrypted;
}

/**
 * Decrypt the TOTP secret for verification
 */
export function decryptSecret(encryptedSecret: string): string {
    const [ivHex, encrypted] = encryptedSecret.split(':');
    const key = crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
}
