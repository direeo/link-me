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
        <div className={`flex w-full mb-8 ${isAssistant ? 'justify-start' : 'justify-end'} animate-in fade-in duration-300`}>
            <div 
                className={`
                    flex flex-col max-w-[90%] sm:max-w-[80%] 
                    ${isAssistant ? 'items-start' : 'items-end'}
                `}
            >
                {/* Clean Role Label */}
                <div className="flex items-center gap-2 mb-2 px-1">
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${isAssistant ? 'text-white' : 'text-slate-500'}`}>
                        {isAssistant ? 'AI OPERATOR' : 'YOU'}
                    </span>
                    <div className={`h-1 w-1 rounded-full ${isAssistant ? 'bg-white' : 'bg-slate-700'}`} />
                </div>

                {/* Message Body (Clean & Minimalist) */}
                <div 
                    className={`
                        p-5 rounded-xl relative text-sm sm:text-base leading-relaxed whitespace-pre-wrap
                        ${isAssistant 
                            ? 'bg-[#161616] border border-[#262626] text-[#ededed]' 
                            : 'bg-white text-black font-semibold'
                        }
                    `}
                >
                    {message.content}

                    {/* Minimal Meta Timestamp */}
                    <div className={`mt-3 text-[9px] font-bold tracking-widest ${isAssistant ? 'text-slate-600' : 'text-black/30'}`}>
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                </div>

                {/* Learning Path - Focus First */}
                {message.learningPath && (
                    <div className="mt-10 w-full">
                        <div className="flex items-center gap-4 mb-10">
                             <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-white">Mastery Architecture</h3>
                             <div className="h-px flex-1 bg-[#262626]" />
                        </div>
                        <LearningPath learningPath={message.learningPath} savedPathId={message.savedPathId} />
                    </div>
                )}

                {/* Resources Grid */}
                {message.tutorials && message.tutorials.length > 0 && (
                    <div className="mt-8 grid grid-cols-1 gap-4 w-full">
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
        <div className="flex w-full mb-8 justify-start animate-in fade-in duration-300">
            <div className="flex flex-col items-start">
                <div className="flex items-center gap-2 mb-2 px-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 animate-pulse">Synthesizing</span>
                    <div className="h-1 w-1 rounded-full bg-slate-700 animate-pulse" />
                </div>
                
                <div className="bg-[#161616] border border-[#262626] p-4 rounded-xl flex items-center gap-3">
                    <div className="w-4 h-4 border-2 border-white/5 border-t-white rounded-full animate-spin" />
                    <span className="text-xs font-bold text-slate-400">Architecting Mastery Node...</span>
                </div>
            </div>
        </div>
    );
}
