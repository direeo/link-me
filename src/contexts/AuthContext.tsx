'use client';

// Authentication context provider
// Manages user state, tokens, and auth operations

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthUser } from '@/types';

// ============================================
// Types
// ============================================

interface AuthContextType {
    user: AuthUser | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    isGuest: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
    signup: (email: string, password: string, name?: string) => Promise<{ success: boolean; message: string }>;
    logout: () => Promise<void>;
    continueAsGuest: () => Promise<void>;
    refreshAuth: () => Promise<void>;
}

// ============================================
// Context
// ============================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================
// Provider Component
// ============================================

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check if user is authenticated
    const isAuthenticated = !!user && !user.isGuest;
    const isGuest = !!user?.isGuest;

    // Refresh auth state from server
    const refreshAuth = useCallback(async () => {
        try {
            const response = await fetch('/api/auth/me', {
                credentials: 'include',
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.user) {
                    setUser(data.user);
                } else {
                    setUser(null);
                }
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error('Failed to refresh auth:', error);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Initialize auth state on mount
    useEffect(() => {
        refreshAuth();
    }, [refreshAuth]);

    // Login function
    const login = async (email: string, password: string) => {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (data.success && data.user) {
                setUser(data.user);
                return { success: true, message: 'Login successful' };
            }

            return { success: false, message: data.message || 'Login failed' };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: 'An error occurred during login' };
        }
    };

    // Signup function
    const signup = async (email: string, password: string, name?: string) => {
        try {
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ email, password, name }),
            });

            const data = await response.json();

            if (data.success && data.user) {
                setUser(data.user);
                return { success: true, message: data.message || 'Account created successfully' };
            }

            return { success: false, message: data.message || 'Signup failed' };
        } catch (error) {
            console.error('Signup error:', error);
            return { success: false, message: 'An error occurred during signup' };
        }
    };

    // Logout function
    const logout = async () => {
        try {
            await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include',
            });
        } finally {
            setUser(null);
        }
    };

    // Continue as guest
    const continueAsGuest = async () => {
        try {
            const response = await fetch('/api/auth/guest', {
                method: 'POST',
                credentials: 'include',
            });

            const data = await response.json();

            if (data.success && data.user) {
                setUser(data.user);
            }
        } catch (error) {
            console.error('Guest login error:', error);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated,
                isGuest,
                login,
                signup,
                logout,
                continueAsGuest,
                refreshAuth,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

// ============================================
// Hook
// ============================================

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export default AuthContext;
