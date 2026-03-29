'use client';

import React, { forwardRef } from 'react';

/**
 * Premium Input Component: Neural Midnight Edition
 * Features: High-blur glass background, focus glow, and clean typography.
 */
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, helperText, className = '', type = 'text', ...props }, ref) => {
        const inputId = props.id || props.name || `input-${Math.random().toString(36).slice(2)}`;

        return (
            <div className="w-full relative group">
                {label && (
                    <label
                        htmlFor={inputId}
                        className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 ml-1 transition-colors group-focus-within:text-violet-400"
                    >
                        {label}
                    </label>
                )}
                <div className="relative">
                    <input
                        ref={ref}
                        id={inputId}
                        type={type}
                        className={`
                            w-full px-4 py-3.5 rounded-xl
                            bg-white/[0.03] border border-white/[0.08]
                            backdrop-blur-xl
                            text-white placeholder-slate-600
                            transition-all duration-300
                            focus:outline-none focus:border-violet-500/50 focus:bg-white/[0.05]
                            focus:shadow-[0_0_20px_rgba(139,92,246,0.15)]
                            hover:border-white/[0.15]
                            disabled:opacity-40 disabled:cursor-not-allowed
                            ${error ? 'border-red-500/50 focus:border-red-500/50 focus:shadow-[0_0_20px_rgba(239,68,68,0.1)]' : ''}
                            ${className}
                        `}
                        {...props}
                    />
                    {/* Animated bottom border glow */}
                    <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-violet-500/0 to-transparent transition-all duration-500 group-focus-within:via-violet-500/50" />
                </div>
                
                {error && (
                    <p className="mt-2 text-xs font-medium text-red-400 flex items-center gap-1.5 ml-1 animate-in fade-in slide-in-from-top-1">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {error}
                    </p>
                )}
                {helperText && !error && (
                    <p className="mt-2 text-xs text-slate-500 ml-1">{helperText}</p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

export default Input;
