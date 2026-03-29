'use client';

import React, { useState, useEffect } from 'react';
import { ChatMessage } from '@/types';
import TutorialCard from './TutorialCard';
import LearningPath from './LearningPath';

/**
 * Premium Loading Indicator: Neural Midnight Edition
 * Features: Rotating status messages with smooth transitions and a tiered progress bar.
 */
function LoadingIndicator() {
    const [statusIndex, setStatusIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    
    const statuses = [
        { emoji: '🌌', text: 'Initializing Neural Architect...' },
        { emoji: '🔎', text: 'Scanning the Knowledge Web...' },
        { emoji: '🎯', text: 'Synthesizing Learning Objectives...' },
        { emoji: '🧠', text: 'Curating Premium Tutorials...' },
        { emoji: '🎨', text: 'Structuring your Mastery Path...' },
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setStatusIndex(prev => (prev + 1) % statuses.length);
        }, 3500);
        
        const progInterval = setInterval(() => {
            setProgress(prev => (prev < 95 ? prev + 1 : prev));
        }, 150);

        return () => {
            clearInterval(interval);
            clearInterval(progInterval);
        };
    }, [statuses.length]);

    const currentStatus = statuses[statusIndex];

    return (
        <div className="py-2 space-y-4">
            <div className="flex items-center gap-3">
                <div className="relative w-5 h-5">
                    <div className="absolute inset-0 border-2 border-violet-500/20 rounded-full" />
                    <div className="absolute inset-0 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-bold text-violet-400 tracking-wide animate-pulse">
                        {currentStatus.emoji} {currentStatus.text}
                    </span>
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">
                        Deep Analysis in Progress ({progress}%)
                    </span>
                </div>
            </div>
            
            <div className="h-1 w-full bg-slate-800/50 rounded-full overflow-hidden border border-white/5">
                <div 
                    className="h-full bg-gradient-to-r from-violet-600 to-indigo-500 transition-all duration-1000 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
}

interface MessageBubbleProps {
    message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
    const isUser = message.role === 'user';
    const isLoading = message.isLoading;

    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-8 group animate-in fade-in slide-in-from-bottom-4 duration-500`}>
            <div
                className={`
                    relative max-w-[90%] md:max-w-[80%] px-5 py-4 shadow-2xl transition-all duration-300
                    ${isUser
                        ? 'bg-slate-900/40 border border-white/5 text-slate-200 rounded-2xl rounded-tr-sm'
                        : 'glass-card rounded-2xl rounded-tl-sm premium-glow-violet'
                    }
                `}
            >
                {/* Assistant Branding */}
                {!isUser && !isLoading && (
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
                        <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20 border border-violet-400/30">
                                <span className="text-xs">🔗</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-black uppercase tracking-widest bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">LinkMe AI</span>
                                <span className="text-[10px] text-slate-500 font-medium">Learning Architect</span>
                            </div>
                        </div>
                        <div className="px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-[10px] font-bold text-violet-400 uppercase tracking-tighter">
                            Curated Path
                        </div>
                    </div>
                )}

                {/* Content Area */}
                <div className="relative z-10">
                    {isLoading ? (
                        <LoadingIndicator />
                    ) : (
                        <div className="space-y-4">
                            {/* Text Content */}
                            <div className="whitespace-pre-wrap text-sm md:text-base leading-relaxed font-body">
                                {message.learningPath && message.learningPath.stages?.length > 0
                                    ? message.content.split('\n\n🎓')[0]
                                    : message.content
                                }
                            </div>

                            {/* Feature Components */}
                            {message.learningPath && message.learningPath.stages?.length > 0 && (
                                <div className="mt-6">
                                    <LearningPath learningPath={message.learningPath} />
                                </div>
                            )}

                            {!message.learningPath && message.tutorials && message.tutorials.length > 0 && (
                                <div className="mt-6 grid gap-4">
                                    {message.tutorials.map((tutorial) => (
                                        <TutorialCard key={tutorial.id} tutorial={tutorial} />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Meta Information */}
                <div className={`flex items-center gap-2 mt-4 pt-2 border-t border-white/5 opacity-40 group-hover:opacity-100 transition-opacity`}>
                    <span className="text-[10px] font-medium tracking-tight text-slate-500">
                        {new Date(message.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </span>
                    {!isUser && !isLoading && (
                        <span className="text-[10px] font-bold text-violet-500 uppercase tracking-widest ml-auto cursor-default">
                            Verified AI Research
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

export default MessageBubble;
