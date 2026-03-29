'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

/**
 * Premium Signup Page: Neural Midnight Edition
 */
export default function SignupPage() {
    const router = useRouter();
    const { signup, continueAsGuest } = useAuth();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [serverError, setServerError] = useState('');

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.name.trim()) newErrors.name = 'Full identity required';
        if (!formData.email.trim()) newErrors.email = 'Neural ID required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid transmission pattern';
        
        if (!formData.password) newErrors.password = 'Access protocol required';
        else if (formData.password.length < 8) newErrors.password = 'Complexity below threshold (8+ characters)';
        else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) newErrors.password = 'Protocol requires: Upper, Lower, Digital';

        if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Sync frequency mismatch';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setServerError('');
        if (!validateForm()) return;
        setIsLoading(true);
        const result = await signup(formData.email, formData.password, formData.name);
        setIsLoading(false);
        if (result.success) router.push('/chat');
        else setServerError(result.message);
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

    const getPasswordStrength = () => {
        const p = formData.password;
        if (!p) return { width: '0%', color: 'bg-slate-700', text: '' };
        let s = 0; if (p.length >= 8) s++; if (/[a-z]/.test(p)) s++; if (/[A-Z]/.test(p)) s++; if (/\d/.test(p)) s++; if (/[^a-zA-Z\d]/.test(p)) s++;
        const lvls = [
            { width: '20%', color: 'bg-red-500', text: 'Critical' },
            { width: '40%', color: 'bg-orange-500', text: 'Unsafe' },
            { width: '60%', color: 'bg-yellow-500', text: 'Moderate' },
            { width: '80%', color: 'bg-lime-500', text: 'Secure' },
            { width: '100%', color: 'bg-emerald-500', text: 'Elite' },
        ];
        return lvls[s - 1] || lvls[0];
    };

    const strength = getPasswordStrength();

    return (
        <div className="min-h-screen bg-[#050508] flex items-center justify-center px-4 py-20 relative overflow-hidden selection:bg-violet-500/30">
            {/* Neural Background Orbs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="orb orb-purple top-[5%] -left-[10%] opacity-20" />
                <div className="orb orb-indigo bottom-[15%] -right-[10%] opacity-15" />
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
                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Initialize Profile</h1>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mt-2 italic">Creation of New Mastery Node</p>
                    </div>

                    {serverError && (
                        <div className="mb-8 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-wide">
                            ⚠️ System Halt: {serverError}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Input label="Full Identity" name="name" value={formData.name} onChange={handleChange} error={errors.name} placeholder="John Operator" />
                        <Input label="Neural ID (Email)" name="email" type="email" value={formData.email} onChange={handleChange} error={errors.email} placeholder="you@linkme-ai.com" />
                        
                        <div>
                            <Input label="Access Protocol" name="password" type="password" value={formData.password} onChange={handleChange} error={errors.password} placeholder="••••••••" />
                            {formData.password && (
                                <div className="mt-3">
                                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                                        <div className={`h-full ${strength.color} transition-all duration-500 shadow-[0_0_10px_rgba(255,255,255,0.2)]`} style={{ width: strength.width }} />
                                    </div>
                                    <p className={`text-[10px] uppercase font-black tracking-widest mt-1.5 ${strength.color.replace('bg-', 'text-')}`}>
                                        Protocol Security: {strength.text}
                                    </p>
                                </div>
                            )}
                        </div>

                        <Input label="Sync Confirmation" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} error={errors.confirmPassword} placeholder="••••••••" />
                        
                        <Button type="submit" loading={isLoading} className="w-full py-4 tracking-widest mt-4" variant="glow">
                            Commence Initialization
                        </Button>
                    </form>

                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5" /></div>
                        <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest bg-transparent">
                            <span className="px-4 text-slate-700">Sandbox Interaction</span>
                        </div>
                    </div>

                    <Button onClick={handleGuestMode} variant="outline" className="w-full py-4 tracking-widest text-[10px] uppercase border-white/5 hover:bg-white/5">
                        Initialize Guest Profile
                    </Button>

                    <p className="mt-10 text-center text-[10px] font-black uppercase tracking-widest text-slate-600">
                        Existing Node? <Link href="/login" className="text-violet-400 hover:text-white transition-colors ml-1 underline decoration-violet-500/30">Authorize Registry Access</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
