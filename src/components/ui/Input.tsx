'use client';

import React, { useState } from 'react';

/**
 * Premium Input Component: Neural Edition
 * Now featuring the 'tiny eye' toggle for password visibility.
 */
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export function Input({
    label,
    error,
    type,
    className = '',
    ...props
}: InputProps) {
    const [showPassword, setShowPassword] = useState(false);
    
    // Check if this is a password field
    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
        <div className="w-full space-y-2 group">
            {label && (
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 transition-colors group-focus-within:text-white">
                    {label}
                </label>
            )}
            <div className="relative">
                <input
                    type={inputType}
                    className={`
                        w-full px-5 py-3.5 bg-white/[0.03] border border-white/10 rounded-2xl
                        text-white placeholder-white/20 text-sm font-medium
                        transition-all duration-300
                        hover:bg-white/[0.05] hover:border-white/20
                        focus:outline-none focus:border-violet-500/50 focus:bg-white/[0.06] focus:ring-4 focus:ring-violet-500/10
                        ${error ? 'border-red-500/50 text-red-200 bg-red-500/5' : ''}
                        ${className}
                    `}
                    {...props}
                />
                
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-500 hover:text-white transition-all hover:scale-110 active:scale-90"
                        title={showPassword ? "Hide password" : "Show password"}
                    >
                        {showPassword ? (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                            </svg>
                        ) : (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        )}
                    </button>
                )}
            </div>
            {error && (
                <p className="text-[10px] font-bold text-red-400 mt-1 pl-1">
                    {error}
                </p>
            )}
        </div>
    );
}

export default Input;
