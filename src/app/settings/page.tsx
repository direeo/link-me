'use client';

// Settings page with 2FA setup and YouTube integration
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import YouTubeConnect from '@/components/settings/YouTubeConnect';

export default function SettingsPage() {
    const router = useRouter();
    const { user, isLoading: authLoading, isGuest, isAuthenticated } = useAuth();

    // 2FA state
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
    const [setupStep, setSetupStep] = useState<'idle' | 'qr' | 'verify' | 'backup'>('idle');
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [secret, setSecret] = useState<string | null>(null);
    const [verificationCode, setVerificationCode] = useState('');
    const [backupCodes, setBackupCodes] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [disablePassword, setDisablePassword] = useState('');
    const [showDisableModal, setShowDisableModal] = useState(false);

    // Notification preferences
    const [emailReminders, setEmailReminders] = useState(false);
    const [prefSaving, setPrefSaving] = useState(false);
    const [prefMsg, setPrefMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Redirect if not authenticated
    useEffect(() => {
        if (!authLoading && (!user || isGuest)) {
            router.push('/login');
        }
    }, [authLoading, user, isGuest, router]);

    // Check 2FA status and load preferences on mount
    useEffect(() => {
        const check2FAStatus = async () => {
            try {
                const res = await fetch('/api/auth/me', { credentials: 'include' });
                const data = await res.json();
                if (data.success && data.user) {
                    setTwoFactorEnabled(data.user.twoFactorEnabled || false);
                }
            } catch (err) {
                console.error('Failed to check 2FA status:', err);
            }
        };
        const loadPreferences = async () => {
            try {
                const res = await fetch('/api/settings/preferences', { credentials: 'include' });
                const data = await res.json();
                if (data.success) setEmailReminders(data.preferences.emailReminders ?? false);
            } catch {
                // non-fatal
            }
        };
        if (isAuthenticated && !isGuest) {
            check2FAStatus();
            loadPreferences();
        }
    }, [isAuthenticated, isGuest]);

    const toggleEmailReminders = async (enabled: boolean) => {
        setPrefSaving(true);
        setPrefMsg(null);
        setEmailReminders(enabled);
        try {
            const res = await fetch('/api/settings/preferences', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ emailReminders: enabled }),
            });
            const data = await res.json();
            if (data.success) {
                setPrefMsg({ type: 'success', text: enabled ? 'Reminders enabled' : 'Reminders disabled' });
            } else {
                setEmailReminders(!enabled);
                setPrefMsg({ type: 'error', text: data.message || 'Failed to update' });
            }
        } catch {
            setEmailReminders(!enabled);
            setPrefMsg({ type: 'error', text: 'Connection error' });
        } finally {
            setPrefSaving(false);
            setTimeout(() => setPrefMsg(null), 3000);
        }
    };

    const startSetup = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/auth/2fa/setup', {
                method: 'GET',
                credentials: 'include',
            });
            const data = await res.json();

            if (data.success) {
                setQrCode(data.qrCode);
                setSecret(data.secret);
                setSetupStep('qr');
            } else {
                setError(data.message || 'Failed to start 2FA setup');
            }
        } catch (err) {
            setError('Failed to start 2FA setup');
        } finally {
            setLoading(false);
        }
    };

    const verifyAndEnable = async () => {
        if (!verificationCode || verificationCode.length < 6) {
            setError('Please enter a valid 6-digit code');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/auth/2fa/setup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ code: verificationCode }),
            });
            const data = await res.json();

            if (data.success) {
                setBackupCodes(data.backupCodes);
                setTwoFactorEnabled(true);
                setSetupStep('backup');
            } else {
                setError(data.message || 'Invalid code');
            }
        } catch (err) {
            setError('Verification failed');
        } finally {
            setLoading(false);
        }
    };

    const disable2FA = async () => {
        if (!disablePassword) {
            setError('Password is required');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/auth/2fa/disable', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ password: disablePassword }),
            });
            const data = await res.json();

            if (data.success) {
                setTwoFactorEnabled(false);
                setShowDisableModal(false);
                setDisablePassword('');
            } else {
                setError(data.message || 'Failed to disable 2FA');
            }
        } catch (err) {
            setError('Failed to disable 2FA');
        } finally {
            setLoading(false);
        }
    };

    const copyBackupCodes = () => {
        navigator.clipboard.writeText(backupCodes.join('\n'));
    };

    if (authLoading) {
        return (
            <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-slate-300">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0f]">
            {/* Header */}
            <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
                <div className="max-w-4xl mx-auto flex items-center justify-between px-4 py-3 md:px-6">
                    <div className="flex items-center gap-4">
                        <Link href="/chat" className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                                <span className="text-sm font-black text-white">L</span>
                            </div>
                            <span className="font-bold gradient-text">LinkMe</span>
                        </Link>
                        <span className="text-slate-500">/</span>
                        <span className="text-slate-300">Settings</span>
                    </div>
                    <Link
                        href="/chat"
                        className="text-sm text-slate-400 hover:text-white transition-colors"
                    >
                        ← Back to Chat
                    </Link>
                </div>
            </header>

            {/* Settings Content */}
            <main className="max-w-4xl mx-auto px-4 py-8 md:px-6">
                {/* Profile Section */}
                <section className="mb-8">
                    <h2 className="text-xl font-semibold text-white mb-4">Profile</h2>
                    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 flex items-center justify-center text-2xl font-bold">
                                {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div>
                                <h3 className="font-medium text-white">{user?.name || 'User'}</h3>
                                <p className="text-slate-400 text-sm">{user?.email}</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Security Section */}
                <section>
                    <h2 className="text-xl font-semibold text-white mb-4">Security</h2>
                    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="font-medium text-white flex items-center gap-2">
                                    Two-Factor Authentication
                                </h3>
                                <p className="text-slate-400 text-sm mt-1">
                                    Add an extra layer of security to your account using an authenticator app.
                                </p>
                            </div>
                            {twoFactorEnabled ? (
                                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-sm rounded-full">
                                    ✓ Enabled
                                </span>
                            ) : (
                                <span className="px-3 py-1 bg-slate-500/20 text-slate-400 text-sm rounded-full">
                                    Disabled
                                </span>
                            )}
                        </div>

                        {error && (
                            <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        {/* Setup Steps */}
                        {setupStep === 'idle' && !twoFactorEnabled && (
                            <button
                                onClick={startSetup}
                                disabled={loading}
                                className="mt-4 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors disabled:opacity-50"
                            >
                                {loading ? 'Loading...' : 'Enable 2FA'}
                            </button>
                        )}

                        {setupStep === 'qr' && (
                            <div className="mt-6 space-y-4">
                                <div className="flex flex-col md:flex-row gap-6">
                                    <div className="flex-shrink-0">
                                        {qrCode && (
                                            <img
                                                src={qrCode}
                                                alt="2FA QR Code"
                                                className="w-48 h-48 rounded-lg bg-white p-2"
                                            />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-medium text-white mb-2">1. Scan this QR code</h4>
                                        <p className="text-slate-400 text-sm mb-4">
                                            Open your authenticator app (Google Authenticator, Authy, etc.) and scan this QR code.
                                        </p>
                                        <div className="p-3 bg-slate-900 rounded-lg">
                                            <p className="text-xs text-slate-500 mb-1">Or enter this code manually:</p>
                                            <code className="text-sm text-violet-400 break-all">{secret}</code>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-slate-700 pt-4">
                                    <h4 className="font-medium text-white mb-2">2. Enter verification code</h4>
                                    <p className="text-slate-400 text-sm mb-3">
                                        Enter the 6-digit code from your authenticator app to verify setup.
                                    </p>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={verificationCode}
                                            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                            placeholder="000000"
                                            className="w-32 px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-center text-lg tracking-widest focus:outline-none focus:border-violet-500"
                                            maxLength={6}
                                        />
                                        <button
                                            onClick={verifyAndEnable}
                                            disabled={loading || verificationCode.length !== 6}
                                            className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors disabled:opacity-50"
                                        >
                                            {loading ? 'Verifying...' : 'Verify & Enable'}
                                        </button>
                                        <button
                                            onClick={() => setSetupStep('idle')}
                                            className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {setupStep === 'backup' && (
                            <div className="mt-6 space-y-4">
                                <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                                    <h4 className="font-medium text-amber-400 flex items-center gap-2 mb-2">
                                        Save Your Backup Codes
                                    </h4>
                                    <p className="text-slate-300 text-sm mb-4">
                                        If you lose access to your authenticator app, you can use these backup codes to sign in.
                                        Each code can only be used once. <strong>Save them somewhere safe!</strong>
                                    </p>
                                    <div className="grid grid-cols-2 gap-2 p-4 bg-slate-900 rounded-lg font-mono text-sm">
                                        {backupCodes.map((code, i) => (
                                            <div key={i} className="text-slate-300">{code}</div>
                                        ))}
                                    </div>
                                    <div className="flex gap-2 mt-4">
                                        <button
                                            onClick={copyBackupCodes}
                                            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors text-sm"
                                        >
                                            Copy Codes
                                        </button>
                                        <button
                                            onClick={() => {
                                                setSetupStep('idle');
                                                setBackupCodes([]);
                                                setQrCode(null);
                                                setSecret(null);
                                                setVerificationCode('');
                                            }}
                                            className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors text-sm"
                                        >
                                            I've Saved My Codes
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {twoFactorEnabled && setupStep === 'idle' && (
                            <button
                                onClick={() => setShowDisableModal(true)}
                                className="mt-4 px-4 py-2 text-red-400 hover:text-red-300 border border-red-500/30 hover:border-red-500 rounded-lg transition-colors"
                            >
                                Disable 2FA
                            </button>
                        )}
                    </div>
                </section>

                {/* Notifications Section */}
                <section className="mt-8">
                    <h2 className="text-xl font-semibold text-white mb-4">Notifications</h2>
                    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
                        <div className="flex items-start justify-between gap-6">
                            <div className="flex-1">
                                <h3 className="font-medium text-white mb-1">Daily learning reminders</h3>
                                <p className="text-slate-400 text-sm leading-relaxed">
                                    Get a daily email at 9 AM showing your active learning paths and progress — like Duolingo, but for dev skills.
                                    Emails go to <span className="text-slate-300">{user?.email}</span>.
                                </p>
                            </div>
                            {/* Toggle switch */}
                            <button
                                onClick={() => !prefSaving && toggleEmailReminders(!emailReminders)}
                                disabled={prefSaving}
                                aria-label="Toggle email reminders"
                                className={`relative flex-shrink-0 w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none mt-1 ${
                                    emailReminders ? 'bg-violet-600' : 'bg-slate-600'
                                } ${prefSaving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                            >
                                <span
                                    className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
                                        emailReminders ? 'translate-x-6' : 'translate-x-0'
                                    }`}
                                />
                            </button>
                        </div>

                        <div className="flex items-center gap-2 mt-4">
                            <div className={`w-2 h-2 rounded-full ${emailReminders ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                            <span className={`text-xs font-medium ${emailReminders ? 'text-emerald-400' : 'text-slate-500'}`}>
                                {emailReminders ? 'Enabled' : 'Disabled'}
                            </span>
                        </div>

                        {prefMsg && (
                            <div className={`mt-4 p-3 rounded-lg text-sm ${
                                prefMsg.type === 'success'
                                    ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
                                    : 'bg-red-500/20 border border-red-500/30 text-red-400'
                            }`}>
                                {prefMsg.text}
                            </div>
                        )}
                    </div>
                </section>

                {/* Integrations Section */}
                <section className="mt-8">
                    <h2 className="text-xl font-semibold text-white mb-4">Integrations</h2>
                    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
                        <YouTubeConnect />
                    </div>
                </section>
            </main>

            {/* Disable 2FA Modal */}
            {showDisableModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-md w-full">
                        <h3 className="text-lg font-semibold text-white mb-2">Disable Two-Factor Authentication</h3>
                        <p className="text-slate-400 text-sm mb-4">
                            Enter your password to disable 2FA. This will reduce the security of your account.
                        </p>
                        {error && (
                            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
                                {error}
                            </div>
                        )}
                        <input
                            type="password"
                            value={disablePassword}
                            onChange={(e) => setDisablePassword(e.target.value)}
                            placeholder="Enter your password"
                            className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-violet-500 mb-4"
                        />
                        <div className="flex gap-2 justify-end">
                            <button
                                onClick={() => {
                                    setShowDisableModal(false);
                                    setDisablePassword('');
                                    setError(null);
                                }}
                                className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={disable2FA}
                                disabled={loading || !disablePassword}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
                            >
                                {loading ? 'Disabling...' : 'Disable 2FA'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
