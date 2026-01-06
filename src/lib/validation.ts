// Input validation schemas using Zod
// Provides type-safe validation for all API inputs

import { z } from 'zod';

// ============================================
// Auth Validation Schemas
// ============================================

export const signupSchema = z.object({
    email: z
        .string()
        .email('Please enter a valid email address')
        .min(1, 'Email is required')
        .max(255, 'Email is too long'),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .max(128, 'Password is too long')
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            'Password must contain at least one uppercase letter, one lowercase letter, and one number'
        ),
    name: z
        .string()
        .min(1, 'Name is required')
        .max(100, 'Name is too long')
        .optional(),
});

export const loginSchema = z.object({
    email: z
        .string()
        .email('Please enter a valid email address')
        .min(1, 'Email is required'),
    password: z
        .string()
        .min(1, 'Password is required'),
});

export const verifyEmailSchema = z.object({
    token: z
        .string()
        .uuid('Invalid verification token'),
});

export const resendVerificationSchema = z.object({
    email: z
        .string()
        .email('Please enter a valid email address'),
});

// ============================================
// Chat Validation Schemas
// ============================================

export const chatMessageSchema = z.object({
    message: z
        .string()
        .min(1, 'Message cannot be empty')
        .max(2000, 'Message is too long'),
    conversationId: z
        .string()
        .optional()
        .nullable(),
});

export const youtubeSearchSchema = z.object({
    query: z
        .string()
        .min(1, 'Search query is required')
        .max(500, 'Search query is too long'),
    maxResults: z
        .number()
        .int()
        .min(1)
        .max(10)
        .default(7),
});

// ============================================
// Type Exports
// ============================================

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
export type ResendVerificationInput = z.infer<typeof resendVerificationSchema>;
export type ChatMessageInput = z.infer<typeof chatMessageSchema>;
export type YouTubeSearchInput = z.infer<typeof youtubeSearchSchema>;

// ============================================
// Validation Helper Functions
// ============================================

/**
 * Sanitize string input to prevent XSS
 * Removes HTML tags and dangerous characters
 */
export function sanitizeInput(input: string): string {
    return input
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/[<>'"&]/g, (char) => {
            const entities: Record<string, string> = {
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;',
                '&': '&amp;',
            };
            return entities[char] || char;
        })
        .trim();
}

/**
 * Validate and parse input against a schema
 * Returns parsed data or throws validation error
 */
export function validateInput<T>(
    schema: z.ZodSchema<T>,
    data: unknown
): { success: true; data: T } | { success: false; errors: string[] } {
    const result = schema.safeParse(data);

    if (result.success) {
        return { success: true, data: result.data };
    }

    const errors = result.error.issues.map((issue) => issue.message);
    return { success: false, errors };
}
