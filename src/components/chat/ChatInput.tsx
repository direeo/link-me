'use client';

// Chat input component with send button
// Uses uncontrolled input for better compatibility
import React, { useRef, useEffect, useState } from 'react';

interface ChatInputProps {
    onSend: (message: string) => void;
    disabled?: boolean;
    placeholder?: string;
}

export function ChatInput({
    onSend,
    disabled = false,
    placeholder = 'Ask me what you want to learn...',
}: ChatInputProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [hasContent, setHasContent] = useState(false);

    // Auto-resize textarea based on content
    const adjustHeight = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
            setHasContent(textarea.value.trim().length > 0);
        }
    };

    useEffect(() => {
        adjustHeight();
    }, []);

    const handleSend = () => {
        const textarea = textareaRef.current;
        if (!textarea || disabled) return;

        const message = textarea.value.trim();

        if (message) {
            onSend(message);
            textarea.value = '';
            setHasContent(false);
            adjustHeight();
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSend();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleInput = () => {
        adjustHeight();
    };

    return (
        <form onSubmit={handleSubmit} className="relative">
            <div className="flex items-end gap-3 bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-3 shadow-lg">
                <textarea
                    ref={textareaRef}
                    onInput={handleInput}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    disabled={disabled}
                    rows={1}
                    className="flex-1 bg-transparent text-white placeholder-slate-500 resize-none focus:outline-none text-sm md:text-base min-h-[24px] max-h-[150px]"
                />
                <button
                    type="submit"
                    disabled={!hasContent || disabled}
                    className={`
            p-3 rounded-xl transition-all duration-200
            ${hasContent && !disabled
                            ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-500/30 hover:shadow-xl hover:scale-105'
                            : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                        }
          `}
                >
                    <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                        />
                    </svg>
                </button>
            </div>
            <p className="text-xs text-slate-500 text-center mt-2">
                Press Enter to send, Shift+Enter for new line
            </p>
        </form>
    );
}

export default ChatInput;
