'use client';

import React from 'react';

/**
 * Minimal Input Component: True Professional Minimalism
 * No gradients, no blurs, just clean whitespace and sharp 1px borders.
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
        <div className="w-full space-y-1.5 font-sans">
            {label && (
                <label className="block text-[11px] font-semibold text-slate-500 transition-colors group-focus-within:text-slate-300">
                    {label}
                </label>
            )}
            <div className="relative">
                <input
                    className={`
                        w-full px-4 py-2.5 bg-[#111111] border border-[#262626] rounded-lg
                        text-slate-200 placeholder-slate-600 text-sm
                        transition-all duration-150 ease-out
                        hover:border-[#333333]
                        focus:outline-none focus:border-white/20 focus:bg-[#161616]
                        ${error ? 'border-red-500/50 text-red-200' : ''}
                        ${className}
                    `}
                    {...props}
                />
            </div>
            {error && (
                <p className="text-[10px] font-semibold text-red-500/80 mt-1">
                    {error}
                </p>
            )}
        </div>
    );
}

export default Input;
