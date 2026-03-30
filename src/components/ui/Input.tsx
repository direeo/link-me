'use client';

import React from 'react';

/**
 * Minimal Input Component: Clean Modern Dark Edition
 * Focus: 150ms transitions and sharp white/violet borders.
 */
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export function Input({
    label,
    error,
    className = '',
    ...props
}: InputProps) {
    return (
        <div className="w-full space-y-2 group">
            {label && (
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 group-focus-within:text-violet-400 transition-colors">
                    {label}
                </label>
            )}
            <div className="relative">
                <input
                    className={`
                        w-full px-4 py-3.5 bg-[#1a1a23] border border-white/5 rounded-xl
                        text-slate-200 placeholder-slate-600 font-medium
                        transition-all duration-150 ease-out
                        hover:border-white/10
                        focus:outline-none focus:border-violet-500/50 focus:bg-[#20202a]
                        ${error ? 'border-red-500/50 text-red-200' : ''}
                        ${className}
                    `}
                    {...props}
                />
            </div>
            {error && (
                <p className="text-[10px] font-black uppercase tracking-widest text-red-500/80 mt-1">
                    ⚠️ {error}
                </p>
            )}
        </div>
    );
}

export default Input;
