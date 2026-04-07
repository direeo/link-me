'use client';

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

/**
 * Professional Chat Workspace: Professional Minimalism Edition
 * Focus: High-performance scrolling, distraction-free architecture, and instant response.
 */
export default function ChatPage() {
    const router = useRouter();
    const { user, isLoading: authLoading, isGuest, logout } = useAuth();

    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // High-speed smooth scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
    }, [messages]);

    // Redirect guest or unauthenticated
    useEffect(() => {
        if (!authLoading && !user) router.push('/login');
    }, [authLoading, user, router]);

    // Session Initialization
    useEffect(() => {
        if (messages.length === 0) {
            setMessages([
                {
                    id: '1',
                    role: 'assistant',
                    content: `Welcome to LinkMe${user?.name ? `, ${user.name}` : ''}. 🔗
                    
I am your LinkMe learning assistant. Tell me what you'd like to learn today, and I'll create a structured course for you from the best YouTube tutorials.

What are we learning today?`,
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
            if (!response.ok || !data.success) throw new Error(data.message || 'Node Error');

            setMessages(prev => {
                const filtered = prev.filter(m => !m.isLoading);
                return [...filtered, {
                    id: `assistant-${Date.now()}`,
                    role: 'assistant',
                    content: data.response || 'Synthesis Error: Access Denied.',
                    timestamp: new Date(),
                    tutorials: data.tutorials as YouTubeResult[] | undefined,
                    learningPath: data.learningPath as LearningPathType | undefined,
                }];
            });

            if (data.conversationId) setConversationId(data.conversationId);
        } catch (error) {
            setMessages(prev => [
                ...prev.filter(m => !m.isLoading),
                {
                    id: `err-${Date.now()}`,
                    role: 'assistant',
                    content: `⚠️ Transmission Failure. Please try again.`,
                    timestamp: new Date(),
                }
            ]);
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
            content: `👋 New session initialized. What shall we master?`,
            timestamp: new Date(),
        }]);
    };

    if (authLoading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <div className="w-6 h-6 border border-white/20 border-t-white rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="h-screen bg-[#0a0a0a] flex flex-col relative overflow-hidden font-sans selection:bg-white/10">

            {/* --- Premium Navigation --- */}
            <header className="flex-shrink-0 z-40 bg-[#0a0a0a]/60 border-b border-white/5 backdrop-blur-xl">
                <div className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-6">
                        <Link href="/" className="flex items-center gap-3 transition-transform duration-150 hover:scale-[1.01]">
                            <div className="w-7 h-7 rounded bg-white flex items-center justify-center shadow-lg">
                                <span className="text-sm font-black text-black">🔗</span>
                            </div>
                            <span className="text-lg font-bold tracking-tight text-white uppercase hidden sm:block">LinkMe</span>
                        </Link>
                        
                        <div className="h-4 w-px bg-[#262626] hidden sm:block" />

                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={startNewChat} className="text-xs font-bold text-slate-500 hover:text-white uppercase tracking-widest">
                                New Session
                            </Button>
                            
                            {!isGuest && (
                                <Button variant="ghost" size="sm" onClick={() => setShowHistory(true)} className="text-xs font-bold text-slate-500 hover:text-white hidden md:flex">
                                    History
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="px-3 py-1 bg-[#111111] border border-[#262626] rounded-lg flex items-center gap-3">
                            <div className="w-5 h-5 rounded bg-white/5 flex items-center justify-center text-[10px] font-bold text-slate-400">
                                {isGuest ? 'G' : user?.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[#ededed] hidden sm:block">
                                {isGuest ? 'Guest Session' : user?.name || user?.email}
                            </span>
                        </div>

                        <div className="flex items-center gap-1 border-l border-[#262626] pl-2">
                             <Link href="/settings" className="p-2 text-slate-700 hover:text-white transition-all duration-150" title="Settings">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                             </Link>
                             <button onClick={handleLogout} className="p-2 text-slate-700 hover:text-white transition-all duration-150" title="Logout">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor font-bold"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" strokeWidth={2} /></svg>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* --- Operational Interface --- */}
            <main className="flex-1 overflow-hidden flex flex-col relative z-10">
                <div className="flex-1 overflow-y-auto px-4 py-10 md:px-12 no-scrollbar">
                    <div className="max-w-4xl mx-auto">
                        {isGuest && <GuestBanner />}
                        
                        <div className="space-y-4">
                            {messages.map((message) => (
                                <MessageBubble key={message.id} message={message} />
                            ))}
                        </div>
                        <div ref={messagesEndRef} className="h-10" />
                    </div>
                </div>

                {/* --- Input Command Area --- */}
                <div className="flex-shrink-0 p-6 md:p-10 border-t border-white/5 bg-[#0a0a0a]/80 backdrop-blur-lg">
                    <div className="max-w-3xl mx-auto">
                        <ChatInput onSend={sendMessage} disabled={isLoading} />
                        <div className="text-center mt-4">
                             <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-800 animate-pulse">Assistant Ready</span>
                        </div>
                    </div>
                </div>
            </main>

            {/* Archive Persistence Layer */}
            <ChatHistorySidebar
                isOpen={showHistory}
                onClose={() => setShowHistory(false)}
                onSelectHistory={async (item) => {
                    setShowHistory(false);
                    setIsLoading(true);
                    
                    try {
                        const response = await fetch(`/api/chat/history/${item.id}`, { credentials: 'include' });
                        const result = await response.json();
                        
                        if (result.success && result.data) {
                            const { topic, learningPath, tutorials, query } = result.data;
                            setConversationId(item.id);
                            setMessages([
                                {
                                    id: `arch-init-${Date.now()}`,
                                    role: 'assistant',
                                    content: `📚 Recalling archived mastery path for "${topic || item.topic}".`,
                                    timestamp: new Date(),
                                    learningPath,
                                    tutorials
                                }
                            ]);
                        } else {
                            throw new Error(result.message || 'Failure to recall history node');
                        }
                    } catch (error) {
                         setMessages(prev => [...prev, {
                             id: `err-arch-${Date.now()}`,
                             role: 'assistant',
                             content: `⚠️ Failed to restore archived history node.`,
                             timestamp: new Date(),
                         }]);
                    } finally {
                        setIsLoading(false);
                    }
                }}
            />
        </div>
    );
}
