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
        <div className="w-full space-y-12 animate-in fade-in duration-500">
            {/* Professional Summary Header */}
            <div className="p-8 rounded-2xl bg-[#111111] border border-[#262626] relative overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
                    <div className="flex-1 space-y-4">
                        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-tight">
                            {learningPath.topic}
                        </h2>
                        <p className="text-slate-400 text-sm sm:text-base leading-relaxed line-clamp-2 md:line-clamp-none font-medium">
                            {learningPath.summary}
                        </p>
                    </div>

                    <div className="flex flex-col gap-2 min-w-[200px]">
                        <Button 
                            variant={savedPathId ? 'secondary' : 'glow'} 
                            onClick={saveLearningPath}
                            disabled={isSaving || savedPathId !== undefined}
                            className="w-full text-xs"
                        >
                            {savedPathId ? 'Saved' : 'Save Path'}
                        </Button>
                        
                        {savedPathId && !isGuest && (
                            <Button 
                                variant="outline" 
                                className="w-full text-xs text-[#ff0000] border-[#ff0000]/20 hover:bg-[#ff0000]/10"
                                onClick={youtubeConnected ? () => {} : () => window.location.href = '/settings'}
                            >
                                {youtubeConnected ? 'Sync YouTube' : 'Connect YouTube'}
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-10 mt-10 p-6 rounded-xl bg-black/40 border border-[#262626]">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Time</span>
                        <span className="text-sm font-bold text-white">{learningPath.estimatedTotalTime}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Resources</span>
                        <span className="text-sm font-bold text-white">{learningPath.totalVideos} Videos</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Progress</span>
                        <span className="text-sm font-bold text-slate-200">{progressPercent}%</span>
                    </div>
                </div>
            </div>

            {/* Content Curriculum */}
            <div className="relative pl-6 sm:pl-10 space-y-12">
                <div className="absolute left-[30px] sm:left-[38px] top-6 bottom-6 w-px bg-[#262626]" />

                {learningPath.stages.map((stage) => (
                    <div key={stage.stageNumber} className="relative">
                        
                        {/* Status Checkpoint */}
                        <div className="absolute -left-[14px] sm:-left-[14px] top-1">
                            <div className="w-8 h-8 rounded-lg bg-[#0a0a0a] border border-[#262626] flex items-center justify-center text-[11px] font-bold text-white">
                                {stage.stageNumber}
                            </div>
                        </div>

                        <div className="pl-12 sm:pl-16">
                            <div className="mb-6">
                                <h3 className="text-lg font-bold text-white tracking-tight mb-1 uppercase">
                                    {stage.stageName}
                                </h3>
                                <p className="text-sm text-slate-500 font-medium">
                                    {stage.description}
                                </p>
                            </div>

                            <div className="grid gap-3">
                                {stage.videos.map((video) => {
                                    const isExpanded = expandedVideos.has(video.videoId);
                                    const isWatched = watchedVideos.has(video.videoId);
                                    
                                    return (
                                        <div 
                                            key={video.videoId}
                                            className={`
                                                rounded-xl border transition-all duration-150 overflow-hidden
                                                ${isWatched ? 'bg-black/30 border-emerald-500/20' : 'bg-[#111111] border-[#262626] hover:border-[#333333]'}
                                            `}
                                        >
                                            <div 
                                                className="p-4 flex items-start gap-4 cursor-pointer"
                                                onClick={() => toggleVideoExpand(video.videoId)}
                                            >
                                                <button 
                                                    onClick={(e) => toggleWatched(video.videoId, e)}
                                                    className={`
                                                        w-4 h-4 rounded flex-shrink-0 flex items-center justify-center border transition-all mt-0.5
                                                        ${isWatched 
                                                            ? 'bg-emerald-500 border-emerald-500' 
                                                            : 'border-[#333333] hover:border-white/20'
                                                        }
                                                    `}
                                                >
                                                    {isWatched && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={5}><path d="M5 13l4 4L19 7" /></svg>}
                                                </button>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-4">
                                                        <h4 className={`text-sm font-semibold leading-relaxed transition-all ${isWatched ? 'text-slate-600' : 'text-slate-200'}`}>
                                                            {video.title}
                                                        </h4>
                                                    </div>

                                                    <div className="flex flex-wrap items-center gap-4 mt-3">
                                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{video.estimatedTime}</span>
                                                        <span className={`text-[10px] font-bold uppercase tracking-widest
                                                            ${video.difficulty === 'beginner' ? 'text-emerald-500' : 
                                                              video.difficulty === 'advanced' ? 'text-rose-500' : 
                                                              'text-amber-500'}
                                                        `}>
                                                            {video.difficulty}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {isExpanded && (
                                                <div className="px-4 pb-5 space-y-5 border-t border-[#262626] pt-5 animate-in slide-in-from-top-2 duration-200">
                                                    <div className="grid md:grid-cols-2 gap-8">
                                                        <div className="space-y-4">
                                                            <div className="space-y-2">
                                                                <h5 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">Concepts Covered</h5>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {video.conceptsCovered.map((c, i) => (
                                                                        <span key={i} className="text-[10px] font-bold px-2 py-1 bg-white/5 rounded text-slate-400">{c}</span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="p-4 rounded-lg bg-black/40 border border-[#262626]">
                                                            <h5 className="text-[10px] font-bold uppercase tracking-widest text-slate-600 mb-2">Rationale</h5>
                                                            <p className="text-[11px] text-slate-400 font-medium leading-relaxed italic">"{video.whyRecommended}"</p>
                                                        </div>
                                                    </div>
                                                    
                                                    <Button 
                                                        variant="primary" 
                                                        className="w-full py-4 text-xs font-bold"
                                                        onClick={() => window.open(`https://www.youtube.com/watch?v=${video.videoId}`, '_blank')}
                                                    >
                                                        Watch Video ↗
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

            {/* Achievement Matrix */}
            <div className="p-8 rounded-2xl bg-[#111111] border border-[#262626]">
                <h4 className="text-sm font-bold text-white uppercase tracking-[0.2em] mb-8">Learning Outcomes</h4>
                <div className="grid sm:grid-cols-2 gap-4">
                    {learningPath.completionGoals.map((goal, i) => (
                        <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-black/40 border border-[#262626]">
                            <span className="text-emerald-500 font-bold text-sm">✦</span>
                            <span className="text-[12px] font-medium text-slate-400 leading-relaxed">{goal}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
