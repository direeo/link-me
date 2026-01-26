// Next.js middleware for route protection and security headers
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication
const PROTECTED_ROUTES = ['/chat', '/settings'];

// Routes that should redirect authenticated users (but not guests)
const AUTH_ROUTES = ['/login', '/signup'];

// Helper to decode JWT without verifying (for quick check in middleware)
function decodeJwtPayload(token: string): { isGuest?: boolean } | null {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;
        const payload = JSON.parse(atob(parts[1]));
        return payload;
    } catch {
        return null;
    }
}

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Get auth token from cookies
    const accessToken = request.cookies.get('accessToken')?.value;
    const isAuthenticated = !!accessToken;

    // Check if user is a guest (they should be allowed to sign in/sign up)
    let isGuest = false;
    if (accessToken) {
        const payload = decodeJwtPayload(accessToken);
        isGuest = payload?.isGuest === true;
    }

    // Create response with security headers
    const response = NextResponse.next();

    // Add security headers
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set(
        'Permissions-Policy',
        'camera=(), microphone=(), geolocation=()'
    );

    // Content Security Policy
    const csp = [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: https: blob:",
        "connect-src 'self' https://www.googleapis.com",
        "frame-src 'self' https://www.youtube.com",
    ].join('; ');

    response.headers.set('Content-Security-Policy', csp);

    // Check protected routes - note: we allow access even without auth
    // because the chat page handles guest mode internally
    // This middleware primarily adds security headers

    // Redirect fully authenticated users (not guests) away from auth pages
    // Guests should be able to sign in or create an account
    if (AUTH_ROUTES.includes(pathname) && isAuthenticated && !isGuest) {
        return NextResponse.redirect(new URL('/chat', request.url));
    }

    return response;
}


// Configure which paths the middleware runs on
export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - api routes
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico
         * - public files
         */
        '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
    ],
};
