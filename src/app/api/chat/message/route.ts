// Chat message API endpoint
// POST /api/chat/message
// Smarter conversational AI that understands user intent and mistakes

import { NextRequest, NextResponse } from 'next/server';
import { chatMessageSchema, validateInput, sanitizeInput } from '@/lib/validation';
import { searchTutorials } from '@/lib/youtube';
import { verifyAccessToken } from '@/lib/auth';
import { checkRateLimit, recordAttempt, RATE_LIMITS, getClientIP } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

// ============================================
// Conversation State Types
// ============================================

interface ConversationState {
    stage: 'greeting' | 'topic' | 'skill_level' | 'goal' | 'searching' | 'results';
    topic?: string;
    skillLevel?: string;
    goal?: string;
    lastQuery?: string;
}

// In-memory states (MVP - use Redis in production)
const conversationStates = new Map<string, ConversationState>();

// ============================================
// Smart Answer Extraction
// ============================================

// Skill level patterns (including typos and variations)
const SKILL_PATTERNS = {
    beginner: ['beginner', 'begginer', 'beginer', 'newbie', 'new', 'noob', 'start', 'starting', 'first time', 'never', 'just started', 'basics', 'basic', 'zero', '0', 'fresh'],
    intermediate: ['intermediate', 'intermed', 'medium', 'mid', 'some experience', 'know basics', 'familiar', 'worked with', 'used before', 'ok', 'okay', 'decent'],
    advanced: ['advanced', 'advance', 'expert', 'experienced', 'pro', 'professional', 'senior', 'years', 'long time', 'very good', 'master']
};

// Goal patterns
const GOAL_PATTERNS = {
    project: ['project', 'build', 'make', 'create', 'develop', 'app', 'website', 'portfolio', 'real', 'practical', 'hands-on', 'application'],
    concepts: ['concept', 'theory', 'understand', 'learn', 'fundamentals', 'deep dive', 'how it works', 'why', 'basics', 'comprehensive'],
    specific: ['specific', 'particular', 'this', 'that', 'exactly', 'particular feature', 'one thing']
};

// Unclear/uncertain responses
const UNCLEAR_PATTERNS = ['idk', 'i dont know', "i don't know", 'not sure', 'no idea', 'dunno', 'dk', 'unsure', 'whatever', 'any', 'anything', 'doesnt matter', "doesn't matter", 'up to you', '?', 'hmm', 'um', 'uh'];

function extractSkillLevel(message: string): string | null {
    const lower = message.toLowerCase();

    for (const [level, patterns] of Object.entries(SKILL_PATTERNS)) {
        if (patterns.some(p => lower.includes(p))) {
            return level;
        }
    }
    return null;
}

function extractGoal(message: string): string | null {
    const lower = message.toLowerCase();

    for (const [goal, patterns] of Object.entries(GOAL_PATTERNS)) {
        if (patterns.some(p => lower.includes(p))) {
            return goal;
        }
    }
    return null;
}

function isUnclear(message: string): boolean {
    const lower = message.toLowerCase().trim();
    return UNCLEAR_PATTERNS.some(p => lower.includes(p)) || lower.length < 3;
}

function extractTopic(message: string): string | null {
    const lower = message.toLowerCase();

    // Common programming topics
    const topics = ['react', 'javascript', 'python', 'java', 'css', 'html', 'node', 'nodejs', 'typescript',
        'vue', 'angular', 'nextjs', 'next.js', 'express', 'django', 'flask', 'rust', 'go',
        'golang', 'c++', 'c#', 'swift', 'kotlin', 'flutter', 'dart', 'sql', 'database',
        'machine learning', 'ml', 'ai', 'data science', 'web development', 'mobile', 'ios',
        'android', 'devops', 'docker', 'kubernetes', 'aws', 'cloud', 'git', 'api', 'rest'];

    for (const topic of topics) {
        if (lower.includes(topic)) {
            return topic;
        }
    }

    // If no specific topic found but message is long enough, use it as topic
    if (message.length > 5) {
        // Clean up common filler words
        const cleaned = message.replace(/^(i want to |i'd like to |can you |please |help me |find me |show me |teach me )/gi, '').trim();
        if (cleaned.length > 3) {
            return cleaned;
        }
    }

    return null;
}

// ============================================
// Conversational Response Generation
// ============================================

function getTopicQuestion(): string {
    return "What would you like to learn? 🎯\n\nYou can say something like:\n• \"React\"\n• \"Python for data science\"\n• \"How to build a website\"";
}

function getSkillQuestion(topic: string): string {
    return `Great choice with ${topic}! 📚\n\nWhat's your experience level?\n• **Beginner** - just starting out\n• **Intermediate** - know the basics\n• **Advanced** - looking to deepen knowledge`;
}

function getGoalQuestion(topic: string): string {
    return `What's your goal with ${topic}?\n\n• **Build something** - hands-on project tutorials\n• **Learn concepts** - understand the fundamentals\n• **Anything works** - show me the best tutorials`;
}

function buildSearchQuery(state: ConversationState): string {
    let query = state.topic || '';

    if (state.skillLevel) {
        query += ` ${state.skillLevel}`;
    }
    if (state.goal === 'project') {
        query += ' project tutorial build';
    } else if (state.goal === 'concepts') {
        query += ' fundamentals concepts explained';
    }

    return query.trim();
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
        if (accessToken) {
            const decoded = verifyAccessToken(accessToken);
            if (decoded) userId = decoded.userId;
        }

        // Parse request
        const body = await request.json();
        const validation = validateInput(chatMessageSchema, body);

        if (!validation.success) {
            return NextResponse.json({
                success: false,
                message: 'Invalid message',
                errors: validation.errors,
            }, { status: 400 });
        }

        const { message, conversationId } = validation.data;
        const sanitizedMessage = sanitizeInput(message);
        const convId = conversationId || `${userId}_${Date.now()}`;

        // Get or create state
        let state = conversationStates.get(convId) || { stage: 'greeting' as const };

        // Record attempt
        await recordAttempt(rateLimitKey, RATE_LIMITS.chat);

        // ============================================
        // Smart Message Processing
        // ============================================

        // Try to extract info from ANY message
        const detectedTopic = extractTopic(sanitizedMessage);
        const detectedSkill = extractSkillLevel(sanitizedMessage);
        const detectedGoal = extractGoal(sanitizedMessage);
        const messageIsUnclear = isUnclear(sanitizedMessage);

        // Update state with any detected info
        if (detectedTopic && !state.topic) state.topic = detectedTopic;
        if (detectedSkill) state.skillLevel = detectedSkill;
        if (detectedGoal) state.goal = detectedGoal;

        // Check for "new topic" intent
        const newTopicKeywords = ['new', 'different', 'something else', 'change', 'switch', 'another topic', 'start over', 'reset'];
        if (newTopicKeywords.some(k => sanitizedMessage.toLowerCase().includes(k)) && state.stage === 'results') {
            state = { stage: 'topic' };
            conversationStates.set(convId, state);
            return NextResponse.json({
                success: true,
                response: getTopicQuestion(),
                conversationId: convId,
            });
        }

        // ============================================
        // Conversation Flow (Single Question at a Time)
        // ============================================

        // Stage: Greeting - first message
        if (state.stage === 'greeting') {
            if (detectedTopic) {
                // User provided topic in first message
                state.stage = 'skill_level';
                state.topic = detectedTopic;

                // If they also provided skill level, skip to goal
                if (detectedSkill) {
                    state.skillLevel = detectedSkill;

                    // If they also provided goal, search!
                    if (detectedGoal) {
                        state.goal = detectedGoal;
                        state.stage = 'searching';
                    } else {
                        state.stage = 'goal';
                    }
                }
            } else {
                state.stage = 'topic';
            }
        }

        // Stage: Waiting for topic
        else if (state.stage === 'topic') {
            if (detectedTopic) {
                state.topic = detectedTopic;
                state.stage = detectedSkill ? (detectedGoal ? 'searching' : 'goal') : 'skill_level';
            } else if (messageIsUnclear) {
                // User doesn't know - give suggestions
                conversationStates.set(convId, state);
                return NextResponse.json({
                    success: true,
                    response: "No worries! Here are some popular topics:\n\n• **React** - build modern web apps\n• **Python** - great for beginners & data science\n• **JavaScript** - essential for web development\n\nWhich sounds interesting?",
                    conversationId: convId,
                });
            } else {
                // Use the message as topic
                state.topic = sanitizedMessage;
                state.stage = 'skill_level';
            }
        }

        // Stage: Waiting for skill level
        else if (state.stage === 'skill_level') {
            if (detectedSkill) {
                state.skillLevel = detectedSkill;
                state.stage = detectedGoal ? 'searching' : 'goal';
            } else if (messageIsUnclear) {
                // Default to beginner
                state.skillLevel = 'beginner';
                state.stage = 'goal';
            } else {
                // Couldn't detect, assume intermediate and move on
                state.skillLevel = 'intermediate';
                state.stage = 'goal';
            }
        }

        // Stage: Waiting for goal
        else if (state.stage === 'goal') {
            if (detectedGoal) {
                state.goal = detectedGoal;
            } else if (messageIsUnclear) {
                state.goal = 'any';
            } else {
                state.goal = 'any';
            }
            state.stage = 'searching';
        }

        // Stage: In results, handle follow-ups
        else if (state.stage === 'results') {
            // User wants more or different results
            if (detectedTopic && detectedTopic !== state.topic) {
                // New topic
                state = { stage: 'skill_level', topic: detectedTopic };
                if (detectedSkill) {
                    state.skillLevel = detectedSkill;
                    state.stage = detectedGoal ? 'searching' : 'goal';
                }
            } else {
                // Refine current search
                state.lastQuery = sanitizedMessage;
                state.stage = 'searching';
            }
        }

        // ============================================
        // Response Generation
        // ============================================

        conversationStates.set(convId, state);

        // Generate appropriate response based on current stage
        if (state.stage === 'topic') {
            return NextResponse.json({
                success: true,
                response: "👋 Hi! I'm LinkMe, your tutorial discovery assistant.\n\n" + getTopicQuestion(),
                conversationId: convId,
            });
        }

        if (state.stage === 'skill_level') {
            return NextResponse.json({
                success: true,
                response: getSkillQuestion(state.topic || 'that'),
                conversationId: convId,
            });
        }

        if (state.stage === 'goal') {
            return NextResponse.json({
                success: true,
                response: getGoalQuestion(state.topic || 'this'),
                conversationId: convId,
            });
        }

        if (state.stage === 'searching') {
            // Build query and search
            const query = buildSearchQuery(state);

            try {
                const tutorials = await searchTutorials(query, 7);

                if (tutorials.length === 0) {
                    state.stage = 'topic';
                    conversationStates.set(convId, state);
                    return NextResponse.json({
                        success: true,
                        response: "I couldn't find tutorials for that specific search. 🔍\n\nCould you try describing what you want to learn differently?",
                        conversationId: convId,
                    });
                }

                state.stage = 'results';
                conversationStates.set(convId, state);

                const skillText = state.skillLevel ? ` for ${state.skillLevel}s` : '';
                const response = `🎯 Found ${tutorials.length} great ${state.topic}${skillText} tutorials!\n\nHere are the best videos I've curated for you:`;

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

        // Default: shouldn't reach here, but handle gracefully
        return NextResponse.json({
            success: true,
            response: "I'm here to help you find tutorials! What would you like to learn?",
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
