'use client';

import React from 'react';

/**
 * Premium Button Component: Neural Midnight Edition
 * Features: High-blur glassmorphism, spring physics, and animated glows.
 */
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'glow';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    children: React.ReactNode;
}

export function Button({
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled,
    className = '',
    children,
    ...props
}: ButtonProps) {
    const baseStyles = `
    inline-flex items-center justify-center font-bold rounded-xl
    transition-all duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500
    disabled:opacity-40 disabled:cursor-not-allowed disabled:grayscale
    active:scale-[0.96] select-none
  `;

    const variants = {
        primary: `
      bg-gradient-to-br from-violet-600 to-indigo-600
      hover:from-violet-500 hover:to-indigo-500
      text-white shadow-[0_8px_30px_rgb(139,92,246,0.3)]
      hover:shadow-[0_12px_40px_rgb(139,92,246,0.5)]
      border border-violet-400/20
    `,
        glow: `
      bg-white text-black
      hover:bg-violet-50 hover:shadow-[0_0_25px_rgba(139,92,246,0.6)]
      shadow-[0_0_15px_rgba(255,255,255,0.2)]
      border border-white/20
    `,
        secondary: `
      bg-slate-900 border border-slate-700/50 
      hover:bg-slate-800 hover:border-slate-600
      text-slate-200
    `,
        outline: `
      bg-transparent border-2 border-slate-800
      hover:border-violet-500/50 hover:bg-violet-500/5
      text-slate-400 hover:text-violet-400
    `,
        ghost: `
      text-slate-400 hover:text-white
      hover:bg-white/5
    `,
    };

    const sizes = {
        sm: 'px-4 py-2 text-xs uppercase tracking-wider',
        md: 'px-6 py-3 text-sm',
        lg: 'px-8 py-4 text-base',
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className} ${loading ? 'cursor-wait' : ''}`}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <div className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Processing...</span>
                </div>
            ) : (
                children
            )}
        </button>
    );
}

export default Button;
