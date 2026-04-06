'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

/**
 * Premium Login Page: Neural Midnight Edition
 */
export default function LoginPage() {
    const router = useRouter();
    const { login, continueAsGuest } = useAuth();

    const [formData, setFormData] = useState({ email: '', password: '' });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [serverError, setServerError] = useState('');

    const [requires2FA, setRequires2FA] = useState(false);
    const [twoFactorCode, setTwoFactorCode] = useState('');
    const [isBackupCode, setIsBackupCode] = useState(false);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.email.trim()) newErrors.email = 'Email required';
        if (!formData.password) newErrors.password = 'Password required';
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
                    setRequires2FA(true);
                    setIsLoading(false);
                } else {
                    await login(formData.email, formData.password);
                    router.push('/chat');
                }
            } else {
                setServerError(data.message || 'Login failed');
                setIsLoading(false);
            }
        } catch {
            setServerError('An error occurred');
            setIsLoading(false);
        }
    };

    const handle2FASubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await fetch('/api/auth/2fa/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ email: formData.email, code: twoFactorCode, isBackupCode }),
            });
            const data = await response.json();
            if (data.success) window.location.href = '/chat';
            else setServerError(data.message || 'Invalid code');
        } catch {
            setServerError('Verification failed');
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
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 py-20 relative overflow-hidden font-sans selection:bg-white/10">
            
            <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-700">
                {/* Branding */}
                <Link href="/" className="flex flex-col items-center gap-6 mb-12 group">
                    <div className="w-10 h-10 rounded bg-white flex items-center justify-center shadow-lg transition-transform duration-150 hover:scale-[1.02]">
                        <span className="text-black font-black text-lg">🔗</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-2xl font-black tracking-tighter text-white uppercase sm:block italic">LinkMe AI</span>
                        <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-800 mt-2">Secure Access</span>
                    </div>
                </Link>

                <div className="bg-[#111111] rounded-2xl p-8 md:p-12 border border-[#262626]">
                    {requires2FA ? (
                        <>
                            <div className="text-center mb-10">
                                <div className="w-16 h-16 mx-auto mb-6 rounded bg-white flex items-center justify-center shadow-lg">
                                    <span className="text-black font-black text-2xl">🔐</span>
                                </div>
                                <h1 className="text-xl font-bold text-white uppercase tracking-widest">2FA Verification</h1>
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mt-2">
                                    Identity Verification Required
                                </p>
                            </div>

                            {serverError && (
                                <div className="mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-widest">
                                    ⚠️ {serverError}
                                </div>
                            )}

                            <form onSubmit={handle2FASubmit} className="space-y-6">
                                <input
                                    type="text"
                                    value={twoFactorCode}
                                    onChange={(e) => setTwoFactorCode(isBackupCode ? e.target.value.toUpperCase().slice(0, 8) : e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    placeholder={isBackupCode ? 'BACKUP CODE' : '0 0 0 0 0 0'}
                                    className="w-full px-4 py-6 bg-white/[0.03] border border-[#262626] rounded-xl text-white text-center text-3xl tracking-[0.3em] focus:outline-none focus:border-white/20 font-black"
                                    maxLength={isBackupCode ? 8 : 6}
                                    autoFocus
                                />
                                <Button type="submit" loading={isLoading} className="w-full py-5 text-[10px] font-bold uppercase tracking-[0.2em]" variant="primary">
                                    Verify Identity
                                </Button>
                            </form>
                            
                            <div className="mt-8 flex flex-col gap-4 text-center">
                                <button onClick={() => { setIsBackupCode(!isBackupCode); setTwoFactorCode(''); }} className="text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-white transition-colors underline decoration-[#262626]">
                                    {isBackupCode ? 'Use App Registry Code' : 'Lost Access? Use Backup Recovery'}
                                </button>
                                <button onClick={() => setRequires2FA(false)} className="text-[10px] font-bold uppercase tracking-widest text-slate-800 hover:text-slate-500 transition-colors">
                                    Return to Login
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="text-center mb-10">
                                <h1 className="text-xl font-bold text-white uppercase tracking-widest">Welcome Back</h1>
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mt-2 italic">Resuming Learning Session</p>
                            </div>

                            {serverError && (
                                <div className="mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-widest">
                                    ⚠️ Access Denied: {serverError}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-4">
                                    <Input label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} error={errors.email} placeholder="you@example.com" />
                                    <Input label="Password" name="password" type="password" value={formData.password} onChange={handleChange} error={errors.password} placeholder="••••••••" />
                                </div>
                                
                                <div className="flex items-center justify-between">
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <div className="w-4 h-4 rounded border border-[#262626] bg-white/5 flex items-center justify-center transition-all group-hover:border-white/20">
                                            <input type="checkbox" className="hidden" />
                                            <div className="w-2 h-2 rounded-sm bg-white opacity-0 transition-opacity" />
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-800 uppercase tracking-widest group-hover:text-slate-500">Maintain Session</span>
                                    </label>
                                    <a href="#" className="text-[10px] font-bold text-slate-500 hover:text-white uppercase tracking-widest italic">Forgot password?</a>
                                </div>

                                <Button type="submit" loading={isLoading} className="w-full py-5 text-[10px] font-bold uppercase tracking-[0.2em]" variant="primary">
                                    Sign In
                                </Button>
                            </form>

                            <div className="relative my-10">
                                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#262626]" /></div>
                                <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest bg-transparent">
                                    <span className="px-4 text-slate-800 bg-[#111111]">Guest Access</span>
                                </div>
                            </div>

                            <Button onClick={handleGuestMode} variant="outline" className="w-full py-5 text-[10px] font-bold uppercase tracking-[0.2em] border-[#262626] hover:bg-white/5">
                                Continue as Guest
                            </Button>

                            <p className="mt-10 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">
                                New User? <Link href="/signup" className="text-white hover:underline transition-colors ml-1 italic font-bold">Create Account</Link>
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
