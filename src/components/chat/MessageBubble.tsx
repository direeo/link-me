'use client';

import React from 'react';
import { ChatMessage } from '@/types';
import { TutorialCard } from './TutorialCard';
import LearningPath from './LearningPath';

interface MessageBubbleProps {
    message: ChatMessage;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
    const isAssistant = message.role === 'assistant';

    if (message.isLoading) {
        return <LoadingIndicator />;
    }

    return (
        <div className={`flex w-full mb-12 ${isAssistant ? 'justify-start' : 'justify-end'} animate-in fade-in duration-500`}>
            <div 
                className={`
                    flex flex-col max-w-[95%] sm:max-w-[85%] 
                    ${isAssistant ? 'items-start' : 'items-end'}
                `}
            >
                {/* Clean Role Identity Area */}
                <div className="flex items-center gap-3 mb-3 px-1">
                    {isAssistant && (
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                            <span className="text-[10px] text-white">🔗</span>
                        </div>
                    )}
                    <div className="flex flex-col">
                        <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isAssistant ? 'text-white' : 'text-slate-500'}`}>
                            {isAssistant ? 'LinkMe AI' : 'USER OPERATOR'}
                        </span>
                        {isAssistant && <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Learning Architect</span>}
                    </div>
                </div>

                {/* Glow Bubble (High-Fidelity) */}
                <div 
                    className={`
                        p-7 rounded-[2rem] relative text-sm sm:text-base leading-relaxed whitespace-pre-wrap transition-all
                        ${isAssistant 
                            ? 'glass-panel border-white/5 text-[#fafafa] shadow-[0_20px_50px_-10px_rgba(0,0,0,0.5)]' 
                            : 'bg-white text-black font-bold shadow-xl'
                        }
                    `}
                >
                    {isAssistant && (
                        <div className="absolute top-6 right-6 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-[8px] font-black text-violet-400 uppercase tracking-widest">
                            Curated Path
                        </div>
                    )}
                    
                    <div className={isAssistant ? 'mt-2' : ''}>
                        {message.content}
                    </div>

                    <div className={`mt-5 text-[9px] font-black tracking-[0.2em] ${isAssistant ? 'text-slate-700' : 'text-black/30'}`}>
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                </div>

                {/* Learning Path Architecture */}
                {message.learningPath && (
                    <div className="mt-12 w-full animate-in slide-in-from-bottom-4 duration-700">
                        <div className="flex items-center gap-4 mb-8">
                             <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Neural Mastery Node</h3>
                             <div className="h-px flex-1 bg-white/5" />
                        </div>
                        <div className="glass-panel border-white/5 rounded-[2.5rem] p-4">
                            <LearningPath learningPath={message.learningPath} savedPathId={message.savedPathId} />
                        </div>
                    </div>
                )}

                {/* Resources Matrix */}
                {message.tutorials && message.tutorials.length > 0 && (
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                        {message.tutorials.map((tutorial) => (
                            <TutorialCard key={tutorial.videoId} tutorial={tutorial} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function LoadingIndicator() {
    return (
        <div className="flex w-full mb-12 justify-start animate-in fade-in duration-300">
            <div className="flex flex-col items-start gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center animate-pulse">
                        <span className="text-[10px] text-white/30">🔗</span>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-700 animate-pulse">Synthesizing...</span>
                </div>
                <div className="glass-panel border-white/5 p-6 rounded-[2rem] flex items-center gap-4">
                    <div className="w-5 h-5 border-2 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
                    <span className="text-xs font-black uppercase tracking-widest text-slate-500">Initializing Neural Architecture</span>
                </div>
            </div>
        </div>
    );
}
