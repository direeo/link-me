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
import SettingsModal from '@/components/settings/SettingsModal';
import { Button } from '@/components/ui/Button';

export default function ChatPage() {
    const router = useRouter();
    const { user, isLoading: authLoading, isGuest, logout } = useAuth();

    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [loadingStep, setLoadingStep] = useState(0);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // High-speed smooth scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
    }, [messages]);

    // Redirect unauthenticated (allow guests)
    useEffect(() => {
        if (!authLoading && !user && !isGuest) router.push('/login');
    }, [authLoading, user, isGuest, router]);

    // Session Initialization
    useEffect(() => {
        if (messages.length === 0) {
            setMessages([
                {
                    id: '1',
                    role: 'assistant',
                    content: `Welcome to LinkMe${user?.name ? `, ${user.name}` : ''}. 🔗
                    
I am your LinkMe learning assistant. Tell me what you'd like to learn today, and I'll create a structured course for you from the best YouTube tutorials.`,
                    timestamp: new Date(),
                },
            ]);
        }
    }, [user?.name, messages.length]);

    const sendMessage = async (content: string) => {
        if (isLoading) return;
        const userMessage: ChatMessage = { id: `user-${Date.now()}`, role: 'user', content, timestamp: new Date() };
        const loadingMessage: ChatMessage = { id: `loading-${Date.now()}`, role: 'assistant', content: '', timestamp: new Date(), isLoading: true };

        setMessages(prev => [...prev, userMessage, loadingMessage]);
        setIsLoading(true);

        try {
            // Loading step cycling
            const steps = [
                "Curating Your Mastery Path...",
                "Analyzing Top-Tier Content...",
                "Assembling Curriculum Nodes...",
                "Finalizing Neural Synthesis..."
            ];
            
            let currentStep = 0;
            const stepInterval = setInterval(() => {
                currentStep = (currentStep + 1) % steps.length;
                setLoadingStep(currentStep);
            }, 1800);

            const response = await fetch('/api/chat/message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: content, conversationId }),
            });
            
            clearInterval(stepInterval);
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Node Error');

            setMessages(prev => {
                const filtered = prev.filter(m => !m.isLoading);
                return [...filtered, {
                    id: `assistant-${Date.now()}`,
                    role: 'assistant',
                    content: data.response || 'Synthesis Error.',
                    timestamp: new Date(),
                    tutorials: data.tutorials,
                    learningPath: data.learningPath,
                }];
            });
            if (data.conversationId) setConversationId(data.conversationId);
        } catch (error) {
            setMessages(prev => [...prev.filter(m => !m.isLoading), { id: `err-${Date.now()}`, role: 'assistant', content: `⚠️ Failed to synthesize path.`, timestamp: new Date() }]);
        } finally {
            setIsLoading(false);
            setLoadingStep(0);
        }
    };

    const handleLogout = async () => {
        await logout();
        router.push('/');
    };

    if (authLoading) return <div className="h-screen bg-[#050508] flex items-center justify-center"><div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" /></div>;

    return (
        <div className="h-screen bg-[#050508] flex flex-col relative overflow-hidden font-sans selection:bg-violet-500/20">
            {/* --- Premium Navigation --- */}
            <header className="flex-shrink-0 z-[60] bg-[#050508]/60 border-b border-white/5 backdrop-blur-3xl">
                <div className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-8">
                        <Link href="/" className="flex items-center gap-3 transition-all hover:opacity-80 group">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20 group-hover:scale-105 transition-transform">
                                <span className="text-lg text-white">🔗</span>
                            </div>
                            <span className="text-xl font-black tracking-tighter text-white uppercase sm:block hidden">LinkMe</span>
                        </Link>
                        
                        <div className="h-4 w-px bg-white/10 hidden sm:block" />

                        <div className="flex items-center gap-3">
                            <Button variant="ghost" size="sm" onClick={() => { setConversationId(null); setMessages([{ id: '1', role: 'assistant', content: 'New session ready. What shall we master?', timestamp: new Date() }]); }} 
                                className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-white">
                                <span className="mr-2 opacity-50">+</span> New Session
                            </Button>
                            
                            {!isGuest && (
                                <Button variant="ghost" size="sm" onClick={() => setShowHistory(true)} 
                                    className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-white hidden md:flex">
                                    <span className="mr-2 opacity-50">🕒</span> History
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-5">
                        <div className="relative group flex items-center gap-3">
                            {/* Settings Icon (Final Visibility Fix) */}
                            <button 
                                onClick={() => setShowSettings(true)}
                                className="p-2.5 rounded-xl border border-white/5 bg-white/[0.03] hover:bg-white/10 text-white/80 hover:text-white transition-all hover:scale-110 active:scale-95 flex items-center justify-center z-10"
                                title="Workspace Settings"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            </button>

                            {/* User Menu Trigger (Targeted Fix) */}
                            <div className="flex items-center gap-2">
                                <div 
                                    className="p-1 pr-4 bg-white/[0.03] border border-white/10 rounded-full hover:bg-white/[0.06] transition-all cursor-pointer flex items-center gap-3 group"
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                >
                                    <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-sm font-black text-white shadow-lg shadow-violet-500/20">
                                        {isGuest ? 'G' : user?.name?.charAt(0).toUpperCase() || 'E'}
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 group-hover:text-white transition-colors hidden sm:block">
                                        {isGuest ? 'Guest User' : user?.name || user?.email}
                                    </span>
                                </div>
                                
                                {showUserMenu && (
                                    <div className="absolute top-14 right-0 min-w-[160px] glass-panel border border-white/10 rounded-2xl p-2 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
                                        <button 
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 text-red-400 text-[10px] font-black uppercase tracking-widest transition-all"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                                            Sign Out
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* --- Operational Workspace --- */}
            <main className="flex-1 overflow-hidden flex flex-col relative z-10">
                <div className="flex-1 overflow-y-auto px-4 py-12 md:px-12 no-scrollbar">
                    <div className="max-w-4xl mx-auto">
                        <div className="space-y-6">
                            {messages.map((message) => <MessageBubble key={message.id} message={message} />)}
                        </div>
                        <div ref={messagesEndRef} className="h-20" />
                    </div>
                </div>

                {/* --- Command Area (Lowered & Optimized) --- */}
                <div className="flex-shrink-0 p-6 md:p-8 border-t border-white/5 bg-[#050508]/80 backdrop-blur-2xl">
                    <div className="max-w-4xl mx-auto">
                        {isLoading && (
                            <div className="flex items-center gap-3 mb-4 px-4 py-2 rounded-full bg-violet-500/5 border border-violet-500/10 w-fit mx-auto animate-pulse">
                                <div className="w-2 h-2 rounded-full bg-violet-500 animate-ping" />
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-violet-300">
                                    {[
                                        "Curating Your Mastery Path...",
                                        "Analyzing Top-Tier Content...",
                                        "Assembling Curriculum Nodes...",
                                        "Finalizing Neural Synthesis..."
                                    ][loadingStep]}
                                </span>
                            </div>
                        )}
                        <ChatInput onSend={sendMessage} disabled={isLoading} />
                        <div className="text-center mt-4">
                             <span className="text-[9px] font-black uppercase tracking-[0.5em] text-white/5">Secure AI Neural Architecture • LinkMe Protocol v2.0</span>
                        </div>
                    </div>
                </div>
            </main>

            {/* Sidebar & Settings Modals */}
            <ChatHistorySidebar isOpen={showHistory} onClose={() => setShowHistory(false)} onSelectHistory={() => {}} />
            <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
        </div>
    );
}
