'use client';

import React from 'react';
import { YouTubeResult } from '@/types';

/**
 * High-Performance Tutorial Card: Professional Minimalism Edition
 * Focus: No gradients, no blurs, just clean whitespace and sharp 1px borders.
 */
interface TutorialCardProps {
    tutorial: YouTubeResult;
}

export function TutorialCard({ tutorial }: TutorialCardProps) {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays < 7) return `${diffDays}d ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
        if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
        return `${Math.floor(diffDays / 365)}y ago`;
    };

    return (
        <a
            href={tutorial.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block group/card relative"
        >
            <div className="rounded-xl border border-[#262626] bg-[#111111] overflow-hidden transition-all duration-150 hover:bg-[#161616] hover:border-[#333333] shadow-sm">
                <div className="flex flex-col sm:flex-row h-full">
                    {/* Minimal Thumbnail */}
                    <div className="relative w-full sm:w-48 lg:w-56 aspect-video sm:aspect-square flex-shrink-0">
                        <img
                            src={tutorial.thumbnail}
                            alt={tutorial.title}
                            className="w-full h-full object-cover grayscale opacity-80 group-hover/card:grayscale-0 group-hover/card:opacity-100 transition-all duration-300"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/card:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg">
                                <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-black border-b-[6px] border-b-transparent ml-1" />
                            </div>
                        </div>
                    </div>

                    {/* Content Matrix */}
                    <div className="p-5 flex flex-col justify-between flex-1 min-w-0">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between gap-4">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 truncate">
                                    {tutorial.channelTitle}
                                </span>
                                <span className="text-[10px] font-bold text-slate-600 whitespace-nowrap">
                                    {formatDate(tutorial.publishedAt)}
                                </span>
                            </div>
                            
                            <h3 className="font-bold text-white text-sm sm:text-base leading-tight line-clamp-2 group-hover/card:text-slate-300 transition-colors">
                                {tutorial.title}
                            </h3>
                            
                            <p className="text-xs text-slate-500 line-clamp-2 font-medium leading-relaxed italic">
                                {tutorial.description}
                            </p>
                        </div>

                        {/* Performance Intelligence */}
                        <div className="mt-6 pt-4 border-t border-[#262626] flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                {tutorial.viewCount && (
                                    <span className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">{tutorial.viewCount} Views</span>
                                )}
                                <div className="flex items-center gap-1.5 text-slate-500">
                                    <span className="text-[10px] font-bold uppercase tracking-widest group-hover/card:text-white transition-colors">Resource Node</span>
                                </div>
                            </div>
                            
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[#8b5cf6] group-hover/card:text-white transition-colors">
                                Access ↗
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </a>
    );
}

export default TutorialCard;
