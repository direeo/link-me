'use client';

// Main chat interface
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ChatMessage, YouTubeResult, LearningPath } from '@/types';
import MessageBubble from '@/components/chat/MessageBubble';
import ChatInput from '@/components/chat/ChatInput';
import GuestBanner from '@/components/chat/GuestBanner';
import ChatHistorySidebar from '@/components/chat/ChatHistorySidebar';

export default function ChatPage() {
    const router = useRouter();
    const { user, isLoading: authLoading, isGuest, isAuthenticated, logout } = useAuth();

    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [isResendingVerification, setIsResendingVerification] = useState(false);
    const [verificationMessage, setVerificationMessage] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Redirect if not authenticated and not guest
    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [authLoading, user, router]);

    // Add welcome message on mount
    useEffect(() => {
        if (messages.length === 0) {
            setMessages([
                {
                    id: '1',
                    role: 'assistant',
                    content: `👋 Hi${user?.name ? ` ${user.name}` : ''}! I'm LinkMe, your AI-powered learning path curator.

🎯 What makes me different? I don't just find videos – I create personalized structured learning paths with:

✨ AI-curated videos organized into progressive stages
📊 Quality scores and difficulty ratings
📋 Key concepts and learning outcomes for each video
💾 Save paths and track your progress
🎬 Export to YouTube playlist (connect in Settings!)

Try asking me:
• "I want to master React from scratch"
• "Create a learning path for Python machine learning"
• "Help me learn web development as a complete beginner"

What would you like to learn today?`,
                    timestamp: new Date(),
                },
            ]);
        }
    }, [user?.name, messages.length]);


    const sendMessage = async (content: string) => {
        if (isLoading) return;

        // Add user message
        const userMessage: ChatMessage = {
            id: `user-${Date.now()}`,
            role: 'user',
            content,
            timestamp: new Date(),
        };

        // Add loading message
        const loadingMessage: ChatMessage = {
            id: `loading-${Date.now()}`,
            role: 'assistant',
            content: '',
            timestamp: new Date(),
            isLoading: true,
        };

        setMessages(prev => [...prev, userMessage, loadingMessage]);
        setIsLoading(true);

        try {
            const response = await fetch('/api/chat/message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    message: content,
                    conversationId,
                }),
            });

            const data = await response.json();

            // Check if response was successful
            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Failed to send message');
            }

            // Remove loading message and add response
            setMessages(prev => {
                const filtered = prev.filter(m => !m.isLoading);
                const assistantMessage: ChatMessage = {
                    id: `assistant-${Date.now()}`,
                    role: 'assistant',
                    content: data.response || 'Sorry, I could not process your request.',
                    timestamp: new Date(),
                    tutorials: data.tutorials as YouTubeResult[] | undefined,
                    learningPath: data.learningPath as LearningPath | undefined,
                };
                return [...filtered, assistantMessage];
            });

            if (data.conversationId) {
                setConversationId(data.conversationId);
            }
        } catch (error) {
            console.error('Chat error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Something went wrong';
            // Remove loading message and add error
            setMessages(prev => {
                const filtered = prev.filter(m => !m.isLoading);
                return [
                    ...filtered,
                    {
                        id: `error-${Date.now()}`,
                        role: 'assistant',
                        content: `Sorry, ${errorMessage}. Please try again.`,
                        timestamp: new Date(),
                    },
                ];
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        router.push('/');
    };

    const startNewChat = () => {
        setConversationId(null);
        setMessages([
            {
                id: '1',
                role: 'assistant',
                content: `👋 Starting a new chat! What would you like to learn today?`,
                timestamp: new Date(),
            },
        ]);
    };

    if (authLoading) {
        return (
            <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-slate-300">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0f] flex flex-col">
            {/* Header */}
            <header className="flex-shrink-0 border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
                <div className="flex items-center justify-between px-4 py-3 md:px-6">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                                <span className="text-sm">🔗</span>
                            </div>
                            <span className="font-bold gradient-text hidden sm:block">LinkMe</span>
                        </Link>
                        <button
                            onClick={startNewChat}
                            className="flex items-center gap-2 px-2 sm:px-3 py-1.5 text-xs font-medium text-slate-300 border border-slate-700 rounded-lg hover:border-violet-500 hover:text-white transition-all"
                            title="New Chat"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            <span className="hidden sm:inline">New Chat</span>
                        </button>
                        {/* History button - only for logged-in users */}
                        {isAuthenticated && !isGuest && (
                            <button
                                onClick={() => setShowHistory(true)}
                                className="flex items-center gap-2 px-2 sm:px-3 py-1.5 text-xs font-medium text-slate-300 border border-slate-700 rounded-lg hover:border-violet-500 hover:text-white transition-all"
                                title="Chat History"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="hidden sm:inline">History</span>
                            </button>
                        )}
                    </div>


                    <div className="flex items-center gap-3">
                        {isAuthenticated && !user?.emailVerified && (
                            <button
                                onClick={async () => {
                                    if (isResendingVerification || !user?.email) return;
                                    setIsResendingVerification(true);
                                    setVerificationMessage(null);
                                    try {
                                        const response = await fetch('/api/verify/resend', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ email: user.email }),
                                        });
                                        const data = await response.json();
                                        setVerificationMessage(data.message || 'Verification email sent!');
                                    } catch {
                                        setVerificationMessage('Failed to send. Please try again.');
                                    } finally {
                                        setIsResendingVerification(false);
                                        setTimeout(() => setVerificationMessage(null), 5000);
                                    }
                                }}
                                disabled={isResendingVerification}
                                className="text-xs text-amber-400 hover:text-amber-300 hidden sm:flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                                title="Click to resend verification email"
                            >
                                {isResendingVerification ? (
                                    <>
                                        <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Sending...
                                    </>
                                ) : verificationMessage ? (
                                    <span className="text-green-400">{verificationMessage}</span>
                                ) : (
                                    <>⚠️ Click to verify email</>
                                )}
                            </button>
                        )}
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-lg">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 flex items-center justify-center text-xs font-bold">
                                {isGuest ? 'G' : user?.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <span className="text-sm text-slate-300 hidden sm:block">
                                {isGuest ? 'Guest' : user?.name || user?.email}
                            </span>
                        </div>
                        {/* Settings link - only for logged-in users */}
                        {isAuthenticated && !isGuest && (
                            <Link
                                href="/settings"
                                className="p-2 text-slate-400 hover:text-white transition-colors"
                                title="Settings"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </Link>
                        )}
                        <button
                            onClick={handleLogout}
                            className="p-2 text-slate-400 hover:text-white transition-colors"
                            title="Logout"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                        </button>
                    </div>
                </div>
            </header>

            {/* Main chat area */}
            <main className="flex-1 overflow-hidden flex flex-col">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8">
                    <div className="max-w-3xl mx-auto">
                        {/* Guest banner */}
                        {isGuest && <GuestBanner />}

                        {/* Message list */}
                        {messages.map((message) => (
                            <MessageBubble key={message.id} message={message} />
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Input area */}
                <div className="flex-shrink-0 border-t border-slate-800 bg-slate-900/50 backdrop-blur-sm p-4 md:p-6">
                    <div className="max-w-3xl mx-auto">
                        <ChatInput onSend={sendMessage} disabled={isLoading} />
                    </div>
                </div>
            </main>

            {/* Chat History Sidebar */}
            <ChatHistorySidebar
                isOpen={showHistory}
                onClose={() => setShowHistory(false)}
                onSelectHistory={(item) => {
                    setShowHistory(false);
                    // Add a message showing the selected history topic
                    setMessages(prev => [...prev, {
                        id: `history-${Date.now()}`,
                        role: 'assistant',
                        content: `📚 From your history: You previously searched for "${item.topic}" (${item.skillLevel || 'any level'}, ${item.goal || 'general'}).\n\nWould you like to search for this topic again, or try something new?`,
                        timestamp: new Date(),
                    }]);
                }}
            />
        </div>
    );
}

