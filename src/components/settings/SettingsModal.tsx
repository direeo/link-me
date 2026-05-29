'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import YouTubeConnect from './YouTubeConnect';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
    const [activeTab, setActiveTab] = useState<'security' | 'notifications' | 'youtube'>('security');
    const [twoFASecret, setTwoFASecret] = useState<string | null>(null);
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [verificationCode, setVerificationCode] = useState('');
    const [is2FAEnabled, setIs2FAEnabled] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [isGuest, setIsGuest] = useState(false);

    // Notification preferences
    const [emailReminders, setEmailReminders] = useState(false);
    const [prefLoading, setPrefLoading] = useState(false);
    const [prefMessage, setPrefMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Per-path reminder state
    interface SavedPath { id: string; topic: string; totalVideos: number; watchedVideos: number; progress: number; reminderEnabled: boolean; }
    const [savedPaths, setSavedPaths] = useState<SavedPath[]>([]);
    const [pathsLoading, setPathsLoading] = useState(false);
    const [togglingPathId, setTogglingPathId] = useState<string | null>(null);

    // Initial check for 2FA status, guest mode, and preferences
    useEffect(() => {
        if (isOpen) {
            check2FAStatus();
            loadPreferences();
            loadSavedPaths();
        }
    }, [isOpen]);

    const check2FAStatus = async () => {
        try {
            const res = await fetch('/api/auth/me');
            const data = await res.json();
            if (data.success && data.user) {
                if (data.user.isGuest) {
                    setIsGuest(true);
                    onClose();
                    return;
                }
                setIs2FAEnabled(!!data.user.twoFactorEnabled);
            }
        } catch (err) {
            console.error('Failed to check 2FA status');
        }
    };

    const loadPreferences = async () => {
        try {
            const res = await fetch('/api/settings/preferences', { credentials: 'include' });
            const data = await res.json();
            if (data.success) {
                setEmailReminders(data.preferences.emailReminders ?? false);
            }
        } catch {
            // non-fatal — preferences default to false
        }
    };

    const loadSavedPaths = async () => {
        setPathsLoading(true);
        try {
            const res = await fetch('/api/learning-path/save', { credentials: 'include' });
            const data = await res.json();
            if (data.success) setSavedPaths(data.learningPaths ?? []);
        } catch {
            // non-fatal
        } finally {
            setPathsLoading(false);
        }
    };

    const togglePathReminder = async (pathId: string, enabled: boolean) => {
        setTogglingPathId(pathId);
        // Optimistic update
        setSavedPaths(prev => prev.map(p => p.id === pathId ? { ...p, reminderEnabled: enabled } : p));
        try {
            const res = await fetch(`/api/learning-path/${pathId}/reminder`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ reminderEnabled: enabled }),
            });
            const data = await res.json();
            if (!data.success) {
                // Revert on error
                setSavedPaths(prev => prev.map(p => p.id === pathId ? { ...p, reminderEnabled: !enabled } : p));
            }
        } catch {
            setSavedPaths(prev => prev.map(p => p.id === pathId ? { ...p, reminderEnabled: !enabled } : p));
        } finally {
            setTogglingPathId(null);
        }
    };

    const toggleEmailReminders = async (enabled: boolean) => {
        setPrefLoading(true);
        setPrefMessage(null);
        setEmailReminders(enabled); // optimistic update
        try {
            const res = await fetch('/api/settings/preferences', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ emailReminders: enabled }),
            });
            const data = await res.json();
            if (data.success) {
                setPrefMessage({ type: 'success', text: enabled ? 'Reminders enabled' : 'Reminders disabled' });
            } else {
                setEmailReminders(!enabled); // revert on error
                setPrefMessage({ type: 'error', text: data.message || 'Failed to update' });
            }
        } catch {
            setEmailReminders(!enabled);
            setPrefMessage({ type: 'error', text: 'Connection error' });
        } finally {
            setPrefLoading(false);
            setTimeout(() => setPrefMessage(null), 3000);
        }
    };

    const setup2FA = async () => {
        setIsLoading(true);
        setMessage(null);
        try {
            const res = await fetch('/api/auth/2fa/setup', { 
                method: 'GET',
                credentials: 'include',
            });
            const data = await res.json();
            if (data.success) {
                setTwoFASecret(data.secret);
                setQrCode(data.qrCode);
            } else {
                setMessage({ type: 'error', text: data.message || 'Setup failed' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Connection failure' });
        } finally {
            setIsLoading(false);
        }
    };

    const verifyAndEnable = async () => {
        if (!verificationCode || verificationCode.length < 6) return;
        
        setIsLoading(true);
        setMessage(null);
        
        try {
            const res = await fetch('/api/auth/2fa/setup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ code: verificationCode }),
            });
            
            const data = await res.json();
            
            if (data.success) {
                setIs2FAEnabled(true);
                setTwoFASecret(null);
                setQrCode(null);
                setVerificationCode('');
                setMessage({ type: 'success', text: '2FA Enabled Successfully' });
            } else {
                setMessage({ type: 'error', text: data.message || 'Verification failed' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Verification failure' });
        } finally {
            setIsLoading(false);
        }
    };

    const disable2FA = async () => {
        if (!confirm('Are you sure you want to disable 2FA? This reduces your account security.')) return;
        setIsLoading(true);
        try {
            const res = await fetch('/api/auth/2fa/disable', { method: 'POST' });
            if (res.ok) {
                setIs2FAEnabled(false);
                setMessage({ type: 'success', text: '2FA Disabled' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Disable failure' });
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
            
            <div className="relative w-full max-w-2xl bg-[#0a0a0b] border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between">
                    <h2 className="text-xl font-black text-white uppercase tracking-widest">Workspace Settings</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-slate-500 hover:text-white transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="flex h-[500px]">
                    {/* Sidebar */}
                    <div className="w-48 border-r border-white/5 p-4 flex flex-col gap-2">
                        <button
                            onClick={() => setActiveTab('security')}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'security' ? 'bg-violet-600 text-white' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                        >
                            Security
                        </button>
                        <button
                            onClick={() => setActiveTab('notifications')}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'notifications' ? 'bg-violet-600 text-white' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                        >
                            Notifications
                        </button>
                        <button
                            onClick={() => setActiveTab('youtube')}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'youtube' ? 'bg-red-600 text-white' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                        >
                            YouTube
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                        {activeTab === 'security' && (
                            <div className="space-y-8">
                                <div>
                                    <h3 className="text-lg font-black text-white mb-2 uppercase">Two-Factor Authentication</h3>
                                    <p className="text-sm text-slate-400 leading-relaxed font-medium">Add an extra layer of security to your LinkMe workspace using Google Authenticator.</p>
                                </div>

                                {is2FAEnabled ? (
                                    <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 flex flex-col items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                        </div>
                                        <div className="text-center">
                                            <p className="font-bold text-white mb-1">Two-Factor Authentication is ON</p>
                                            <p className="text-xs text-slate-500">Your account is fully secured with two-factor protection.</p>
                                        </div>
                                        <Button variant="outline" size="sm" onClick={disable2FA} disabled={isLoading}>
                                            {isLoading ? 'Processing...' : 'Disable 2FA'}
                                        </Button>
                                    </div>
                                ) : qrCode ? (
                                    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                                        <div className="flex flex-col items-center gap-4 p-6 bg-white rounded-2xl">
                                            <img src={qrCode} alt="QR Code" className="w-48 h-48" />
                                            <p className="text-[10px] font-black text-black uppercase tracking-widest">Scan with Google Authenticator</p>
                                        </div>
                                        
                                        <div className="space-y-3">
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Verify Auth Code</p>
                                            <div className="flex gap-3">
                                                <Input 
                                                    value={verificationCode}
                                                    onChange={(e) => setVerificationCode(e.target.value)}
                                                    placeholder="Enter 6-digit code"
                                                    className="flex-1"
                                                />
                                                <Button 
                                                    onClick={verifyAndEnable}
                                                    disabled={isLoading || verificationCode.length < 6}
                                                >
                                                    {isLoading ? 'Syncing...' : 'Verify & Enable'}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-10 border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center gap-6">
                                        <div className="w-16 h-16 rounded-2xl bg-violet-600/10 border border-violet-600/20 flex items-center justify-center">
                                            <svg className="w-7 h-7 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>
                                        </div>
                                        <div className="text-center">
                                            <p className="font-bold text-white mb-2">2FA is currently disabled</p>
                                            <p className="text-xs text-slate-500">Requires a mobile authenticator app.</p>
                                        </div>
                                        <Button variant="glow" onClick={setup2FA} disabled={isLoading}>
                                            {isLoading ? 'Initializing...' : 'Enable 2FA'}
                                        </Button>
                                    </div>
                                )}

                                {message && (
                                    <div className={`p-4 rounded-xl text-xs font-bold text-center ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                        {message.text}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'notifications' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-black text-white mb-2 uppercase">Email Notifications</h3>
                                    <p className="text-sm text-slate-400 leading-relaxed font-medium">
                                        Stay consistent. LinkMe sends you a daily nudge to keep your learning streak alive.
                                    </p>
                                </div>

                                {/* Global toggle */}
                                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/8">
                                    <div className="flex items-center justify-between gap-6">
                                        <div>
                                            <h4 className="text-sm font-bold text-white">Daily learning reminders</h4>
                                            <p className="text-xs text-slate-500 mt-0.5">One email per day at 9 AM — like Duolingo, but for dev skills.</p>
                                        </div>
                                        <button
                                            onClick={() => !prefLoading && toggleEmailReminders(!emailReminders)}
                                            disabled={prefLoading}
                                            aria-label="Toggle email reminders"
                                            className={`relative flex-shrink-0 w-12 h-6 rounded-full transition-all duration-200 focus:outline-none ${
                                                emailReminders ? 'bg-violet-600' : 'bg-white/10'
                                            } ${prefLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                        >
                                            <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${emailReminders ? 'translate-x-6' : 'translate-x-0'}`} />
                                        </button>
                                    </div>
                                </div>

                                {prefMessage && (
                                    <div className={`p-3 rounded-xl text-xs font-bold text-center ${
                                        prefMessage.type === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                                    }`}>
                                        {prefMessage.text}
                                    </div>
                                )}

                                {/* Per-path toggles — only shown when global reminders are ON */}
                                {emailReminders && (
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 px-1">Remind me about</p>

                                        {pathsLoading ? (
                                            <div className="flex items-center gap-2 px-1 py-3">
                                                <div className="w-4 h-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                                                <span className="text-xs text-slate-500">Loading your paths...</span>
                                            </div>
                                        ) : savedPaths.length === 0 ? (
                                            <div className="p-4 rounded-xl border border-white/5 text-xs text-slate-500 text-center">
                                                No saved paths yet — start a chat and save a learning path first.
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                {savedPaths.map(path => (
                                                    <div key={path.id} className="flex items-center justify-between gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-semibold text-white truncate">{path.topic}</p>
                                                            <div className="flex items-center gap-2 mt-1.5">
                                                                <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                                                                    <div className="h-full bg-violet-500 rounded-full" style={{ width: `${path.progress}%` }} />
                                                                </div>
                                                                <span className="text-[10px] text-slate-500 flex-shrink-0">{path.watchedVideos}/{path.totalVideos}</span>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => togglingPathId !== path.id && togglePathReminder(path.id, !path.reminderEnabled)}
                                                            disabled={togglingPathId === path.id}
                                                            className={`relative flex-shrink-0 w-10 h-5 rounded-full transition-all duration-200 focus:outline-none ${
                                                                path.reminderEnabled ? 'bg-violet-600' : 'bg-white/10'
                                                            } ${togglingPathId === path.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                                        >
                                                            <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${path.reminderEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                <p className="text-[10px] text-slate-600 leading-relaxed">
                                    Emails go to your registered address. You can change this at any time.
                                </p>
                            </div>
                        )}

                        {activeTab === 'youtube' && (
                            <div className="space-y-8">
                                <div>
                                    <h3 className="text-lg font-black text-white mb-2 uppercase">YouTube Architecture</h3>
                                    <p className="text-sm text-slate-400 leading-relaxed font-medium">Sync your curated mastery paths directly to your YouTube playlists.</p>
                                </div>
                                <YouTubeConnect />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
