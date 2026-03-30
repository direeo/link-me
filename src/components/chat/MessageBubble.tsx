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
        <div className={`flex w-full mb-6 ${isAssistant ? 'justify-start' : 'justify-end'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
            <div 
                className={`
                    flex flex-col max-w-[85%] sm:max-w-[75%] 
                    ${isAssistant ? 'items-start' : 'items-end'}
                `}
            >
                {/* Branding / Role Label */}
                <div className="flex items-center gap-2 mb-2 px-1">
                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isAssistant ? 'text-violet-400' : 'text-slate-500'}`}>
                        {isAssistant ? 'Neural Intelligence' : 'Operator'}
                    </span>
                    <div className={`h-1 w-1 rounded-full ${isAssistant ? 'bg-violet-500' : 'bg-slate-700'}`} />
                </div>

                {/* Message Body */}
                <div 
                    className={`
                        p-5 rounded-2xl relative
                        ${isAssistant 
                            ? 'bg-[#1a1a23] border-l-2 border-violet-500/50 text-slate-200 border-t border-r border-b border-white/5' 
                            : 'bg-white text-black font-semibold'
                        }
                    `}
                >
                    <div className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap font-medium">
                        {message.content}
                    </div>

                    {/* Meta Timestamp */}
                    <div className={`mt-3 text-[9px] font-bold uppercase tracking-widest ${isAssistant ? 'text-slate-600' : 'text-black/40'}`}>
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • CRC Check Verified
                    </div>
                </div>

                {/* Learning Path - Integration Point */}
                {message.learningPath && (
                    <div className="mt-8 w-full">
                        <div className="flex items-center gap-3 mb-6">
                            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-violet-400">Mastery Architecture Synthesized</h3>
                            <div className="h-px flex-1 bg-gradient-to-r from-violet-500/30 to-transparent" />
                        </div>
                        <LearningPath learningPath={message.learningPath} />
                    </div>
                )}

                {/* Individual Resources Area */}
                {message.tutorials && message.tutorials.length > 0 && (
                    <div className="mt-6 grid grid-cols-1 gap-4 w-full">
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
    const statuses = [
        'Interrogating YouTube API...',
        'Synthesizing Neural Path...',
        'Quality Score Filtering...',
        'Finalizing Learning Nodes...'
    ];
    const [statusIdx, setStatusIdx] = React.useState(0);

    React.useEffect(() => {
        const interval = setInterval(() => {
            setStatusIdx((prev) => (prev + 1) % statuses.length);
        }, 1500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex w-full mb-6 justify-start animate-in fade-in duration-500">
            <div className="flex flex-col items-start max-w-[85%]">
                <div className="flex items-center gap-2 mb-2 px-1">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-400 animate-pulse">Request Transmitting</span>
                    <div className="h-1 w-1 rounded-full bg-violet-500 animate-pulse" />
                </div>
                
                <div className="bg-[#1a1a23] border-l-2 border-violet-500/30 p-5 rounded-2xl flex items-center gap-4 border-t border-r border-b border-white/5 min-w-[280px]">
                    <div className="w-4 h-4 border-2 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
                    <div className="flex flex-col">
                        <span className="text-xs font-black uppercase tracking-[0.2em] text-white">Synthesizing...</span>
                        <span className="text-[10px] font-bold text-slate-500 transition-all duration-500">{statuses[statusIdx]}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
