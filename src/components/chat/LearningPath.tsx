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

    const exportToYouTube = async () => {
        if (!savedPathId) {
            setExportMessage('Please save the learning path first');
            setTimeout(() => setExportMessage(null), 3000);
            return;
        }
        setIsExporting(true);
        try {
            const res = await fetch('/api/youtube/playlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    learningPathId: savedPathId,
                    title: `LinkMe: ${learningPath.topic}`,
                }),
            });
            const data = await res.json();
            if (data.success) {
                setExportMessage(`✅ Playlist created!`);
                if (data.playlistUrl) window.open(data.playlistUrl, '_blank');
            }
        } catch {
            setExportMessage('Failed to export');
        } finally {
            setIsExporting(false);
            setTimeout(() => setExportMessage(null), 5000);
        }
    };

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
        <div className="w-full space-y-12 animate-in fade-in zoom-in-95 duration-700">
            {/* --- Premium Stats Banner --- */}
            <div className="glass-panel rounded-3xl p-6 sm:p-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/10 blur-[60px] rounded-full" />
                
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="max-w-xl">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="flex h-2 w-2 rounded-full bg-violet-500 animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-400">Mastery Framework Active</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight mb-3">
                            {learningPath.topic}
                        </h2>
                        <p className="text-slate-400 text-sm sm:text-base leading-relaxed line-clamp-2 md:line-clamp-none italic border-l-2 border-violet-500/30 pl-4">
                            "{learningPath.summary}"
                        </p>
                    </div>

                    <div className="flex flex-col gap-3 min-w-[200px]">
                        <Button 
                            variant={savedPathId ? 'outline' : 'glow'} 
                            onClick={saveLearningPath}
                            disabled={isSaving || savedPathId !== undefined}
                            className="w-full"
                        >
                            {savedPathId ? '✓ Path Archived' : 'Archive Path'}
                        </Button>
                        
                        {savedPathId && !isGuest && (
                            <Button 
                                variant="primary" 
                                className="w-full bg-red-600 hover:bg-red-700 shadow-red-500/20"
                                onClick={youtubeConnected ? exportToYouTube : () => window.location.href = '/settings'}
                                loading={isExporting}
                            >
                                {youtubeConnected ? 'Sync to YouTube' : 'Connect YouTube'}
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-white/5">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Efficiency</span>
                        <span className="text-lg font-black text-white">{learningPath.estimatedTotalTime}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Resources</span>
                        <span className="text-lg font-black text-white">{learningPath.totalVideos} Videos</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Completion</span>
                        <span className="text-lg font-black text-violet-400">{progressPercent}%</span>
                    </div>
                </div>

                <div className="mt-6 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-gradient-to-r from-violet-600 via-indigo-500 to-cyan-400 transition-all duration-1000 shadow-[0_0_15px_rgba(139,92,246,0.5)]"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
            </div>

            {/* --- Neural Timeline Architecture --- */}
            <div className="relative pl-4 sm:pl-8 space-y-16">
                {/* Vertical Timeline Line */}
                <div className="absolute left-[23px] sm:left-[39px] top-4 bottom-4 w-px bg-gradient-to-b from-violet-500/50 via-indigo-500/20 to-transparent" />

                {learningPath.stages.map((stage, sIdx) => (
                    <div key={stage.stageNumber} className="relative animate-in fade-in slide-in-from-left-4 duration-700" style={{ animationDelay: `${sIdx * 150}ms` }}>
                        
                        {/* Milestone Orb */}
                        <div className="absolute -left-[14px] sm:-left-[14px] top-0 flex items-center justify-center">
                            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-[#050508] border-2 border-violet-500/40 flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.2)] z-10 group-hover:border-violet-400 transition-colors">
                                <span className="text-xs sm:text-sm font-black text-violet-400">{stage.stageNumber}</span>
                            </div>
                            <div className="absolute inset-0 w-9 h-9 sm:w-11 sm:h-11 bg-violet-600/20 blur-lg rounded-full" />
                        </div>

                        {/* Stage Content */}
                        <div className="pl-12 sm:pl-16">
                            <div className="mb-8">
                                <h3 className="text-lg sm:text-xl font-black text-white tracking-tight mb-2 uppercase">
                                    {stage.stageName}
                                </h3>
                                <p className="text-sm text-slate-500 max-w-2xl leading-relaxed">
                                    {stage.description}
                                </p>
                            </div>

                            <div className="grid gap-4 sm:gap-6">
                                {stage.videos.map((video, vIdx) => {
                                    const isExpanded = expandedVideos.has(video.videoId);
                                    const isWatched = watchedVideos.has(video.videoId);
                                    
                                    return (
                                        <div 
                                            key={video.videoId}
                                            className={`
                                                glass-card rounded-2xl overflow-hidden group/v transition-all duration-500
                                                ${isWatched ? 'border-emerald-500/30' : 'hover:border-white/20'}
                                            `}
                                        >
                                            <div 
                                                className="p-4 sm:p-5 flex items-start gap-4 cursor-pointer"
                                                onClick={() => toggleVideoExpand(video.videoId)}
                                            >
                                                {/* Specialized Checkbox */}
                                                <button 
                                                    onClick={(e) => toggleWatched(video.videoId, e)}
                                                    className={`
                                                        w-6 h-6 rounded-lg flex-shrink-0 flex items-center justify-center border-2 transition-all mt-1
                                                        ${isWatched 
                                                            ? 'bg-emerald-500 border-emerald-500 shadow-lg shadow-emerald-500/40' 
                                                            : 'border-white/10 group-hover/v:border-violet-500/50'
                                                        }
                                                    `}
                                                >
                                                    {isWatched && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path d="M5 13l4 4L19 7" /></svg>}
                                                </button>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-4">
                                                        <h4 className={`text-sm sm:text-base font-bold transition-all ${isWatched ? 'text-slate-600' : 'text-slate-200'}`}>
                                                            {video.title}
                                                        </h4>
                                                        <div className={`w-2 h-2 rounded-full mt-2 transition-colors ${isWatched ? 'bg-emerald-500' : 'bg-slate-800'}`} />
                                                    </div>

                                                    <div className="flex flex-wrap items-center gap-4 mt-3">
                                                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-[10px] font-bold text-slate-400">
                                                            <span>⏳ {video.estimatedTime}</span>
                                                        </div>
                                                        <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[10px] font-bold uppercase tracking-wider
                                                            ${video.difficulty === 'beginner' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 
                                                              video.difficulty === 'advanced' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 
                                                              'bg-amber-500/10 border-amber-500/20 text-amber-400'}
                                                        `}>
                                                            {video.difficulty}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Advanced Video Intel - Expanded Area */}
                                            {isExpanded && (
                                                <div className="px-5 pb-6 space-y-6 border-t border-white/5 pt-6 animate-in slide-in-from-top-4 duration-300">
                                                    <div className="grid md:grid-cols-2 gap-6">
                                                        <div className="space-y-4">
                                                            <div className="space-y-2">
                                                                <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-400">Core Concepts</h5>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {video.conceptsCovered.map((c, i) => (
                                                                        <span key={i} className="text-[10px] font-bold px-2 py-1 bg-violet-500/10 rounded-md text-violet-300 border border-violet-500/10">{c}</span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                            <div className="space-y-2">
                                                                <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">Learning Outcome</h5>
                                                                <p className="text-xs text-slate-400 leading-relaxed font-medium italic">"{video.learningOutcomes[0] || 'Mastery of specialized concepts.'}"</p>
                                                            </div>
                                                        </div>
                                                        <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
                                                            <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500 mb-3">Architect's Note</h5>
                                                            <p className="text-xs text-slate-400 leading-relaxed">{video.whyRecommended}</p>
                                                        </div>
                                                    </div>
                                                    
                                                    <a 
                                                        href={`https://www.youtube.com/watch?v=${video.videoId}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center justify-center gap-3 w-full py-4 bg-white text-black font-black uppercase tracking-[0.2em] text-xs rounded-xl hover:bg-violet-500 hover:text-white transition-all shadow-[0_10px_30px_rgba(255,255,255,0.1)] hover:shadow-violet-500/30"
                                                    >
                                                        Launch Resource on YouTube
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                                    </a>
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

            {/* --- Completion Goals (Final Boss) --- */}
            {learningPath.completionGoals.length > 0 && (
                <div className="glass-panel rounded-3xl p-8 border-emerald-500/20 bg-emerald-500/5 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-500/10 blur-[60px] rounded-full" />
                    <h4 className="text-lg font-black text-white uppercase tracking-widest mb-6 flex items-center gap-3">
                        <span className="text-emerald-500 text-2xl">🏆</span> Mastery Roadmap Completed
                    </h4>
                    <div className="grid sm:grid-cols-2 gap-4">
                        {learningPath.completionGoals.map((goal, i) => (
                            <div key={i} className="flex items-start gap-3 p-4 rounded-2xl bg-black/40 border border-white/5 transition-hover hover:border-emerald-500/30">
                                <span className="text-emerald-500 flex-shrink-0">✦</span>
                                <span className="text-sm font-medium text-slate-300">{goal}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
