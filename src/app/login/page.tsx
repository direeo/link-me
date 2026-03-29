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
        <div className="min-h-screen bg-[#050508] flex items-center justify-center px-4 py-20 relative overflow-hidden selection:bg-violet-500/30">
            {/* Neural Background Orbs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="orb orb-purple top-[10%] -left-[10%] opacity-20" />
                <div className="orb orb-indigo bottom-[10%] -right-[10%] opacity-15" />
            </div>

            <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-700">
                {/* Branding */}
                <Link href="/" className="flex items-center justify-center gap-3 mb-10 group">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-xl shadow-violet-500/20 group-hover:scale-110 transition-transform duration-300">
                        <span className="text-xl">🔗</span>
                    </div>
                    <span className="text-2xl font-black tracking-tighter text-white uppercase group-hover:tracking-normal transition-all duration-300">LinkMe</span>
                </Link>

                <div className="glass-panel rounded-[2.5rem] p-8 md:p-10 border-white/5 premium-glow-violet">
                    {requires2FA ? (
                        <>
                            <div className="text-center mb-10">
                                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shadow-inner">
                                    <span className="text-2xl">🔐</span>
                                </div>
                                <h1 className="text-2xl font-black text-white uppercase tracking-tight">Neural Unlock</h1>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mt-2">
                                    Identity Verification Required
                                </p>
                            </div>

                            {serverError && (
                                <div className="mb-8 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-wide">
                                    ⚠️ {serverError}
                                </div>
                            )}

                            <form onSubmit={handle2FASubmit} className="space-y-6">
                                <input
                                    type="text"
                                    value={twoFactorCode}
                                    onChange={(e) => setTwoFactorCode(isBackupCode ? e.target.value.toUpperCase().slice(0, 8) : e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    placeholder={isBackupCode ? 'BACKUP CODE' : '0 0 0 0 0 0'}
                                    className="w-full px-4 py-5 bg-white/[0.03] border border-white/[0.08] rounded-2xl text-white text-center text-3xl tracking-[0.3em] focus:outline-none focus:border-violet-500/50 font-black backdrop-blur-xl"
                                    maxLength={isBackupCode ? 8 : 6}
                                    autoFocus
                                />
                                <Button type="submit" loading={isLoading} className="w-full py-4" variant="glow">
                                    Verify Identity
                                </Button>
                            </form>
                            
                            <div className="mt-8 flex flex-col gap-4 text-center">
                                <button onClick={() => { setIsBackupCode(!isBackupCode); setTwoFactorCode(''); }} className="text-[10px] font-black uppercase tracking-widest text-violet-400 hover:text-white transition-colors">
                                    {isBackupCode ? 'Use App Code' : 'Lost Access? Use Backup'}
                                </button>
                                <button onClick={() => setRequires2FA(false)} className="text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-slate-400 transition-colors">
                                    Return to Registry
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="text-center mb-10">
                                <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Welcome Back</h1>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mt-2 italic">Resuming Learning Session</p>
                            </div>

                            {serverError && (
                                <div className="mb-8 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-wide">
                                    ⚠️ {serverError}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <Input label="Neural ID (Email)" name="email" type="email" value={formData.email} onChange={handleChange} error={errors.email} placeholder="operator@linkme.com" />
                                <Input label="Access Protocol (Password)" name="password" type="password" value={formData.password} onChange={handleChange} error={errors.password} placeholder="••••••••" />
                                
                                <div className="flex items-center justify-between">
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <div className="w-4 h-4 rounded border border-white/10 bg-white/5 flex items-center justify-center transition-all group-hover:border-violet-500/50">
                                            <input type="checkbox" className="hidden" />
                                            <div className="w-2 h-2 rounded-sm bg-violet-500 opacity-0 transition-opacity" />
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest group-hover:text-slate-300">Maintain Session</span>
                                    </label>
                                    <a href="#" className="text-[10px] font-bold text-violet-400 hover:text-white uppercase tracking-widest">Forgot Protocol?</a>
                                </div>

                                <Button type="submit" loading={isLoading} className="w-full py-4 tracking-widest" variant="glow">
                                    Authorize Access
                                </Button>
                            </form>

                            <div className="relative my-8">
                                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5" /></div>
                                <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest leading-none bg-transparent">
                                    <span className="px-4 text-slate-700">External Node Bypass</span>
                                </div>
                            </div>

                            <Button onClick={handleGuestMode} variant="outline" className="w-full py-4 tracking-widest text-[10px] uppercase border-white/5 hover:bg-white/5">
                                Initialize Guest Access
                            </Button>

                            <p className="mt-10 text-center text-[10px] font-black uppercase tracking-widest text-slate-600">
                                New Operator? <Link href="/signup" className="text-violet-400 hover:text-white transition-colors ml-1 underline decoration-violet-500/30">Create Neural Profile</Link>
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
