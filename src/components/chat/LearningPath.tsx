'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';

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
    savedPathId?: string;
}

export default function LearningPath({ learningPath, savedPathId: initialSavedPathId }: LearningPathProps) {
    const [expandedVideos, setExpandedVideos] = useState<Set<string>>(new Set());
    const [watchedVideos, setWatchedVideos] = useState<Set<string>>(new Set());
    const [savedPathId, setSavedPathId] = useState<string | undefined>(initialSavedPathId);
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState<string | null>(null);
    const [isGuest, setIsGuest] = useState(false);
    const [youtubeConnected, setYoutubeConnected] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [exportMessage, setExportMessage] = useState<string | null>(null);

    useEffect(() => {
        const checkStatus = async () => {
            try {
                const res = await fetch('/api/auth/me', { credentials: 'include' });
                const data = await res.json();
                setIsGuest(data.user?.isGuest === true || !data.success);
                if (data.success && !data.user?.isGuest) {
                    const ytRes = await fetch('/api/youtube/status', { credentials: 'include' });
                    const ytData = await ytRes.json();
                    setYoutubeConnected(ytData.connected || false);
                }
            } catch {
                setIsGuest(true);
            }
        };
        checkStatus();
    }, []);

    const toggleVideoExpand = (videoId: string) => {
        setExpandedVideos(prev => {
            const next = new Set(prev);
            if (next.has(videoId)) next.delete(videoId);
            else next.add(videoId);
            return next;
        });
    };

    const toggleWatched = async (videoId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const newWatched = !watchedVideos.has(videoId);
        setWatchedVideos(prev => {
            const next = new Set(prev);
            if (next.has(videoId)) next.delete(videoId);
            else next.add(videoId);
            return next;
        });

        if (savedPathId && !isGuest) {
            try {
                await fetch('/api/learning-path/progress', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ learningPathId: savedPathId, videoId, watched: newWatched }),
                });
            } catch (error) { console.error(error); }
        }
    };

    const saveLearningPath = async () => {
        if (isGuest) {
            setSaveMessage('Login to save');
            setTimeout(() => setSaveMessage(null), 3000);
            return;
        }
        setIsSaving(true);
        try {
            const res = await fetch('/api/learning-path/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ learningPath }),
            });
            const data = await res.json();
            if (data.success) {
                setSavedPathId(data.learningPathId);
                setSaveMessage('✅ Saved!');
            }
        } catch {
            setSaveMessage('Save failed');
        } finally {
            setIsSaving(false);
            setTimeout(() => setSaveMessage(null), 3000);
        }
    };

    const progressPercent = learningPath.totalVideos > 0
        ? Math.round((watchedVideos.size / learningPath.totalVideos) * 100)
        : 0;

    return (
        <div className="w-full space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header / Stats Panel */}
            <div className="p-6 md:p-8 rounded-3xl bg-[#1a1a23] border border-white/5 relative overflow-hidden group">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="max-w-xl">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-violet-400">Mastery Architecture Synthesized</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight mb-3 uppercase tracking-tighter">
                            {learningPath.topic}
                        </h2>
                        <p className="text-slate-400 text-sm leading-relaxed line-clamp-2 md:line-clamp-none italic font-medium">
                            "{learningPath.summary}"
                        </p>
                    </div>

                    <div className="flex flex-col gap-3 min-w-[200px]">
                        <Button 
                            variant={savedPathId ? 'secondary' : 'glow'} 
                            onClick={saveLearningPath}
                            disabled={isSaving || savedPathId !== undefined}
                            className="w-full font-black uppercase tracking-widest text-[10px]"
                        >
                            {savedPathId ? '✓ Architecture Stored' : 'Store Architecture'}
                        </Button>
                        
                        {savedPathId && !isGuest && (
                            <Button 
                                variant="primary" 
                                className="w-full bg-[#ff0000]/10 border border-[#ff0000]/20 text-[#ff0000] hover:bg-[#ff0000] hover:text-white font-black uppercase tracking-widest text-[10px]"
                                onClick={youtubeConnected ? () => {} : () => window.location.href = '/settings'}
                                loading={isExporting}
                            >
                                {youtubeConnected ? 'Sync to YouTube' : 'Sync YouTube Node'}
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-8 mt-10 p-6 rounded-2xl bg-black/40 border border-white/5">
                    <div className="flex flex-col">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Duration</span>
                        <span className="text-base font-black text-white">{learningPath.estimatedTotalTime}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Resources</span>
                        <span className="text-base font-black text-white">{learningPath.totalVideos} Nodes</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Efficiency</span>
                        <span className="text-base font-black text-violet-400">{progressPercent}%</span>
                    </div>
                </div>
            </div>

            {/* Performance Timeline */}
            <div className="relative pl-4 sm:pl-8 space-y-12">
                {/* Clean Timeline Line */}
                <div className="absolute left-[20px] sm:left-[36px] top-4 bottom-4 w-px bg-white/5" />

                {learningPath.stages.map((stage, sIdx) => (
                    <div key={stage.stageNumber} className="relative">
                        
                        {/* Milestone Marker */}
                        <div className="absolute -left-[14px] sm:-left-[14px] top-0 flex items-center justify-center">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#0c0c12] border border-white/10 flex items-center justify-center z-10 transition-colors group-hover:border-violet-500/50">
                                <span className="text-[10px] font-black text-violet-400">{stage.stageNumber}</span>
                            </div>
                        </div>

                        {/* Stage Details */}
                        <div className="pl-12 sm:pl-16">
                            <div className="mb-6">
                                <h3 className="text-base sm:text-lg font-black text-white tracking-widest uppercase mb-1">
                                    {stage.stageName}
                                </h3>
                                <p className="text-xs text-slate-500 max-w-2xl font-medium">
                                    {stage.description}
                                </p>
                            </div>

                            <div className="grid gap-3 sm:gap-4">
                                {stage.videos.map((video) => {
                                    const isExpanded = expandedVideos.has(video.videoId);
                                    const isWatched = watchedVideos.has(video.videoId);
                                    
                                    return (
                                        <div 
                                            key={video.videoId}
                                            className={`
                                                rounded-2xl border transition-all duration-150 overflow-hidden
                                                ${isWatched ? 'bg-black/40 border-emerald-500/30' : 'bg-[#1a1a23] border-white/5 hover:border-white/10'}
                                            `}
                                        >
                                            <div 
                                                className="p-4 flex items-start gap-4 cursor-pointer"
                                                onClick={() => toggleVideoExpand(video.videoId)}
                                            >
                                                {/* Specialized Status Check */}
                                                <button 
                                                    onClick={(e) => toggleWatched(video.videoId, e)}
                                                    className={`
                                                        w-5 h-5 rounded-md flex-shrink-0 flex items-center justify-center border-2 transition-all mt-0.5
                                                        ${isWatched 
                                                            ? 'bg-emerald-500 border-emerald-500' 
                                                            : 'border-white/10 hover:border-violet-500/50'
                                                        }
                                                    `}
                                                >
                                                    {isWatched && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={5}><path d="M5 13l4 4L19 7" /></svg>}
                                                </button>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-4">
                                                        <h4 className={`text-sm font-bold transition-all ${isWatched ? 'text-slate-600' : 'text-slate-200'}`}>
                                                            {video.title}
                                                        </h4>
                                                    </div>

                                                    <div className="flex flex-wrap items-center gap-3 mt-3">
                                                        <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-2 py-0.5 rounded-md bg-black/40 border border-white/5">⏳ {video.estimatedTime}</span>
                                                        <span className={`text-[10px] font-black uppercase tracking-widest
                                                            ${video.difficulty === 'beginner' ? 'text-emerald-500' : 
                                                              video.difficulty === 'advanced' ? 'text-rose-500' : 
                                                              'text-amber-500'}
                                                        `}>
                                                            {video.difficulty}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Resource Details Expansion */}
                                            {isExpanded && (
                                                <div className="px-4 pb-5 space-y-5 border-t border-white/5 pt-5 animate-in slide-in-from-top-2 duration-200">
                                                    <div className="grid md:grid-cols-2 gap-5">
                                                        <div className="space-y-4">
                                                            <div className="space-y-2">
                                                                <h5 className="text-[9px] font-black uppercase tracking-[0.2em] text-violet-400">Knowledge Tags</h5>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {video.conceptsCovered.map((c, i) => (
                                                                        <span key={i} className="text-[9px] font-bold px-2 py-1 bg-white/5 rounded-md text-slate-400">{c}</span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="p-4 rounded-xl bg-black/40 border border-white/5">
                                                            <h5 className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Internal Note</h5>
                                                            <p className="text-[11px] text-slate-400 font-medium leading-relaxed italic">"{video.whyRecommended}"</p>
                                                        </div>
                                                    </div>
                                                    
                                                    <Button 
                                                        variant="primary" 
                                                        className="w-full py-4 tracking-[0.2em] text-[10px] uppercase font-black"
                                                        onClick={() => window.open(`https://www.youtube.com/watch?v=${video.videoId}`, '_blank')}
                                                    >
                                                        Initialize Node Access ↗
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Achievement / Objectives Panel */}
            <div className="p-8 rounded-3xl bg-[#1a1a23] border border-white/5 relative overflow-hidden">
                <h4 className="text-sm font-black text-white uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                    <span className="text-emerald-500 text-lg">🏁</span> Objectives Unlocked
                </h4>
                <div className="grid sm:grid-cols-2 gap-3">
                    {learningPath.completionGoals.map((goal, i) => (
                        <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-black/40 border border-white/5">
                            <span className="text-emerald-500 font-black text-sm">✦</span>
                            <span className="text-[11px] font-bold text-slate-400 leading-relaxed">{goal}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
