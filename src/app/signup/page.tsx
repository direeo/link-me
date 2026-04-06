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
        if (!formData.name.trim()) newErrors.name = 'Full name required';
        if (!formData.email.trim()) newErrors.email = 'Email required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format';
        
        if (!formData.password) newErrors.password = 'Password required';
        else if (formData.password.length < 8) newErrors.password = 'Password too short (8+ characters)';
        else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) newErrors.password = 'Requires: Upper, Lower, Digital';

        if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

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
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 py-20 relative overflow-hidden font-sans selection:bg-white/10">
            
            <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-700">
                {/* Branding */}
                <Link href="/" className="flex flex-col items-center gap-6 mb-12 group">
                    <div className="w-10 h-10 rounded bg-white flex items-center justify-center shadow-lg transition-transform duration-150 hover:scale-[1.02]">
                        <span className="text-black font-black text-lg">🔗</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-2xl font-black tracking-tighter text-white uppercase sm:block italic">LinkMe AI</span>
                        <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-800 mt-2">Personalized Learning</span>
                    </div>
                </Link>

                <div className="bg-[#111111] rounded-2xl p-8 md:p-12 border border-[#262626]">
                    <div className="text-center mb-10">
                        <h1 className="text-xl font-bold text-white uppercase tracking-widest">Create Account</h1>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mt-2 italic">Join the LinkMe Network</p>
                    </div>

                    {serverError && (
                        <div className="mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-widest">
                            ⚠️ System Halt: {serverError}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <Input label="Full Name" name="name" value={formData.name} onChange={handleChange} error={errors.name} placeholder="John Doe" />
                            <Input label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} error={errors.email} placeholder="you@example.com" />
                            
                            <div>
                                <Input label="Password" name="password" type="password" value={formData.password} onChange={handleChange} error={errors.password} placeholder="••••••••" />
                                {formData.password && (
                                    <div className="mt-3">
                                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                                            <div className={`h-full ${strength.color} transition-all duration-500`} style={{ width: strength.width }} />
                                        </div>
                                        <p className={`text-[10px] uppercase font-bold tracking-widest mt-1.5 ${strength.color.replace('bg-', 'text-')}`}>
                                            Strength: {strength.text}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <Input label="Confirm Password" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} error={errors.confirmPassword} placeholder="••••••••" />
                        </div>
                        
                        <Button type="submit" loading={isLoading} className="w-full py-5 text-[10px] font-bold uppercase tracking-[0.2em] mt-4" variant="primary">
                            Create Account
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
                        Existing user? <Link href="/login" className="text-white hover:underline transition-colors ml-1 italic">Sign In</Link>
                    </p>
                </div>
                
                <div className="text-center mt-12">
                    <p className="text-[10px] font-bold text-slate-800 uppercase tracking-widest leading-relaxed">
                        By initializing, you agree to our <br/> 
                        <Link href="/terms" className="text-slate-600 hover:text-white underline">Terms of Service</Link> and <Link href="/privacy" className="text-slate-600 hover:text-white underline">Privacy Policy</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
