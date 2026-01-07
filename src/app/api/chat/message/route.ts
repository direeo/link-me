// Chat message API endpoint
// POST /api/chat/message
// Conversational AI that ALWAYS asks personalization questions

import { NextRequest, NextResponse } from 'next/server';
import { chatMessageSchema, validateInput, sanitizeInput } from '@/lib/validation';
import { searchTutorials } from '@/lib/youtube';
import { verifyAccessToken } from '@/lib/auth';
import { checkRateLimit, recordAttempt, RATE_LIMITS, getClientIP } from '@/lib/rate-limit';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

// ============================================
// Conversation State Types
// ============================================

interface ConversationState {
    stage: 'greeting' | 'got_topic' | 'got_level' | 'ready_to_search' | 'results';
    topic?: string;
    skillLevel?: string;
    goal?: string;
    messageHistory: Array<{ role: 'user' | 'assistant'; content: string }>;
}

// In-memory states (MVP - use Redis in production)
const conversationStates = new Map<string, ConversationState>();

// ============================================
// Smart Response Parsing
// ============================================

const SKILL_KEYWORDS = {
    beginner: ['beginner', 'begginer', 'beginer', 'newbie', 'new', 'noob', 'starting', 'start', 'first', 'never', 'basics', 'basic', 'zero', 'fresh', 'complete beginner', 'total beginner', 'just starting'],
    intermediate: ['intermediate', 'intermed', 'medium', 'mid', 'some experience', 'know basics', 'familiar', 'worked with', 'used before', 'okay', 'ok', 'decent', 'fair', 'middle', 'average'],
    advanced: ['advanced', 'advance', 'expert', 'experienced', 'pro', 'professional', 'senior', 'years', 'long time', 'very good', 'master', 'skilled', 'proficient']
};

const GOAL_KEYWORDS = {
    project: ['project', 'build', 'make', 'create', 'develop', 'app', 'website', 'portfolio', 'real', 'practical', 'hands-on', 'application', 'something', 'thing'],
    concepts: ['concept', 'theory', 'understand', 'learn', 'fundamentals', 'deep dive', 'how it works', 'why', 'comprehensive', 'thorough', 'in-depth'],
    quick: ['quick', 'fast', 'crash course', 'overview', 'intro', 'introduction', 'brief', 'short', 'summary']
};

// Detect if user doesn't know / is unsure
function isUnsure(message: string): boolean {
    const unsurePatterns = ['idk', "i don't know", 'i dont know', 'not sure', 'no idea', 'dunno', 'dk', 'unsure', 'whatever', 'any', 'anything', "doesn't matter", 'doesnt matter', 'up to you', 'you decide', 'i guess', 'maybe', 'hmm', 'um', '?'];
    const lower = message.toLowerCase().trim();
    return unsurePatterns.some(p => lower.includes(p)) || lower.length < 3;
}

function extractSkillLevel(message: string): string | null {
    const lower = message.toLowerCase();
    for (const [level, keywords] of Object.entries(SKILL_KEYWORDS)) {
        if (keywords.some(k => lower.includes(k))) {
            return level;
        }
    }
    return null;
}

function extractGoal(message: string): string | null {
    const lower = message.toLowerCase();
    for (const [goal, keywords] of Object.entries(GOAL_KEYWORDS)) {
        if (keywords.some(k => lower.includes(k))) {
            return goal;
        }
    }
    return null;
}

// ============================================
// Conversational Response Templates
// ============================================

function getSkillQuestion(topic: string): string {
    return `Great! I'd love to help you learn **${topic}**! 📚\n\nTo find the perfect tutorials for you, what's your current experience level?\n\n• **Beginner** - totally new to this\n• **Intermediate** - know the basics, want to go deeper\n• **Advanced** - experienced, looking for advanced techniques\n\n_(Just say "beginner", "intermediate", or "advanced" - or describe your experience in your own words!)_`;
}

function getGoalQuestion(topic: string, level: string): string {
    const levelText = level === 'beginner' ? 'beginner-friendly' : level === 'advanced' ? 'advanced' : 'intermediate';
    return `Perfect! Looking for ${levelText} **${topic}** tutorials. 🎯\n\nOne last thing - what's your goal?\n\n• **Build something** - hands-on project tutorials\n• **Learn concepts** - understand the fundamentals deeply\n• **Quick overview** - crash course to get started fast\n\n_(Just describe what you're hoping to achieve!)_`;
}

function getSearchingMessage(topic: string, level: string, goal: string): string {
    const goalText = goal === 'project' ? 'project-based' : goal === 'concepts' ? 'concept-focused' : 'quick';
    return `🔍 Searching for ${level} ${topic} tutorials with a ${goalText} approach...`;
}

// ============================================
// Main Chat Handler
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

        // Check auth
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
                errors: validation.errors,
            }, { status: 400 });
        }

        const { message, conversationId } = validation.data;
        const sanitizedMessage = sanitizeInput(message).trim();

        // Handle empty-ish messages
        if (!sanitizedMessage || sanitizedMessage.length === 0) {
            return NextResponse.json({
                success: true,
                response: "I didn't catch that. What would you like to learn today? 🤔",
                conversationId,
            });
        }

        const convId = conversationId || `${userId}_${Date.now()}`;

        // Get or create state
        let state = conversationStates.get(convId) || {
            stage: 'greeting' as const,
            messageHistory: []
        };

        // Record attempt
        await recordAttempt(rateLimitKey, RATE_LIMITS.chat);

        // Add user message to history
        state.messageHistory.push({ role: 'user', content: sanitizedMessage });

        // ============================================
        // Conversation Flow - ALWAYS ask questions
        // ============================================

        // Check for "new search" / "start over" intent
        const resetKeywords = ['new', 'different', 'something else', 'change', 'switch', 'start over', 'reset', 'another topic', 'nevermind', 'never mind'];
        if (resetKeywords.some(k => sanitizedMessage.toLowerCase().includes(k)) && state.stage !== 'greeting') {
            state = { stage: 'greeting', messageHistory: state.messageHistory };
            conversationStates.set(convId, state);
            return NextResponse.json({
                success: true,
                response: "No problem! Let's start fresh. 🔄\n\nWhat would you like to learn? Tell me anything - programming, cooking, music, crafts, anything!",
                conversationId: convId,
            });
        }

        // STAGE: Greeting - waiting for initial topic
        if (state.stage === 'greeting') {
            // User is telling us what they want to learn
            state.topic = sanitizedMessage;
            state.stage = 'got_topic';
            conversationStates.set(convId, state);

            const response = getSkillQuestion(sanitizedMessage);
            state.messageHistory.push({ role: 'assistant', content: response });

            return NextResponse.json({
                success: true,
                response,
                conversationId: convId,
            });
        }

        // STAGE: Got topic, waiting for skill level
        if (state.stage === 'got_topic') {
            let level = extractSkillLevel(sanitizedMessage);

            if (!level) {
                if (isUnsure(sanitizedMessage)) {
                    level = 'beginner';
                } else {
                    // Couldn't detect, ask more specifically
                    const response = `I want to make sure I find the right level for you! Are you:\n\n• **Beginner** - new to ${state.topic}\n• **Intermediate** - have some experience\n• **Advanced** - quite experienced\n\n_(Or just say "I'm new" or "I have experience" - I'll understand!)_`;
                    state.messageHistory.push({ role: 'assistant', content: response });
                    conversationStates.set(convId, state);
                    return NextResponse.json({
                        success: true,
                        response,
                        conversationId: convId,
                    });
                }
            }

            state.skillLevel = level;
            state.stage = 'got_level';
            conversationStates.set(convId, state);

            const response = getGoalQuestion(state.topic!, level);
            state.messageHistory.push({ role: 'assistant', content: response });

            return NextResponse.json({
                success: true,
                response,
                conversationId: convId,
            });
        }

        // STAGE: Got level, waiting for goal
        if (state.stage === 'got_level') {
            let goal = extractGoal(sanitizedMessage);

            if (!goal) {
                if (isUnsure(sanitizedMessage)) {
                    goal = 'project'; // Default to hands-on
                } else {
                    goal = 'project'; // Default assumption
                }
            }

            state.goal = goal;
            state.stage = 'ready_to_search';
            // Fall through to search
        }

        // STAGE: Ready to search or in results
        if (state.stage === 'ready_to_search' || state.stage === 'results') {
            // Build search query
            const topic = state.topic || sanitizedMessage;
            const level = state.skillLevel || 'beginner';
            const goal = state.goal || 'project';

            let query = topic;
            if (level === 'beginner') {
                query += ' beginner tutorial for beginners';
            } else if (level === 'advanced') {
                query += ' advanced tutorial in-depth';
            } else {
                query += ' tutorial';
            }

            if (goal === 'project') {
                query += ' project build hands-on';
            } else if (goal === 'concepts') {
                query += ' explained concepts fundamentals';
            } else {
                query += ' crash course introduction';
            }

            try {
                const tutorials = await searchTutorials(query, 7);

                if (tutorials.length === 0) {
                    state.stage = 'greeting';
                    state.topic = undefined;
                    state.skillLevel = undefined;
                    state.goal = undefined;
                    conversationStates.set(convId, state);

                    return NextResponse.json({
                        success: true,
                        response: `Hmm, I couldn't find great tutorials for "${topic}". 🤔\n\nCould you try describing what you want to learn differently? Or try a related topic!`,
                        conversationId: convId,
                    });
                }

                state.stage = 'results';
                conversationStates.set(convId, state);

                // Save to chat history for logged-in users
                if (isLoggedIn) {
                    try {
                        const db = getDb();
                        await db.chatHistory.create({
                            data: {
                                userId,
                                messages: JSON.stringify({
                                    topic: state.topic,
                                    skillLevel: state.skillLevel,
                                    goal: state.goal,
                                    query,
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
                const goalText = goal === 'project' ? 'hands-on projects' : goal === 'concepts' ? 'concept learning' : 'a quick overview';

                const response = `🎯 Found ${tutorials.length} perfect tutorials for you!\n\n**Your preferences:**\n• Topic: ${state.topic}\n• Level: ${levelText}\n• Focus: ${goalText}\n\nHere are the best videos I found:`;

                state.messageHistory.push({ role: 'assistant', content: response });

                return NextResponse.json({
                    success: true,
                    response,
                    tutorials,
                    conversationId: convId,
                });
            } catch (error) {
                console.error('Search error:', error);
                return NextResponse.json({
                    success: false,
                    message: 'Failed to search for tutorials. Please try again.',
                }, { status: 500 });
            }
        }

        // Default fallback
        return NextResponse.json({
            success: true,
            response: "👋 Hi! I'm LinkMe, your tutorial discovery assistant.\n\nTell me what you'd like to learn - anything from programming to cooking to music! I'll ask a few questions to find the perfect tutorials for YOU.",
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
