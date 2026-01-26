'use client';

import React, { useState } from 'react';

// Types matching backend curriculum.ts
interface VideoAnalysis {
    videoId: string;
    title: string;
    qualityScore: number;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    conceptsCovered: string[];
    learningOutcomes: string[];
    prerequisites: string[];
    whyRecommended: string;
    estimatedTime: string;
    order: number;
}

interface LearningStage {
    stageName: string;
    stageNumber: number;
    description: string;
    videos: VideoAnalysis[];
}

interface LearningPathData {
    topic: string;
    userLevel: string;
    userGoal: string;
    totalVideos: number;
    estimatedTotalTime: string;
    stages: LearningStage[];
    completionGoals: string[];
    summary: string;
}

interface LearningPathProps {
    learningPath: LearningPathData;
}

export default function LearningPath({ learningPath }: LearningPathProps) {
    const [expandedVideos, setExpandedVideos] = useState<Set<string>>(new Set());
    const [watchedVideos, setWatchedVideos] = useState<Set<string>>(new Set());

    const toggleVideoExpand = (videoId: string) => {
        setExpandedVideos(prev => {
            const next = new Set(prev);
            if (next.has(videoId)) {
                next.delete(videoId);
            } else {
                next.add(videoId);
            }
            return next;
        });
    };

    const toggleWatched = (videoId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setWatchedVideos(prev => {
            const next = new Set(prev);
            if (next.has(videoId)) {
                next.delete(videoId);
            } else {
                next.add(videoId);
            }
            return next;
        });
    };

    const getDifficultyColor = (difficulty: string) => {
        const colors = {
            beginner: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
            intermediate: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
            advanced: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
        };
        return colors[difficulty as keyof typeof colors] || 'bg-slate-500/20 text-slate-400';
    };

    const getQualityStars = (score: number) => {
        const fullStars = Math.floor(score / 2);
        const hasHalf = score % 2 >= 1;
        const stars = [];

        for (let i = 0; i < fullStars; i++) {
            stars.push(<span key={i} className="text-amber-400">★</span>);
        }
        if (hasHalf) {
            stars.push(<span key="half" className="text-amber-400/50">★</span>);
        }
        return stars;
    };

    const progressPercent = learningPath.totalVideos > 0
        ? Math.round((watchedVideos.size / learningPath.totalVideos) * 100)
        : 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-violet-600/20 to-indigo-600/20 border border-violet-500/30 rounded-xl p-5">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    🎓 Your Personalized Learning Path
                </h3>
                <p className="text-slate-300 mt-2 text-sm">{learningPath.summary}</p>

                <div className="flex flex-wrap items-center gap-4 mt-4 text-sm">
                    <span className="text-slate-400">
                        📚 {learningPath.totalVideos} videos
                    </span>
                    <span className="text-slate-400">
                        ⏱️ {learningPath.estimatedTotalTime}
                    </span>
                    <span className="text-slate-400">
                        📊 {learningPath.stages.length} stages
                    </span>
                </div>

                {/* Progress bar */}
                <div className="mt-4">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                        <span>Progress</span>
                        <span>{progressPercent}% complete</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-500"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Stages */}
            {learningPath.stages.map((stage, stageIndex) => (
                <div key={stage.stageNumber} className="space-y-3">
                    {/* Stage Header */}
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-sm font-bold">
                            {stage.stageNumber}
                        </div>
                        <div>
                            <h4 className="font-semibold text-white">{stage.stageName}</h4>
                            <p className="text-xs text-slate-400">{stage.description}</p>
                        </div>
                    </div>

                    {/* Videos in Stage */}
                    <div className="ml-4 border-l-2 border-slate-700 pl-6 space-y-3">
                        {stage.videos.map((video, videoIndex) => {
                            const isExpanded = expandedVideos.has(video.videoId);
                            const isWatched = watchedVideos.has(video.videoId);

                            return (
                                <div
                                    key={video.videoId}
                                    className={`
                                        bg-slate-800/50 border rounded-lg overflow-hidden transition-all
                                        ${isWatched ? 'border-emerald-500/50 bg-emerald-900/10' : 'border-slate-700/50 hover:border-violet-500/50'}
                                    `}
                                >
                                    {/* Video Header */}
                                    <button
                                        onClick={() => toggleVideoExpand(video.videoId)}
                                        className="w-full p-4 text-left flex items-start gap-3"
                                    >
                                        {/* Checkbox */}
                                        <button
                                            onClick={(e) => toggleWatched(video.videoId, e)}
                                            className={`
                                                w-5 h-5 rounded flex-shrink-0 flex items-center justify-center border transition-colors
                                                ${isWatched
                                                    ? 'bg-emerald-500 border-emerald-500'
                                                    : 'border-slate-600 hover:border-violet-500'
                                                }
                                            `}
                                        >
                                            {isWatched && (
                                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </button>

                                        {/* Video Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <h5 className={`font-medium text-sm ${isWatched ? 'text-slate-400 line-through' : 'text-white'}`}>
                                                    {video.order}. {video.title}
                                                </h5>
                                                <svg
                                                    className={`w-4 h-4 text-slate-400 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`}
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-2 mt-2">
                                                <span className="text-xs text-slate-500">⏱️ {video.estimatedTime}</span>
                                                <span className={`text-xs px-2 py-0.5 rounded border ${getDifficultyColor(video.difficulty)}`}>
                                                    {video.difficulty}
                                                </span>
                                                <span className="text-xs text-slate-500">{getQualityStars(video.qualityScore)}</span>
                                            </div>
                                        </div>
                                    </button>

                                    {/* Expanded Details */}
                                    {isExpanded && (
                                        <div className="px-4 pb-4 space-y-3 border-t border-slate-700/50 pt-3">
                                            {/* Concepts */}
                                            <div>
                                                <h6 className="text-xs font-medium text-violet-400 mb-1">📚 Concepts Covered</h6>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {video.conceptsCovered.map((concept, i) => (
                                                        <span key={i} className="text-xs px-2 py-0.5 bg-slate-700/50 rounded text-slate-300">
                                                            {concept}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Learning Outcomes */}
                                            <div>
                                                <h6 className="text-xs font-medium text-emerald-400 mb-1">🎯 What You'll Learn</h6>
                                                <ul className="text-xs text-slate-400 space-y-1">
                                                    {video.learningOutcomes.map((outcome, i) => (
                                                        <li key={i} className="flex items-start gap-1.5">
                                                            <span className="text-emerald-400">•</span>
                                                            {outcome}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            {/* Why Recommended */}
                                            <div>
                                                <h6 className="text-xs font-medium text-amber-400 mb-1">💡 Why This Video</h6>
                                                <p className="text-xs text-slate-400">{video.whyRecommended}</p>
                                            </div>

                                            {/* Watch Button */}
                                            <a
                                                href={`https://www.youtube.com/watch?v=${video.videoId}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded transition-colors"
                                            >
                                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                                </svg>
                                                Watch on YouTube
                                            </a>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Stage connector */}
                    {stageIndex < learningPath.stages.length - 1 && (
                        <div className="flex justify-center py-2">
                            <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                            </svg>
                        </div>
                    )}
                </div>
            ))}

            {/* Completion Goals */}
            {learningPath.completionGoals.length > 0 && (
                <div className="bg-gradient-to-r from-emerald-600/20 to-teal-600/20 border border-emerald-500/30 rounded-xl p-5">
                    <h4 className="font-semibold text-white flex items-center gap-2 mb-3">
                        🏁 After Completing This Path
                    </h4>
                    <ul className="space-y-2">
                        {learningPath.completionGoals.map((goal, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                                <span className="text-emerald-400">✓</span>
                                {goal}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
