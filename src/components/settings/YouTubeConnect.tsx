'use client';

// YouTube Connect component for settings page
import React, { useState, useEffect } from 'react';

interface YouTubeStatus {
    connected: boolean;
    channelId: string | null;
    channelName: string | null;
}

export default function YouTubeConnect() {
    const [status, setStatus] = useState<YouTubeStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [disconnecting, setDisconnecting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Check for URL params on mount (from OAuth callback)
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('youtube_connected') === 'true') {
            setSuccessMessage('YouTube account connected successfully!');
            // Clean up URL
            window.history.replaceState({}, '', '/settings');
        }
        if (params.get('youtube_error')) {
            const errorCode = params.get('youtube_error');
            const errorMessages: Record<string, string> = {
                access_denied: 'YouTube access was denied',
                missing_params: 'Invalid OAuth response',
                invalid_state: 'Session expired, please try again',
                user_not_found: 'User session not found',
                token_exchange_failed: 'Failed to connect YouTube account',
            };
            setError(errorCode && errorMessages[errorCode] ? errorMessages[errorCode] : 'An error occurred');
            window.history.replaceState({}, '', '/settings');
        }
    }, []);

    // Fetch YouTube connection status
    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const res = await fetch('/api/youtube/status', {
                    credentials: 'include',
                });
                const data = await res.json();
                if (data.success) {
                    setStatus({
                        connected: data.connected,
                        channelId: data.channelId,
                        channelName: data.channelName,
                    });
                }
            } catch (err) {
                console.error('Failed to fetch YouTube status:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchStatus();
    }, []);

    const handleConnect = () => {
        // Redirect to YouTube OAuth
        window.location.href = '/api/youtube/auth';
    };

    const handleDisconnect = async () => {
        setDisconnecting(true);
        setError(null);
        try {
            const res = await fetch('/api/youtube/status', {
                method: 'DELETE',
                credentials: 'include',
            });
            const data = await res.json();
            if (data.success) {
                setStatus({
                    connected: false,
                    channelId: null,
                    channelName: null,
                });
                setSuccessMessage('YouTube account disconnected');
            } else {
                setError(data.message || 'Failed to disconnect');
            }
        } catch (err) {
            setError('Failed to disconnect YouTube account');
        } finally {
            setDisconnecting(false);
        }
    };

    // Clear messages after 5 seconds
    useEffect(() => {
        if (successMessage || error) {
            const timer = setTimeout(() => {
                setSuccessMessage(null);
                setError(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [successMessage, error]);

    if (loading) {
        return (
            <div className="animate-pulse">
                <div className="h-20 bg-slate-700/50 rounded-xl"></div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-start justify-between">
                <div>
                    <h3 className="font-medium text-white flex items-center gap-2">
                        <svg className="w-5 h-5 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                        </svg>
                        YouTube Integration
                    </h3>
                    <p className="text-slate-400 text-sm mt-1">
                        Connect your YouTube account to export learning paths as playlists.
                    </p>
                </div>
                {status?.connected && (
                    <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-sm rounded-full">
                        ✓ Connected
                    </span>
                )}
            </div>

            {/* Success/Error Messages */}
            {successMessage && (
                <div className="p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-emerald-400 text-sm">
                    {successMessage}
                </div>
            )}
            {error && (
                <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
                    {error}
                </div>
            )}

            {status?.connected ? (
                <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                            <svg className="w-5 h-5 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-white font-medium">{status.channelName || 'YouTube Account'}</p>
                            <p className="text-slate-400 text-sm">Connected</p>
                        </div>
                    </div>
                    <button
                        onClick={handleDisconnect}
                        disabled={disconnecting}
                        className="px-4 py-2 text-red-400 hover:text-red-300 border border-red-500/30 hover:border-red-500 rounded-lg transition-colors disabled:opacity-50 text-sm"
                    >
                        {disconnecting ? 'Disconnecting...' : 'Disconnect'}
                    </button>
                </div>
            ) : (
                <button
                    onClick={handleConnect}
                    className="flex items-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                    Connect YouTube Account
                </button>
            )}

            <p className="text-xs text-slate-500">
                LinkMe will only be able to create playlists on your account. We never read or delete your existing content.
            </p>
        </div>
    );
}
