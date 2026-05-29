'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log to console in dev; in production you'd send to an error tracking service
        console.error('App error:', error);
    }, [error]);

    return (
        <div className="min-h-screen bg-[#050508] flex items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="relative z-10 text-center max-w-md animate-in fade-in zoom-in-95 duration-500">
                {/* Logo */}
                <Link href="/" className="inline-flex items-center gap-3 mb-12 group">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20 transition-transform group-hover:scale-110">
                        <span className="text-white font-black text-xl">L</span>
                    </div>
                    <span className="text-2xl font-black tracking-tighter text-white uppercase">LinkMe</span>
                </Link>

                {/* Error icon */}
                <div className="w-16 h-16 rounded-full bg-red-500/10 border-2 border-red-500/30 flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>

                <h1 className="text-xl font-black text-white uppercase tracking-widest mb-3">
                    Something went wrong
                </h1>
                <p className="text-slate-500 text-sm leading-relaxed mb-8">
                    We hit an unexpected error. This has been noted — please try again.
                </p>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={reset}
                        className="px-8 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.2em] hover:opacity-90 transition-opacity"
                    >
                        Try Again
                    </button>
                    <Link
                        href="/"
                        className="px-8 py-3 rounded-2xl border border-white/10 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] hover:border-white/20 hover:text-white transition-all"
                    >
                        Go Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
