'use client';

// Login page with 2FA support
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function LoginPage() {
    const router = useRouter();
    const { login, continueAsGuest } = useAuth();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [serverError, setServerError] = useState('');

    // 2FA state
    const [requires2FA, setRequires2FA] = useState(false);
    const [twoFactorCode, setTwoFactorCode] = useState('');
    const [isBackupCode, setIsBackupCode] = useState(false);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setServerError('');

        if (!validateForm()) return;

        setIsLoading(true);

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (data.success) {
                if (data.requires2FA) {
                    // Need 2FA verification
                    setRequires2FA(true);
                    setIsLoading(false);
                } else {
                    // Login complete, refresh auth state
                    await login(formData.email, formData.password);
                    router.push('/chat');
                }
            } else {
                setServerError(data.message || 'Login failed');
                setIsLoading(false);
            }
        } catch (error) {
            setServerError('An error occurred. Please try again.');
            setIsLoading(false);
        }
    };

    const handle2FASubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setServerError('');

        if (!twoFactorCode || twoFactorCode.length < 6) {
            setServerError('Please enter a valid code');
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('/api/auth/2fa/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    email: formData.email,
                    code: twoFactorCode,
                    isBackupCode,
                }),
            });

            const data = await response.json();

            if (data.success) {
                // 2FA verification complete, redirect to chat
                router.push('/chat');
                // Force a page reload to update auth state
                window.location.href = '/chat';
            } else {
                setServerError(data.message || 'Invalid code');
            }
        } catch (error) {
            setServerError('Verification failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGuestMode = async () => {
        await continueAsGuest();
        router.push('/chat');
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // 2FA Verification Screen
    if (requires2FA) {
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
                    <div className="glass rounded-2xl p-8">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-violet-500/20 flex items-center justify-center">
                                <span className="text-3xl">🔐</span>
                            </div>
                            <h1 className="text-2xl font-bold mb-2">Two-Factor Authentication</h1>
                            <p className="text-slate-400">
                                Enter the code from your authenticator app
                            </p>
                        </div>

                        {serverError && (
                            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/50 text-red-400 text-sm">
                                {serverError}
                            </div>
                        )}

                        <form onSubmit={handle2FASubmit} className="space-y-5">
                            <div>
                                <input
                                    type="text"
                                    value={twoFactorCode}
                                    onChange={(e) => setTwoFactorCode(
                                        isBackupCode
                                            ? e.target.value.toUpperCase().slice(0, 8)
                                            : e.target.value.replace(/\D/g, '').slice(0, 6)
                                    )}
                                    placeholder={isBackupCode ? 'XXXXXXXX' : '000000'}
                                    className="w-full px-4 py-4 bg-slate-800/50 border border-slate-700 rounded-xl text-white text-center text-2xl tracking-widest focus:outline-none focus:border-violet-500 font-mono"
                                    maxLength={isBackupCode ? 8 : 6}
                                    autoFocus
                                />
                            </div>

                            <Button
                                type="submit"
                                loading={isLoading}
                                className="w-full"
                                disabled={twoFactorCode.length < 6}
                            >
                                Verify
                            </Button>
                        </form>

                        <div className="mt-6 text-center">
                            <button
                                onClick={() => {
                                    setIsBackupCode(!isBackupCode);
                                    setTwoFactorCode('');
                                    setServerError('');
                                }}
                                className="text-sm text-violet-400 hover:text-violet-300"
                            >
                                {isBackupCode
                                    ? '← Use authenticator app code'
                                    : 'Lost access? Use a backup code'
                                }
                            </button>
                        </div>

                        <div className="mt-4 text-center">
                            <button
                                onClick={() => {
                                    setRequires2FA(false);
                                    setTwoFactorCode('');
                                    setServerError('');
                                }}
                                className="text-sm text-slate-500 hover:text-slate-400"
                            >
                                ← Back to login
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

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
                <div className="glass rounded-2xl p-8">
                    <h1 className="text-2xl font-bold text-center mb-2">Welcome back</h1>
                    <p className="text-slate-400 text-center mb-8">
                        Sign in to continue learning
                    </p>

                    {serverError && (
                        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/50 text-red-400 text-sm">
                            {serverError}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <Input
                            label="Email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            error={errors.email}
                            placeholder="you@example.com"
                            autoComplete="email"
                        />

                        <Input
                            label="Password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            error={errors.password}
                            placeholder="••••••••"
                            autoComplete="current-password"
                        />

                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-violet-500 focus:ring-violet-500 focus:ring-offset-0"
                                />
                                <span className="text-slate-400">Remember me</span>
                            </label>
                            <a href="#" className="text-violet-400 hover:text-violet-300">
                                Forgot password?
                            </a>
                        </div>

                        <Button type="submit" loading={isLoading} className="w-full">
                            Sign In
                        </Button>
                    </form>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-700" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-[#1e1e2e] text-slate-500">or</span>
                        </div>
                    </div>

                    <button
                        onClick={handleGuestMode}
                        className="w-full py-3 text-sm font-medium text-slate-300 border border-slate-700 rounded-xl hover:border-violet-500 hover:text-white transition-all"
                    >
                        Continue as Guest
                    </button>

                    <p className="mt-6 text-center text-sm text-slate-400">
                        Don&apos;t have an account?{' '}
                        <Link href="/signup" className="text-violet-400 hover:text-violet-300 font-medium">
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
