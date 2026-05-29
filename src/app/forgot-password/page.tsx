'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) { setError('Please enter your email address.'); return; }
        setError('');
        setIsLoading(true);

        try {
            await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            // Always show success regardless of whether the email exists
            setSubmitted(true);
        } catch {
            setError('Connection error. Please check your network and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-20 relative overflow-hidden">
            <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-700">
                {/* Branding */}
                <Link href="/" className="flex flex-col items-center gap-6 mb-12 group">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20 transition-transform group-hover:scale-110">
                        <span className="text-white font-black text-xl">L</span>
                    </div>
                    <span className="text-2xl font-black tracking-tighter text-white uppercase -mt-4">LinkMe</span>
                </Link>

                <div className="glass-panel rounded-[40px] p-8 md:p-12 border border-white/10 bg-white/[0.02]">
                    {submitted ? (
                        <div className="text-center py-4 animate-in zoom-in duration-500">
                            <div className="w-16 h-16 rounded-full bg-violet-500/10 border-2 border-violet-500 flex items-center justify-center mx-auto mb-6">
                                <svg className="w-8 h-8 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold text-white mb-3 uppercase tracking-widest">Check your inbox</h2>
                            <p className="text-slate-400 text-sm leading-relaxed mb-8">
                                If <span className="text-white font-semibold">{email}</span> is registered, we&apos;ve sent a password reset link. It expires in 1 hour.
                            </p>
                            <p className="text-[10px] text-slate-600 uppercase tracking-widest mb-6">
                                Didn&apos;t receive it? Check your spam folder or try again.
                            </p>
                            <button
                                onClick={() => setSubmitted(false)}
                                className="text-[11px] font-bold uppercase tracking-widest text-slate-500 hover:text-violet-400 transition-colors underline"
                            >
                                Try a different email
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="text-center mb-10">
                                <h1 className="text-xl font-bold text-white uppercase tracking-widest">Forgot Password</h1>
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mt-2">
                                    Enter your email to receive a reset link
                                </p>
                            </div>

                            {error && (
                                <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-widest">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <Input
                                    label="Email Address"
                                    name="email"
                                    type="email"
                                    value={email}
                                    onChange={e => { setEmail(e.target.value); setError(''); }}
                                    placeholder="you@example.com"
                                />
                                <Button
                                    type="submit"
                                    loading={isLoading}
                                    variant="glow"
                                    className="w-full h-14 text-[10px] font-bold uppercase tracking-[0.2em]"
                                >
                                    Send Reset Link
                                </Button>
                            </form>
                        </>
                    )}

                    <p className="mt-10 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">
                        Remembered it?{' '}
                        <Link href="/login" className="text-white hover:underline transition-colors ml-1 italic font-bold">
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
