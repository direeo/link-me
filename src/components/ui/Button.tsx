'use client';

import React from 'react';

/**
 * High-Performance Button: Clean Modern Dark Edition
 * Focus: Snappy 150ms transitions and 1px sharp borders.
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
    inline-flex items-center justify-center font-semibold rounded-xl
    transition-all duration-150 ease-out 
    focus:outline-none focus:ring-2 focus:ring-violet-500/20
    disabled:opacity-50 disabled:cursor-not-allowed
    active:scale-[0.98] select-none
  `;

    const variants = {
        primary: `
      bg-white text-black 
      hover:bg-slate-100 hover:shadow-[0_4px_12px_rgba(255,255,255,0.1)]
      border border-white/10
    `,
        glow: `
      bg-gradient-to-br from-violet-600 to-indigo-600
      text-white shadow-lg shadow-violet-600/10
      hover:brightness-110 hover:shadow-violet-600/20
      border border-white/5
    `,
        secondary: `
      bg-[#1a1a23] border border-white/5
      hover:bg-[#23232f] hover:border-white/10
      text-slate-200
    `,
        outline: `
      bg-transparent border border-white/10
      hover:border-white/20 hover:bg-white/5
      text-slate-400 hover:text-white
    `,
        ghost: `
      text-slate-400 hover:text-white
      hover:bg-white/5
    `,
    };

    const sizes = {
        sm: 'px-4 py-2 text-xs font-bold uppercase tracking-wider',
        md: 'px-6 py-3 text-sm',
        lg: 'px-8 py-4 text-base',
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
                    <span>Processing...</span>
                </div>
            ) : (
                children
            )}
        </button>
    );
}

export default Button;
