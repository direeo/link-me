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
    const [activeTab, setActiveTab] = useState<'security' | 'youtube'>('security');
    const [twoFASecret, setTwoFASecret] = useState<string | null>(null);
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [verificationCode, setVerificationCode] = useState('');
    const [is2FAEnabled, setIs2FAEnabled] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Initial check for 2FA status
    useEffect(() => {
        if (isOpen) {
            check2FAStatus();
        }
    }, [isOpen]);

    const check2FAStatus = async () => {
        try {
            const res = await fetch('/api/auth/me');
            const data = await res.json();
            if (data.success && data.user) {
                setIs2FAEnabled(!!data.user.twoFactorEnabled);
            }
        } catch (err) {
            console.error('Failed to check 2FA status');
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
        console.log('[2FA Modal] verifyAndEnable called');
        console.log('[2FA Modal] verificationCode value:', verificationCode);
        console.log('[2FA Modal] verificationCode length:', verificationCode.length);
        
        setIsLoading(true);
        try {
            const bodyObj = { code: verificationCode };
            console.log('[2FA Modal] Sending body:', bodyObj);
            const bodyStr = JSON.stringify(bodyObj);
            console.log('[2FA Modal] Stringified body:', bodyStr);
            
            const res = await fetch('/api/auth/2fa/setup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: bodyStr,
            });
            console.log('[2FA Modal] Response status:', res.status);
            const data = await res.json();
            console.log('[2FA Modal] Response data:', data);
            
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
            console.error('[2FA Modal] Error:', err);
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
                            🛡️ Security
                        </button>
                        <button 
                            onClick={() => setActiveTab('youtube')}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'youtube' ? 'bg-red-600 text-white' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                        >
                            🎬 YouTube
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
                                        <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white text-2xl">✓</div>
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
                                                <Button onClick={verifyAndEnable} disabled={isLoading || verificationCode.length < 6}>
                                                    {isLoading ? 'Syncing...' : 'Verify & Enable'}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-10 border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center gap-6">
                                        <div className="w-16 h-16 rounded-2xl bg-violet-600/10 border border-violet-600/20 flex items-center justify-center text-3xl">🛡️</div>
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
