'use client';

import React from 'react';

/**
 * High-Performance Button: Professional Minimalism Edition
 * Focus: No gradients, no blurs, just clean whitespace and sharp borders.
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
    inline-flex items-center justify-center font-semibold rounded-lg
    transition-all duration-150 cubic-bezier(0.4, 0, 0.2, 1)
    focus:outline-none focus:ring-1 focus:ring-white/20
    disabled:opacity-50 disabled:cursor-not-allowed
    active:scale-[0.98] select-none
  `;

    const variants = {
        primary: `
      bg-white text-black 
      hover:bg-slate-100 hover:shadow-sm
      border border-transparent
    `,
        glow: `
      bg-[#8b5cf6] text-white
      hover:brightness-110
      border border-white/5
    `,
        secondary: `
      bg-[#141414] border border-[#262626]
      hover:bg-[#1a1a1a] hover:border-[#333333]
      text-slate-200
    `,
        outline: `
      bg-transparent border border-[#262626]
      hover:border-white/20 hover:bg-white/5
      text-slate-400 hover:text-white
    `,
        ghost: `
      text-slate-400 hover:text-white
      hover:bg-white/5
    `,
    };

    const sizes = {
        sm: 'px-4 py-2 text-xs',
        md: 'px-5 py-2.5 text-sm',
        lg: 'px-6 py-3 text-base font-bold',
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
