'use client';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

function VerifyContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get('email') || '';

    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);
    const inputs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        inputs.current[0]?.focus();
    }, []);

    const handleChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;
        const newCode = [...code];
        newCode[index] = value.slice(-1);
        setCode(newCode);
        if (value && index < 5) inputs.current[index + 1]?.focus();
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            inputs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        const newCode = [...code];
        for (let i = 0; i < pastedData.length; i++) newCode[i] = pastedData[i];
        setCode(newCode);
        inputs.current[Math.min(pastedData.length, 5)]?.focus();
    };

    const handleVerify = async () => {
        const fullCode = code.join('');
        if (fullCode.length < 6) return;
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/auth/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code: fullCode }),
            });
            const data = await res.json();
            if (data.success) {
                setIsSuccess(true);
                setTimeout(() => router.push('/chat'), 2000);
            } else {
                setError(data.message || 'Verification failed. Please check your code.');
            }
        } catch {
            setError('Connection failure. Please check your network.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md relative z-10">
            {/* Branding */}
            <div className="text-center mb-10">
                <Link href="/" className="inline-flex items-center gap-3 group transition-all hover:opacity-80 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-xl shadow-violet-500/20 group-hover:scale-110 transition-transform duration-500">
                        <span className="text-2xl text-white">🔗</span>
                    </div>
                    <span className="text-3xl font-black tracking-tighter text-white uppercase">LinkMe</span>
                </Link>
                <h1 className="text-2xl font-black text-white mb-3 uppercase tracking-widest">Verify Your Email</h1>
                <p className="text-slate-400 text-sm font-medium leading-relaxed">
                    We sent a <span className="text-violet-400 font-bold">6-digit code</span> to<br />
                    <span className="text-white font-bold">{email || 'your email address'}</span>
                </p>
            </div>

            {/* Card */}
            <div className="glass-panel border border-white/10 rounded-[2.5rem] p-10 bg-white/[0.02] shadow-2xl">
                {isSuccess ? (
                    <div className="text-center py-10 animate-in zoom-in duration-500">
                        <div className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/20">
                            <svg className="w-10 h-10 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-black text-white uppercase mb-2">Verified!</h2>
                        <p className="text-slate-400 text-sm">Taking you to your workspace...</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* 6-digit inputs */}
                        <div className="flex justify-between gap-2">
                            {code.map((digit, idx) => (
                                <input
                                    key={idx}
                                    ref={(el) => { inputs.current[idx] = el; }}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={e => handleChange(idx, e.target.value)}
                                    onKeyDown={e => handleKeyDown(idx, e)}
                                    onPaste={idx === 0 ? handlePaste : undefined}
                                    className="w-12 h-16 bg-white/[0.03] border-2 border-white/10 rounded-2xl text-center text-3xl font-black text-white focus:outline-none focus:border-violet-500 focus:bg-violet-500/10 transition-all duration-300"
                                />
                            ))}
                        </div>

                        <Button
                            variant="glow"
                            className="w-full py-5 rounded-2xl uppercase tracking-[0.2em] font-black text-[11px]"
                            onClick={handleVerify}
                            disabled={isLoading || code.some(d => !d)}
                        >
                            {isLoading ? 'Verifying...' : 'Confirm & Enter Workspace'}
                        </Button>

                        {error && (
                            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold text-center animate-in slide-in-from-top-2">
                                ⚠️ {error}
                            </div>
                        )}

                        <p className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">
                            Didn't receive a code?{' '}
                            <button className="text-violet-500 hover:text-violet-400 underline transition-colors">
                                Resend
                            </button>
                        </p>
                    </div>
                )}
            </div>

            <p className="text-center mt-10 text-[9px] font-black uppercase tracking-[0.4em] text-white/5">
                Secure AI Neural Architecture • LinkMe Protocol V2.0
            </p>
        </div>
    );
}

export default function VerifyPage() {
    return (
        <div className="min-h-screen bg-[#050508] flex items-center justify-center p-6 relative overflow-hidden selection:bg-violet-500/30">
            {/* Background Glows */}
            <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
            <Suspense fallback={<div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />}>
                <VerifyContent />
            </Suspense>
        </div>
    );
}
