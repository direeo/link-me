'use client';

// Signup page
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

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

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
            newErrors.password = 'Password must include uppercase, lowercase, and number';
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

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

        if (result.success) {
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
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // Password strength indicator
    const getPasswordStrength = () => {
        const password = formData.password;
        if (!password) return { width: '0%', color: 'bg-slate-700', text: '' };

        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[^a-zA-Z\d]/.test(password)) strength++;

        const levels = [
            { width: '20%', color: 'bg-red-500', text: 'Very weak' },
            { width: '40%', color: 'bg-orange-500', text: 'Weak' },
            { width: '60%', color: 'bg-yellow-500', text: 'Fair' },
            { width: '80%', color: 'bg-lime-500', text: 'Good' },
            { width: '100%', color: 'bg-green-500', text: 'Strong' },
        ];

        return levels[strength - 1] || levels[0];
    };

    const strength = getPasswordStrength();

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
                    <h1 className="text-2xl font-bold text-center mb-2">Create your account</h1>
                    <p className="text-slate-400 text-center mb-8">
                        Start discovering the best tutorials
                    </p>

                    {serverError && (
                        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/50 text-red-400 text-sm">
                            {serverError}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <Input
                            label="Full Name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            error={errors.name}
                            placeholder="John Doe"
                            autoComplete="name"
                        />

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

                        <div>
                            <Input
                                label="Password"
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                error={errors.password}
                                placeholder="••••••••"
                                autoComplete="new-password"
                            />
                            {formData.password && (
                                <div className="mt-2">
                                    <div className="h-1 w-full bg-slate-700 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${strength.color} transition-all duration-300`}
                                            style={{ width: strength.width }}
                                        />
                                    </div>
                                    <p className={`text-xs mt-1 ${strength.color.replace('bg-', 'text-')}`}>
                                        {strength.text}
                                    </p>
                                </div>
                            )}
                        </div>

                        <Input
                            label="Confirm Password"
                            name="confirmPassword"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            error={errors.confirmPassword}
                            placeholder="••••••••"
                            autoComplete="new-password"
                        />

                        <Button type="submit" loading={isLoading} className="w-full">
                            Create Account
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
                        Already have an account?{' '}
                        <Link href="/login" className="text-violet-400 hover:text-violet-300 font-medium">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
