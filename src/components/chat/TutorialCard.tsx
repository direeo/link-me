'use client';

// Tutorial video card component
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

        if (diffDays < 7) {
            return `${diffDays} days ago`;
        } else if (diffDays < 30) {
            return `${Math.floor(diffDays / 7)} weeks ago`;
        } else if (diffDays < 365) {
            return `${Math.floor(diffDays / 30)} months ago`;
        } else {
            return `${Math.floor(diffDays / 365)} years ago`;
        }
    };

    return (
        <a
            href={tutorial.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block group"
        >
            <div className="bg-slate-900/80 rounded-xl overflow-hidden border border-slate-700/50 hover:border-violet-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/10 hover:scale-[1.02]">
                {/* Thumbnail */}
                <div className="relative aspect-video overflow-hidden">
                    <img
                        src={tutorial.thumbnail}
                        alt={tutorial.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {/* Duration badge */}
                    {tutorial.duration && (
                        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                            {tutorial.duration}
                        </div>
                    )}
                    {/* Play overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-14 h-14 rounded-full bg-red-600 flex items-center justify-center shadow-lg">
                            <svg
                                className="w-6 h-6 text-white ml-1"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path d="M8 5v14l11-7z" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-4">
                    {/* Title */}
                    <h3 className="font-semibold text-white text-sm line-clamp-2 group-hover:text-violet-300 transition-colors">
                        {tutorial.title}
                    </h3>

                    {/* Channel info */}
                    <div className="mt-2 flex items-center gap-2">
                        <span className="text-xs text-slate-400">{tutorial.channelTitle}</span>
                    </div>

                    {/* Stats */}
                    <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
                        {tutorial.viewCount && (
                            <span className="flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                {tutorial.viewCount}
                            </span>
                        )}
                        <span className="flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {formatDate(tutorial.publishedAt)}
                        </span>
                    </div>

                    {/* Description preview */}
                    <p className="mt-2 text-xs text-slate-400 line-clamp-2">
                        {tutorial.description}
                    </p>
                </div>
            </div>
        </a>
    );
}

export default TutorialCard;
