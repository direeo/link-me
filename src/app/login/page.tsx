'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function LoginPage() {
    const router = useRouter();
    const { login, continueAsGuest } = useAuth();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [serverError, setServerError] = useState('');

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
        const result = await login(formData.email, formData.password);
        setIsLoading(false);

        if (result.requires2FA) {
            // Redirect to OTP page for 2FA
            router.push(`/verify?type=2fa&email=${encodeURIComponent(result.email || formData.email)}`);
        } else if (result.requiresVerification) {
            // Redirect to OTP page for email verification
            router.push(`/verify?type=email&email=${encodeURIComponent(result.email || formData.email)}`);
        } else if (result.success) {
            router.push('/chat');
        } else {
            setServerError(result.message);
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
        <div className="min-h-screen flex items-center justify-center px-4 py-20 relative overflow-hidden">
            <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-700">
                {/* Branding */}
                <Link href="/" className="flex flex-col items-center gap-6 mb-12 group">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20 transition-transform group-hover:scale-110">
                        <span className="text-white font-black text-xl">🔗</span>
                    </div>
                </Link>

                <div className="glass-panel rounded-[40px] p-8 md:p-12 relative overflow-hidden transition-all duration-700 animate-in fade-in zoom-in-95">
                    <div className="text-center mb-10">
                        <h1 className="text-xl font-bold text-white uppercase tracking-widest">Sign In</h1>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mt-2 italic">Resuming Learning Session</p>
                    </div>

                    {serverError && (
                        <div className="mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-widest">
                            ⚠️ {serverError}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <Input label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} error={errors.email} placeholder="you@example.com" />
                            <Input label="Password" name="password" type="password" value={formData.password} onChange={handleChange} error={errors.password} placeholder="••••••••" />
                        </div>
                        <Button type="submit" loading={isLoading} variant="glow" className="w-full h-14 text-[10px] font-bold uppercase tracking-[0.2em] mt-2 shadow-[0_10px_30px_rgba(139,92,246,0.3)]">
                            Sign In
                        </Button>
                    </form>

<div className="relative my-8">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5" /></div>
                        <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
                            <span className="px-4 text-slate-600 bg-transparent">Guest Access</span>
                        </div>
                    </div>

                    <Button onClick={handleGuestMode} variant="outline" className="w-full py-5 text-[10px] font-bold uppercase tracking-[0.2em] border-white/5 hover:bg-white/5">
                        Continue as Guest
                    </Button>

                    <p className="mt-10 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">
                        New User? <Link href="/signup" className="text-white hover:underline transition-colors ml-1 italic font-bold">Create Account</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
