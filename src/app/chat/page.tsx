'use client';

// Main chat interface with premium Neural Midnight redesign
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ChatMessage, YouTubeResult, LearningPath as LearningPathType } from '@/types';
import MessageBubble from '@/components/chat/MessageBubble';
import ChatInput from '@/components/chat/ChatInput';
import GuestBanner from '@/components/chat/GuestBanner';
import ChatHistorySidebar from '@/components/chat/ChatHistorySidebar';
import { Button } from '@/components/ui/Button';

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
                    content: `Neural Architecture Initialized${user?.name ? `, ${user.name}` : ''}. 🔗🎓
                    
I am your AI learning architect. Describe any skill or specialized topic you wish to master, and I will synthesize a structured learning path from the world's most elite tutorial data.

**How I help you:**
✅ **Sequential Stages**: From foundational concepts to professional mastery.
✅ **Neural Curation**: Videos analyzed for quality, relevance, and level.
✅ **YouTube Ecosystem**: Sync your entirely path to your native workspace.

**Try asking me:**
• *"Master React from scratch for professional engineers"*
• *"Python for Quantitative Finance"*
• *"Fullstack Development Roadmap 2024"*

What shall we architect today?`,
                    timestamp: new Date(),
                },
            ]);
        }
    }, [user?.name, messages.length]);


    const sendMessage = async (content: string) => {
        if (isLoading) return;

        const userMessage: ChatMessage = {
            id: `user-${Date.now()}`,
            role: 'user',
            content,
            timestamp: new Date(),
        };

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
                body: JSON.stringify({ message: content, conversationId }),
            });

            const data = await response.json();
            if (!response.ok || !data.success) throw new Error(data.message || 'Transmission error');

            setMessages(prev => {
                const filtered = prev.filter(m => !m.isLoading);
                const assistantMessage: ChatMessage = {
                    id: `assistant-${Date.now()}`,
                    role: 'assistant',
                    content: data.response || 'System Error: Synthesis failed.',
                    timestamp: new Date(),
                    tutorials: data.tutorials as YouTubeResult[] | undefined,
                    learningPath: data.learningPath as LearningPathType | undefined,
                };
                return [...filtered, assistantMessage];
            });

            if (data.conversationId) setConversationId(data.conversationId);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            setMessages(prev => {
                const filtered = prev.filter(m => !m.isLoading);
                return [...filtered, {
                    id: `error-${Date.now()}`,
                    role: 'assistant',
                    content: `⚠️ System Error: ${errorMessage}. Please re-transmit.`,
                    timestamp: new Date(),
                }];
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
        setMessages([{
            id: '1',
            role: 'assistant',
            content: `👋 New Session Initialized. What specific skill are we architecting now?`,
            timestamp: new Date(),
        }]);
    };

    if (authLoading) {
        return (
            <div className="min-h-screen bg-[#050508] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin shadow-[0_0_15px_rgba(139,92,246,0.3)]" />
                    <span className="text-xs font-black uppercase tracking-[0.3em] text-violet-400 animate-pulse">Neural Booting...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen bg-[#050508] flex flex-col relative overflow-hidden selection:bg-violet-500/30">
            {/* Neural Background Orbs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="orb orb-purple top-[10%] -left-[10%] opacity-10" />
                <div className="orb orb-indigo bottom-[10%] -right-[10%] opacity-10" />
            </div>

            {/* --- Global Command Header --- */}
            <header className="flex-shrink-0 z-40 glass-panel border-b border-white/5 backdrop-blur-md">
                <div className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-6">
                        <Link href="/" className="flex items-center gap-3 hover:scale-105 transition-transform duration-300">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                                <span className="text-sm">🔗</span>
                            </div>
                            <span className="text-xl font-black tracking-tighter text-white uppercase hidden sm:block">LinkMe</span>
                        </Link>
                        
                        <div className="h-6 w-px bg-white/10 hidden sm:block" />

                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={startNewChat} className="text-[10px] uppercase tracking-widest font-bold">
                                <svg className="w-3 h-3 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                                New Session
                            </Button>
                            
                            {isAuthenticated && !isGuest && (
                                <Button variant="ghost" size="sm" onClick={() => setShowHistory(true)} className="text-[10px] uppercase tracking-widest font-bold hidden md:flex">
                                    <svg className="w-3 h-3 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    History
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Feedback Access */}
                        <a 
                            href="mailto:hello@linkme-ai.com?subject=LinkMe%20Feedback"
                            className="text-[10px] font-black uppercase tracking-widest text-violet-400 hover:text-white transition-colors hidden lg:block border-r border-white/5 pr-4 mr-2"
                        >
                            Provide Feedback
                        </a>

                        <div className="flex items-center gap-3 px-3 py-1.5 bg-white/5 border border-white/5 rounded-xl">
                            <div className="w-6 h-6 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 flex items-center justify-center text-[10px] font-black text-white">
                                {isGuest ? 'G' : user?.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <span className="text-xs font-bold text-slate-300 hidden sm:block">
                                {isGuest ? 'Guest Operator' : user?.name || user?.email}
                            </span>
                        </div>

                        <div className="flex items-center gap-1">
                            {isAuthenticated && !isGuest && (
                                <Link href="/settings" className="p-2 text-slate-400 hover:text-white transition-all hover:scale-110">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor font-bold"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                </Link>
                            )}
                            <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-rose-500 transition-all hover:scale-110">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor font-bold"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* --- Main Operational Area --- */}
            <main className="flex-1 overflow-hidden flex flex-col relative z-10">
                {/* Scrolling Message Workspace */}
                <div className="flex-1 overflow-y-auto px-4 py-8 md:px-12 no-scrollbar">
                    <div className="max-w-4xl mx-auto">
                        {isGuest && <GuestBanner />}
                        
                        {/* Dynamic Message Matrix */}
                        <div className="space-y-2">
                            {messages.map((message) => (
                                <MessageBubble key={message.id} message={message} />
                            ))}
                        </div>
                        <div ref={messagesEndRef} className="h-12" />
                    </div>
                </div>

                {/* --- Input Neural Matrix --- */}
                <div className="flex-shrink-0 p-6 md:p-10">
                    <div className="max-w-3xl mx-auto glass-panel p-2 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/5">
                        <ChatInput onSend={sendMessage} disabled={isLoading} />
                    </div>
                    <div className="text-center mt-4">
                         <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-600">Secure AI Neural Architecture • LinkMe Protocol v2.0</span>
                    </div>
                </div>
            </main>

            {/* Persistence Layer Sidebar */}
            <ChatHistorySidebar
                isOpen={showHistory}
                onClose={() => setShowHistory(false)}
                onSelectHistory={(item) => {
                    setShowHistory(false);
                    setMessages(prev => [...prev, {
                        id: `history-${Date.now()}`,
                        role: 'assistant',
                        content: `📚 Neural Retrieval: Accessing former architecture for "${item.topic}".`,
                        timestamp: new Date(),
                    }]);
                }}
            />
        </div>
    );
}
