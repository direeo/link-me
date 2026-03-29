'use client';

// Premium Tutorial Card: Neural Midnight Edition
import React from 'react';
import { YouTubeResult } from '@/types';

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
            <div className="glass-card rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-[0_20px_50px_rgba(139,92,246,0.15)] bg-white/5 border border-white/5">
                <div className="flex flex-col sm:flex-row h-full">
                    {/* Thumbnail Architecture */}
                    <div className="relative w-full sm:w-48 lg:w-56 aspect-video sm:aspect-square flex-shrink-0 overflow-hidden">
                        <img
                            src={tutorial.thumbnail}
                            alt={tutorial.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                        
                        {/* Status Overlays */}
                        <div className="absolute bottom-3 left-3 flex items-center gap-2">
                            {tutorial.duration && (
                                <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-black px-2 py-1 rounded-md border border-white/10 uppercase tracking-tighter">
                                    {tutorial.duration}
                                </span>
                            )}
                        </div>
                        
                        {/* Play Orb */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity duration-300">
                             <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center shadow-2xl shadow-red-600/50 scale-75 group-hover/card:scale-100 transition-transform duration-500">
                                <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[12px] border-l-white border-b-[8px] border-b-transparent ml-1" />
                             </div>
                        </div>
                    </div>

                    {/* Content Intelligence */}
                    <div className="p-5 flex flex-col justify-between flex-1 min-w-0">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between gap-4">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-400 truncate">
                                    {tutorial.channelTitle}
                                </span>
                                <span className="text-[10px] font-bold text-slate-500 whitespace-nowrap">
                                    {formatDate(tutorial.publishedAt)}
                                </span>
                            </div>
                            
                            <h3 className="font-bold text-white text-sm sm:text-base leading-snug line-clamp-2 group-hover/card:text-violet-300 transition-colors">
                                {tutorial.title}
                            </h3>
                            
                            <p className="text-xs text-slate-500 line-clamp-2 font-medium leading-relaxed">
                                {tutorial.description}
                            </p>
                        </div>

                        {/* Resource Meta */}
                        <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                {tutorial.viewCount && (
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-1 h-1 rounded-full bg-slate-700" />
                                        <span className="text-[10px] font-bold text-slate-500">{tutorial.viewCount} views</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-1.5 text-violet-500/80">
                                    <div className="w-1 h-1 rounded-full bg-violet-500" />
                                    <span className="text-[10px] font-black uppercase tracking-widest group-hover/card:text-violet-400 transition-colors">Neural Pick</span>
                                </div>
                            </div>
                            
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-700 group-hover/card:text-slate-400 transition-colors">
                                Visit Source ↗
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </a>
    );
}

export default TutorialCard;
