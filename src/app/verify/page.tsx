'use client';

// Email verification page
import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

function VerifyEmailContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Invalid verification link. Please check your email for the correct link.');
            return;
        }

        const verifyEmail = async () => {
            try {
                const response = await fetch('/api/verify/email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token }),
                });

                const data = await response.json();

                if (data.success) {
                    setStatus('success');
                    setMessage(data.message);
                    // Redirect to chat after 2 seconds
                    setTimeout(() => {
                        router.push('/chat');
                    }, 2000);
                } else {
                    setStatus('error');
                    setMessage(data.message);
                }
            } catch {
                setStatus('error');
                setMessage('An error occurred while verifying your email.');
            }
        };

        verifyEmail();
    }, [token, router]);

    return (
        <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4 py-12 relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 -left-32 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
            </div>

            <div className="w-full max-w-md relative z-10">
                {/* Logo */}
                <Link href="/" className="flex items-center justify-center gap-2 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
                        <span className="text-xl">🔗</span>
                    </div>
                    <span className="text-xl font-bold gradient-text">LinkMe</span>
                </Link>

                {/* Card */}
                <div className="glass rounded-2xl p-8 text-center">
                    {status === 'loading' && (
                        <>
                            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-violet-500/20 flex items-center justify-center">
                                <svg
                                    className="w-8 h-8 text-violet-400 animate-spin"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    />
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                    />
                                </svg>
                            </div>
                            <h1 className="text-2xl font-bold mb-2">Verifying your email...</h1>
                            <p className="text-slate-400">Please wait while we verify your email address.</p>
                        </>
                    )}

                    {status === 'success' && (
                        <>
                            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
                                <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h1 className="text-2xl font-bold mb-2">Email Verified!</h1>
                            <p className="text-slate-400">{message}</p>
                            <p className="text-sm text-slate-500 mt-4">Redirecting to chat...</p>
                        </>
                    )}

                    {status === 'error' && (
                        <>
                            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
                                <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                            <h1 className="text-2xl font-bold mb-2">Verification Failed</h1>
                            <p className="text-slate-400 mb-6">{message}</p>
                            <Link
                                href="/login"
                                className="inline-flex px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl hover:from-violet-500 hover:to-indigo-500 transition-all"
                            >
                                Back to Login
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function VerifyPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
                <div className="text-white">Loading...</div>
            </div>
        }>
            <VerifyEmailContent />
        </Suspense>
    );
}
