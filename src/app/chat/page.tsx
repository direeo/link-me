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
 * Premium Chat Workspace: Clean Modern Dark Edition
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

    // Initial Synthesis Sequence
    useEffect(() => {
        if (messages.length === 0) {
            setMessages([
                {
                    id: '1',
                    role: 'assistant',
                    content: `Node Session Initialized${user?.name ? `, ${user.name}` : ''}. 🔗🎓
                    
I am your AI learning architect. Define your objective, and I will synthesize a high-performance learning path from the world's most elite tutorial data.

**Framework Parameters:**
✅ **Sequential Stages**: Structured for logical mastery.
✅ **Neural Discovery**: Resources analyzed for impact score.
✅ **Native Integration**: Sync your path to your YouTube nodes.

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
                    content: `⚠️ System Halt: Transmission Failure. Re-initialize requested.`,
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
            content: `👋 Node Re-initialized. Awaiting new learning objective.`,
            timestamp: new Date(),
        }]);
    };

    if (authLoading) {
        return (
            <div className="min-h-screen bg-[#0c0c12] flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="h-screen bg-[#0c0c12] flex flex-col relative overflow-hidden font-body selection:bg-violet-500/20">
            {/* Minimal Background Infrastructure */}
            <div className="neural-bg" />

            {/* --- Global Action Header --- */}
            <header className="flex-shrink-0 z-40 bg-[#0c0c12]/80 border-b border-white/5 backdrop-blur-md">
                <div className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-6">
                        <Link href="/" className="flex items-center gap-3 transition-transform duration-150 hover:scale-[1.02]">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-600/10">
                                <span className="text-sm font-black">🔗</span>
                            </div>
                            <span className="text-lg font-black tracking-tighter text-white uppercase hidden sm:block">LinkMe</span>
                        </Link>
                        
                        <div className="h-4 w-px bg-white/5 hidden sm:block" />

                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={startNewChat} className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white">
                                <svg className="w-3 h-3 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor font-bold"><path d="M12 4v16m8-8H4" strokeWidth={3} /></svg>
                                New Node
                            </Button>
                            
                            {!isGuest && (
                                <Button variant="ghost" size="sm" onClick={() => setShowHistory(true)} className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white hidden md:flex">
                                    <svg className="w-3 h-3 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor font-bold"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth={3} /></svg>
                                    Archive
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="px-3 py-1.5 bg-black/40 border border-white/5 rounded-xl flex items-center gap-3 transition-all hover:bg-black/60">
                            <div className="w-5 h-5 rounded-lg bg-white/10 flex items-center justify-center text-[10px] font-black text-slate-400">
                                {isGuest ? 'G' : user?.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 hidden sm:block">
                                {isGuest ? 'Sandbox Operator' : user?.name || user?.email}
                            </span>
                        </div>

                        <div className="flex items-center gap-1 border-l border-white/5 pl-2">
                             <button onClick={handleLogout} className="p-2 text-slate-700 hover:text-red-500 transition-all duration-150 hover:scale-110">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor font-bold"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" strokeWidth={2} /></svg>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* --- Operational Interface --- */}
            <main className="flex-1 overflow-hidden flex flex-col relative z-10">
                {/* Scrolling Node Matrix */}
                <div className="flex-1 overflow-y-auto px-4 py-10 md:px-12 no-scrollbar">
                    <div className="max-w-4xl mx-auto">
                        {isGuest && <GuestBanner />}
                        
                        {/* Recursive Message Array */}
                        <div className="space-y-4">
                            {messages.map((message) => (
                                <MessageBubble key={message.id} message={message} />
                            ))}
                        </div>
                        <div ref={messagesEndRef} className="h-10" />
                    </div>
                </div>

                {/* --- Input Command Node --- */}
                <div className="flex-shrink-0 p-6 md:p-10 border-t border-white/5 bg-[#0c0c12]">
                    <div className="max-w-3xl mx-auto">
                        <ChatInput onSend={sendMessage} disabled={isLoading} />
                        <div className="text-center mt-4">
                             <span className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-800">Verified AI Synthesis Protocol • v2.1 Alpha</span>
                        </div>
                    </div>
                </div>
            </main>

            {/* Archive Persistence Layer */}
            <ChatHistorySidebar
                isOpen={showHistory}
                onClose={() => setShowHistory(false)}
                onSelectHistory={(item) => {
                    setShowHistory(false);
                    setMessages(prev => [...prev, {
                        id: `arch-${Date.now()}`,
                        role: 'assistant',
                        content: `📚 Archival Recall: Re-synthesizing specifications for "${item.topic}".`,
                        timestamp: new Date(),
                    }]);
                }}
            />
        </div>
    );
}
