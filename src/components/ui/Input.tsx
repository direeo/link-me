'use client';

// Input component with label and error handling
import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, helperText, className = '', type = 'text', ...props }, ref) => {
        const inputId = props.id || props.name || `input-${Math.random().toString(36).slice(2)}`;

        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={inputId}
                        className="block text-sm font-medium text-slate-300 mb-2"
                    >
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    id={inputId}
                    type={type}
                    className={`
            w-full px-4 py-3 rounded-xl
            bg-slate-800/50 border border-slate-700
            text-white placeholder-slate-500
            transition-all duration-200
            focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20
            hover:border-slate-600
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}
            ${className}
          `}
                    {...props}
                />
                {error && (
                    <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        {error}
                    </p>
                )}
                {helperText && !error && (
                    <p className="mt-2 text-sm text-slate-500">{helperText}</p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

export default Input;
