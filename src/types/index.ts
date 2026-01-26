// Type definitions for LinkMe application

// ============================================
// User Types
// ============================================

export interface User {
    id: string;
    email: string;
    name?: string | null;
    emailVerified: boolean;
    createdAt: Date;
}

export interface AuthUser {
    id: string;
    email: string;
    name?: string | null;
    emailVerified: boolean;
    isGuest: boolean;
}

// ============================================
// Auth Types
// ============================================

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    user?: AuthUser;
    tokens?: AuthTokens;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface SignupCredentials {
    email: string;
    password: string;
    name?: string;
}

// ============================================
// Chat Types
// ============================================

export type MessageRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
    id: string;
    role: MessageRole;
    content: string;
    timestamp: Date;
    tutorials?: YouTubeResult[];
    learningPath?: LearningPath;
    isLoading?: boolean;
}


export interface Conversation {
    id: string;
    title: string;
    messages: ChatMessage[];
    createdAt: Date;
    updatedAt: Date;
}

// ============================================
// YouTube Types
// ============================================

export interface YouTubeResult {
    id: string;
    title: string;
    description: string;
    thumbnail: string;
    channelTitle: string;
    publishedAt: string;
    viewCount?: string;
    duration?: string;
    url: string;
}

export interface YouTubeSearchResponse {
    success: boolean;
    results: YouTubeResult[];
    error?: string;
}

// ============================================
// Learning Path Types
// ============================================

export interface VideoAnalysis {
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

export interface LearningStage {
    stageName: string;
    stageNumber: number;
    description: string;
    videos: VideoAnalysis[];
}

export interface LearningPath {
    topic: string;
    userLevel: string;
    userGoal: string;
    totalVideos: number;
    estimatedTotalTime: string;
    stages: LearningStage[];
    completionGoals: string[];
    summary: string;
}


// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T = undefined> {
    success: boolean;
    message: string;
    data?: T;
    errors?: string[];
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
}

// ============================================
// Chat API Types
// ============================================

export interface ChatApiRequest {
    message: string;
    conversationId?: string;
}

export interface ChatApiResponse {
    success: boolean;
    response: string;
    tutorials?: YouTubeResult[];
    clarifyingQuestions?: string[];
    conversationId?: string;
}

// ============================================
// Component Props Types
// ============================================

export interface ButtonProps {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    disabled?: boolean;
    className?: string;
    onClick?: () => void;
    type?: 'button' | 'submit' | 'reset';
}

export interface InputProps {
    label?: string;
    error?: string;
    helperText?: string;
    className?: string;
}
