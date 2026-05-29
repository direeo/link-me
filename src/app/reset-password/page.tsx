'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

function ResetPasswordContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token') || '';
    const email = searchParams.get('email') || '';

    const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    // If no token or email in URL, something's wrong
    const isBadLink = !token || !email;

    useEffect(() => {
        if (isSuccess) {
            const timer = setTimeout(() => router.push('/login'), 2500);
            return () => clearTimeout(timer);
        }
    }, [isSuccess, router]);

    const validate = () => {
        const errs: Record<string, string> = {};
        if (!formData.password) errs.password = 'Password required';
        else if (formData.password.length < 8) errs.password = 'At least 8 characters';
        else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password))
            errs.password = 'Needs uppercase, lowercase, and a number';
        if (!formData.confirmPassword) errs.confirmPassword = 'Please confirm your password';
        else if (formData.password !== formData.confirmPassword) errs.confirmPassword = 'Passwords do not match';
        setFieldErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        setError('');
        setIsLoading(true);

        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, token, password: formData.password }),
            });
            const data = await res.json();

            if (data.success) {
                setIsSuccess(true);
            } else {
                setError(data.message || 'Something went wrong. Please request a new reset link.');
            }
        } catch {
            setError('Connection error. Please check your network and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (fieldErrors[name]) setFieldErrors(prev => ({ ...prev, [name]: '' }));
    };

    return (
        <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-700">
            {/* Branding */}
            <Link href="/" className="flex flex-col items-center gap-6 mb-12 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20 transition-transform group-hover:scale-110">
                    <span className="text-white font-black text-xl">L</span>
                </div>
                <span className="text-2xl font-black tracking-tighter text-white uppercase -mt-4">LinkMe</span>
            </Link>

            <div className="glass-panel rounded-[40px] p-8 md:p-12 border border-white/10 bg-white/[0.02]">
                {isBadLink ? (
                    <div className="text-center py-4">
                        <div className="w-16 h-16 rounded-full bg-red-500/10 border-2 border-red-500/40 flex items-center justify-center mx-auto mb-6">
                            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-white mb-3 uppercase tracking-widest">Invalid Link</h2>
                        <p className="text-slate-400 text-sm leading-relaxed mb-8">
                            This reset link is missing required information. Please request a new one.
                        </p>
                        <Link href="/forgot-password">
                            <Button variant="glow" className="w-full text-[10px] font-bold uppercase tracking-[0.2em]">
                                Request New Link
                            </Button>
                        </Link>
                    </div>
                ) : isSuccess ? (
                    <div className="text-center py-4 animate-in zoom-in duration-500">
                        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500 flex items-center justify-center mx-auto mb-6">
                            <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-white mb-3 uppercase tracking-widest">Password Updated</h2>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Your password has been reset. Redirecting you to sign in...
                        </p>
                        <div className="mt-4 w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" />
                    </div>
                ) : (
                    <>
                        <div className="text-center mb-10">
                            <h1 className="text-xl font-bold text-white uppercase tracking-widest">New Password</h1>
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mt-2">
                                Choose a strong password
                            </p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold text-center">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <Input
                                    label="New Password"
                                    name="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    error={fieldErrors.password}
                                    placeholder="••••••••"
                                />
                                <p className="text-[9px] text-slate-500 mt-2 leading-relaxed">
                                    8+ characters, 1 uppercase, 1 lowercase, 1 number
                                </p>
                            </div>
                            <Input
                                label="Confirm Password"
                                name="confirmPassword"
                                type="password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                error={fieldErrors.confirmPassword}
                                placeholder="••••••••"
                            />
                            <Button
                                type="submit"
                                loading={isLoading}
                                variant="glow"
                                className="w-full h-14 text-[10px] font-bold uppercase tracking-[0.2em] mt-2"
                            >
                                Reset Password
                            </Button>
                        </form>
                    </>
                )}

                {!isBadLink && !isSuccess && (
                    <p className="mt-10 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">
                        Link expired?{' '}
                        <Link href="/forgot-password" className="text-white hover:underline transition-colors ml-1 italic font-bold">
                            Get a new one
                        </Link>
                    </p>
                )}
            </div>

            <p className="text-center mt-8 text-[9px] font-black uppercase tracking-[0.4em] text-white/5">
                LinkMe • Secure Login
            </p>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen bg-[#050508] flex items-center justify-center p-6 relative overflow-hidden selection:bg-violet-500/30">
            <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
            <Suspense fallback={<div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />}>
                <ResetPasswordContent />
            </Suspense>
        </div>
    );
}
