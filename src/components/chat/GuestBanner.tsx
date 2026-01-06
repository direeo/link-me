'use client';

// Guest mode banner component
import React from 'react';
import Link from 'next/link';

export function GuestBanner() {
    return (
        <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-xl p-4 mb-4">
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                    <svg
                        className="w-4 h-4 text-amber-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                    </svg>
                </div>
                <div className="flex-1">
                    <h4 className="text-amber-300 font-medium text-sm">Guest Mode</h4>
                    <p className="text-amber-200/70 text-xs mt-1">
                        You&apos;re browsing as a guest. Your search history won&apos;t be saved.
                    </p>
                    <div className="mt-3 flex gap-2">
                        <Link
                            href="/signup"
                            className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg bg-amber-500 text-black hover:bg-amber-400 transition-colors"
                        >
                            Create Account
                        </Link>
                        <Link
                            href="/login"
                            className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg border border-amber-500/50 text-amber-300 hover:bg-amber-500/20 transition-colors"
                        >
                            Sign In
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default GuestBanner;
