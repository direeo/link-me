'use client';

import React, { useEffect, useState } from 'react';

interface ChatHistoryItem {
    id: string;
    topic: string;
    skillLevel?: string;
    goal?: string;
    tutorialCount?: number;
    timestamp: string;
}

interface ChatHistorySidebarProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectHistory?: (item: ChatHistoryItem) => void;
}

export default function ChatHistorySidebar({ isOpen, onClose, onSelectHistory }: ChatHistorySidebarProps) {
    const [history, setHistory] = useState<ChatHistoryItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            fetchHistory();
        }
    }, [isOpen]);

    const fetchHistory = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/chat/history', {
                credentials: 'include',
            });

            const data = await response.json();

            if (data.success) {
                setHistory(data.history || []);
            } else {
                setError(data.message || 'Failed to load history');
            }
        } catch (err) {
            setError('Could not load chat history');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return 'Today';
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            return `${diffDays} days ago`;
        } else {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
    };

    const getLevelBadge = (level?: string) => {
        if (!level) return null;
        const colors = {
            beginner: 'bg-emerald-500/20 text-emerald-400',
            intermediate: 'bg-amber-500/20 text-amber-400',
            advanced: 'bg-rose-500/20 text-rose-400',
        };
        return colors[level as keyof typeof colors] || 'bg-slate-500/20 text-slate-400';
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
                onClick={onClose}
            />

            {/* Sidebar */}
            <aside className={`
                fixed top-0 left-0 h-full w-full sm:w-80 bg-slate-900 border-r border-slate-800 z-50
                transform transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-800">
                    <h2 className="font-semibold text-white flex items-center gap-2">
                        <svg className="w-5 h-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Chat History
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* History List */}
                <div className="overflow-y-auto h-[calc(100%-64px)] p-3">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : error ? (
                        <div className="text-center py-12 px-4">
                            <p className="text-slate-400 text-sm">{error}</p>
                            <button
                                onClick={fetchHistory}
                                className="mt-3 text-sm text-violet-400 hover:text-violet-300"
                            >
                                Try again
                            </button>
                        </div>
                    ) : history.length === 0 ? (
                        <div className="text-center py-12 px-4">
                            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-slate-800 flex items-center justify-center">
                                <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </div>
                            <p className="text-slate-400 text-sm">No chat history yet</p>
                            <p className="text-slate-500 text-xs mt-1">Start a conversation to see it here</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {history.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => onSelectHistory?.(item)}
                                    className="w-full text-left p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-violet-500/50 transition-all group"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <h3 className="font-medium text-sm text-slate-200 group-hover:text-white line-clamp-1">
                                            {item.topic || 'Untitled conversation'}
                                        </h3>
                                        <span className="text-xs text-slate-500 whitespace-nowrap">
                                            {formatDate(item.timestamp)}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2 mt-2">
                                        {item.skillLevel && (
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${getLevelBadge(item.skillLevel)}`}>
                                                {item.skillLevel}
                                            </span>
                                        )}
                                        {item.goal && (
                                            <span className="text-xs text-slate-500">
                                                {item.goal}
                                            </span>
                                        )}
                                    </div>

                                    {item.tutorialCount && (
                                        <p className="text-xs text-slate-500 mt-2">
                                            📚 {item.tutorialCount} tutorials found
                                        </p>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </aside>
        </>
    );
}
