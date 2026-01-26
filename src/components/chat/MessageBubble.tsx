'use client';

// Chat message bubble component
import React from 'react';
import { ChatMessage } from '@/types';
import TutorialCard from './TutorialCard';
import LearningPath from './LearningPath';

interface MessageBubbleProps {
    message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
    const isUser = message.role === 'user';
    const isLoading = message.isLoading;

    return (
        <div
            className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
        >
            <div
                className={`
          max-w-[85%] md:max-w-[75%]
          ${isUser
                        ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-2xl rounded-br-md'
                        : 'bg-slate-800/80 text-slate-100 rounded-2xl rounded-bl-md border border-slate-700/50'
                    }
          px-4 py-3 shadow-lg
        `}
            >
                {/* Avatar and name */}
                {!isUser && (
                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-700/50">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 flex items-center justify-center text-xs font-bold">
                            🔗
                        </div>
                        <span className="text-sm font-medium text-violet-400">LinkMe</span>
                    </div>
                )}

                {/* Loading state */}
                {isLoading ? (
                    <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                            <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                        <span className="text-slate-400 text-sm">Searching for tutorials...</span>
                    </div>
                ) : (
                    <>
                        {/* Message content - hide curriculum text if LearningPath component will show */}
                        <div className="whitespace-pre-wrap text-sm md:text-base leading-relaxed">
                            {message.learningPath && message.learningPath.stages?.length > 0
                                ? message.content.split('\n\n🎓')[0] // Only show text before curriculum
                                : message.content
                            }
                        </div>

                        {/* Learning Path (AI-curated curriculum) */}
                        {message.learningPath && message.learningPath.stages?.length > 0 && (
                            <div className="mt-4">
                                <LearningPath learningPath={message.learningPath} />
                            </div>
                        )}

                        {/* Tutorial cards (fallback when no learning path) */}
                        {!message.learningPath && message.tutorials && message.tutorials.length > 0 && (
                            <div className="mt-4 space-y-3">
                                {message.tutorials.map((tutorial) => (
                                    <TutorialCard key={tutorial.id} tutorial={tutorial} />
                                ))}
                            </div>
                        )}
                    </>
                )}


                {/* Timestamp */}
                <div
                    className={`
            text-xs mt-2 pt-1
            ${isUser ? 'text-violet-200/70' : 'text-slate-500'}
          `}
                >
                    {new Date(message.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                    })}
                </div>
            </div>
        </div>
    );
}

export default MessageBubble;
