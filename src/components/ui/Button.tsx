'use client';

import React from 'react';

/**
 * High-Fidelity Button: Bento Edition
 * Matches the 'rounded-xl' gradient aesthetic seen on Vercel.
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
    inline-flex items-center justify-center font-bold uppercase tracking-[0.2em] rounded-xl
    transition-all duration-300 cubic-bezier(0.175, 0.885, 0.32, 1.275)
    focus:outline-none focus:ring-2 focus:ring-violet-500/50
    disabled:opacity-50 disabled:cursor-not-allowed
    active:scale-[0.95] select-none
  `;

    const variants = {
        primary: `
      bg-white text-black 
      hover:bg-slate-100 
      border border-transparent
      shadow-[0_10px_30px_-5px_rgba(255,255,255,0.2)]
    `,
        glow: `
      bg-gradient-to-br from-violet-600 to-indigo-600 text-white
      hover:shadow-[0_0_30px_rgba(139,92,246,0.4)]
      border border-white/10
      shadow-[0_10px_25px_-5px_rgba(139,92,246,0.3)]
    `,
        secondary: `
      bg-[#12121e] border border-white/5
      hover:bg-[#1a1a2e] hover:border-white/10
      text-white shadow-xl
    `,
        outline: `
      bg-transparent border border-white/10
      hover:border-white/20 hover:bg-white/5
      text-slate-200 hover:text-white
    `,
        ghost: `
      text-slate-400 hover:text-white
      hover:bg-white/5
    `,
    };

    const sizes = {
        sm: 'px-5 h-10 text-[9px]',
        md: 'px-8 h-12 text-xs',
        lg: 'px-10 h-14 text-sm',
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className} ${loading ? 'cursor-wait opacity-70' : ''}`}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                </div>
            ) : (
                children
            )}
        </button>
    );
}

export default Button;
