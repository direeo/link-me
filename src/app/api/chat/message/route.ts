// Chat message API endpoint
// POST /api/chat/message
// Conversational AI that asks personalization questions

import { NextRequest, NextResponse } from 'next/server';
import { chatMessageSchema, validateInput, sanitizeInput } from '@/lib/validation';
import { searchTutorials } from '@/lib/youtube';
import { verifyAccessToken } from '@/lib/auth';
import { checkRateLimit, recordAttempt, RATE_LIMITS, getClientIP } from '@/lib/rate-limit';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

// ============================================
// Conversation State
// ============================================

interface ConversationState {
    stage: 'greeting' | 'got_topic' | 'got_level' | 'ready_to_search' | 'results';
    topic?: string;
    skillLevel?: string;
    goal?: string;
}

const conversationStates = new Map<string, ConversationState>();

// ============================================
// Answer Detection
// ============================================

const SKILL_KEYWORDS = {
    beginner: ['beginner', 'begginer', 'beginer', 'newbie', 'new', 'noob', 'starting', 'start', 'first', 'never', 'basics', 'basic', 'zero', 'fresh', 'just starting', 'total beginner'],
    intermediate: ['intermediate', 'intermed', 'medium', 'mid', 'some experience', 'know basics', 'familiar', 'worked with', 'used before', 'okay', 'ok', 'decent', 'middle'],
    advanced: ['advanced', 'advance', 'expert', 'experienced', 'pro', 'professional', 'senior', 'years', 'master', 'skilled']
};

const GOAL_KEYWORDS = {
    project: ['project', 'build', 'make', 'create', 'develop', 'app', 'website', 'portfolio', 'practical', 'hands-on', 'application', 'something'],
    concepts: ['concept', 'theory', 'understand', 'learn', 'fundamentals', 'how it works', 'why', 'comprehensive'],
    quick: ['quick', 'fast', 'crash course', 'overview', 'intro', 'introduction', 'brief', 'short']
};

function isGreeting(message: string): boolean {
    const greetings = ['hey', 'hi', 'hello', 'yo', 'sup', 'hiya', 'howdy', 'good morning', 'good afternoon', 'good evening', 'whats up', "what's up", 'hii', 'heyy', 'heyyy', 'helloo'];
    const lower = message.toLowerCase().trim();
    // Check if it's just a greeting (short message that matches a greeting pattern)
    return greetings.some(g => lower === g || lower === g + '!' || lower === g + '!!' || lower.startsWith(g + ' '));
}

function isUnsure(message: string): boolean {
    const patterns = ['idk', "i don't know", 'i dont know', 'not sure', 'no idea', 'dunno', 'unsure', 'whatever', 'any', 'anything', "doesn't matter", 'up to you', '?'];
    const lower = message.toLowerCase().trim();
    return patterns.some(p => lower.includes(p)) || lower.length < 3;
}

function extractSkillLevel(message: string): string | null {
    const lower = message.toLowerCase();
    for (const [level, keywords] of Object.entries(SKILL_KEYWORDS)) {
        if (keywords.some(k => lower.includes(k))) return level;
    }
    return null;
}

function extractGoal(message: string): string | null {
    const lower = message.toLowerCase();
    for (const [goal, keywords] of Object.entries(GOAL_KEYWORDS)) {
        if (keywords.some(k => lower.includes(k))) return goal;
    }
    return null;
}

// ============================================
// Clean Response Templates (No Markdown)
// ============================================

function getSkillQuestion(topic: string): string {
    return `Great! I'd love to help you learn ${topic}.\n\nTo find the best tutorials for you, what's your experience level?\n\n• Beginner - totally new to this\n• Intermediate - know the basics\n• Advanced - looking for deeper knowledge\n\nJust say beginner, intermediate, or advanced!`;
}

function getGoalQuestion(topic: string, level: string): string {
    return `Perfect, looking for ${level} ${topic} tutorials.\n\nWhat's your learning goal?\n\n• Build something - hands-on project tutorials\n• Learn concepts - understand the fundamentals\n• Quick overview - get started fast\n\nWhat sounds right for you?`;
}

// ============================================
// Main Handler
// ============================================

export async function POST(request: NextRequest) {
    try {
        // Rate limiting
        const clientIP = getClientIP(request.headers);
        const rateLimitKey = `chat:${clientIP}`;
        const rateLimit = await checkRateLimit(rateLimitKey, RATE_LIMITS.chat);

        if (!rateLimit.allowed) {
            return NextResponse.json({
                success: false,
                message: 'Too many requests. Please slow down.',
            }, { status: 429 });
        }

        // Auth check
        const accessToken = request.cookies.get('accessToken')?.value;
        let userId = 'guest';
        let isLoggedIn = false;

        if (accessToken) {
            const decoded = verifyAccessToken(accessToken);
            if (decoded && !decoded.isGuest) {
                userId = decoded.userId;
                isLoggedIn = true;
            }
        }

        // Parse request
        const body = await request.json();
        const validation = validateInput(chatMessageSchema, body);

        if (!validation.success) {
            return NextResponse.json({
                success: false,
                message: 'Please enter a message',
            }, { status: 400 });
        }

        const { message, conversationId } = validation.data;
        const userMessage = sanitizeInput(message).trim();

        if (!userMessage) {
            return NextResponse.json({
                success: true,
                response: "I didn't catch that. What would you like to learn?",
                conversationId,
            });
        }

        const convId = conversationId || `${userId}_${Date.now()}`;
        let state = conversationStates.get(convId) || { stage: 'greeting' as const };

        await recordAttempt(rateLimitKey, RATE_LIMITS.chat);

        // Reset command
        const resetWords = ['start over', 'reset', 'new topic', 'something else', 'different'];
        if (resetWords.some(w => userMessage.toLowerCase().includes(w))) {
            state = { stage: 'greeting' };
            conversationStates.set(convId, state);
            return NextResponse.json({
                success: true,
                response: "No problem! What would you like to learn?",
                conversationId: convId,
            });
        }

        // ============================================
        // Conversation Flow
        // ============================================

        // Stage 1: Waiting for topic
        if (state.stage === 'greeting') {
            // Check if user is just saying hello
            if (isGreeting(userMessage)) {
                return NextResponse.json({
                    success: true,
                    response: "Hey there! I'm LinkMe, your tutorial discovery assistant.\n\nWhat would you like to learn today? I can help you find tutorials on anything - programming, cooking, music, crafts, and more!",
                    conversationId: convId,
                });
            }

            state.topic = userMessage;
            state.stage = 'got_topic';
            conversationStates.set(convId, state);

            return NextResponse.json({
                success: true,
                response: getSkillQuestion(userMessage),
                conversationId: convId,
            });
        }

        // Stage 2: Waiting for skill level
        if (state.stage === 'got_topic') {
            let level = extractSkillLevel(userMessage);

            if (!level && isUnsure(userMessage)) {
                level = 'beginner';
            }

            if (!level) {
                return NextResponse.json({
                    success: true,
                    response: `Are you a beginner, intermediate, or advanced learner when it comes to ${state.topic}?`,
                    conversationId: convId,
                });
            }

            state.skillLevel = level;
            state.stage = 'got_level';
            conversationStates.set(convId, state);

            return NextResponse.json({
                success: true,
                response: getGoalQuestion(state.topic!, level),
                conversationId: convId,
            });
        }

        // Stage 3: Waiting for goal
        if (state.stage === 'got_level') {
            let goal = extractGoal(userMessage);

            if (!goal) {
                goal = isUnsure(userMessage) ? 'project' : 'project';
            }

            state.goal = goal;
            state.stage = 'ready_to_search';
        }

        // Stage 4: Search
        if (state.stage === 'ready_to_search' || state.stage === 'results') {
            const topic = state.topic || userMessage;
            const level = state.skillLevel || 'beginner';
            const goal = state.goal || 'project';

            // Build a clean, focused search query
            let searchQuery = `${topic} tutorial`;

            if (level === 'beginner') {
                searchQuery += ' for beginners';
            } else if (level === 'advanced') {
                searchQuery += ' advanced';
            }

            if (goal === 'project') {
                searchQuery += ' project';
            } else if (goal === 'quick') {
                searchQuery += ' crash course';
            }

            try {
                const tutorials = await searchTutorials(searchQuery, 7);

                if (tutorials.length === 0) {
                    state = { stage: 'greeting' };
                    conversationStates.set(convId, state);

                    return NextResponse.json({
                        success: true,
                        response: `I couldn't find good tutorials for "${topic}". Could you try describing it differently?`,
                        conversationId: convId,
                    });
                }

                state.stage = 'results';
                conversationStates.set(convId, state);

                // Save for logged-in users
                if (isLoggedIn) {
                    try {
                        const db = getDb();
                        await db.chatHistory.create({
                            data: {
                                userId,
                                messages: JSON.stringify({
                                    topic: state.topic,
                                    skillLevel: level,
                                    goal,
                                    searchQuery,
                                    tutorialCount: tutorials.length,
                                    timestamp: new Date().toISOString(),
                                }),
                            },
                        });
                    } catch (err) {
                        console.error('Failed to save chat history:', err);
                    }
                }

                const levelText = level.charAt(0).toUpperCase() + level.slice(1);
                const goalText = goal === 'project' ? 'project-based' : goal === 'concepts' ? 'concept' : 'quick';

                return NextResponse.json({
                    success: true,
                    response: `Found ${tutorials.length} great tutorials!\n\nTopic: ${state.topic}\nLevel: ${levelText}\nStyle: ${goalText}\n\nHere are the best videos I found for you:`,
                    tutorials,
                    conversationId: convId,
                });
            } catch (error) {
                console.error('Search error:', error);
                return NextResponse.json({
                    success: false,
                    message: 'Failed to search. Please try again.',
                }, { status: 500 });
            }
        }

        // Default
        return NextResponse.json({
            success: true,
            response: "Hi! I'm LinkMe. Tell me what you'd like to learn and I'll find the best tutorials for you.",
            conversationId: convId,
        });

    } catch (error) {
        console.error('Chat error:', error);
        return NextResponse.json({
            success: false,
            message: 'Something went wrong. Please try again.',
        }, { status: 500 });
    }
}
