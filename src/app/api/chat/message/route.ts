// Chat message API endpoint
// POST /api/chat/message

import { NextRequest, NextResponse } from 'next/server';
import { chatMessageSchema, validateInput, sanitizeInput } from '@/lib/validation';
import { searchTutorials, generateClarifyingQuestions } from '@/lib/youtube';
import { verifyAccessToken } from '@/lib/auth';
import { checkRateLimit, recordAttempt, RATE_LIMITS, getClientIP } from '@/lib/rate-limit';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Simple state machine for conversation flow
interface ConversationState {
    stage: 'initial' | 'clarifying' | 'searching' | 'results';
    query: string;
    skillLevel?: string;
    buildGoal?: string;
}

// In-memory conversation states (for MVP - would use Redis in production)
const conversationStates = new Map<string, ConversationState>();

// Keywords to detect search intent
const SEARCH_KEYWORDS = ['find', 'search', 'looking for', 'tutorial', 'learn', 'how to', 'guide', 'video', 'teach', 'show me'];

// Keywords that suggest a follow-up question about the same topic
const FOLLOWUP_KEYWORDS = ['more', 'another', 'similar', 'like that', 'also', 'other', 'else', 'again', 'advanced', 'beginner'];

// Function to check if message is likely a new topic vs follow-up
function isNewTopic(message: string, previousQuery: string): boolean {
    const lowerMessage = message.toLowerCase();
    const lowerPrevious = previousQuery.toLowerCase();

    // If message contains follow-up keywords, it's probably not a new topic
    if (FOLLOWUP_KEYWORDS.some(kw => lowerMessage.includes(kw))) {
        return false;
    }

    // If message is asking about something completely different (no word overlap)
    const prevWords = new Set(lowerPrevious.split(/\s+/).filter(w => w.length > 3));
    const msgWords = lowerMessage.split(/\s+/).filter(w => w.length > 3);
    const overlap = msgWords.some(word => prevWords.has(word));

    // If there's no significant word overlap and message is clear, it's a new topic
    if (!overlap && msgWords.length > 2) {
        return true;
    }

    // Check if this looks like a new search request with search keywords
    if (SEARCH_KEYWORDS.some(kw => lowerMessage.includes(kw))) {
        // Has search keywords and different content
        return !overlap;
    }

    return false;
}

export async function POST(request: NextRequest) {
    try {
        // Rate limiting
        const clientIP = getClientIP(request.headers);
        const rateLimitKey = `chat:${clientIP}`;
        const rateLimit = await checkRateLimit(rateLimitKey, RATE_LIMITS.chat);

        if (!rateLimit.allowed) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Too many requests. Please slow down.',
                },
                { status: 429 }
            );
        }

        // Check authentication (optional for guest mode)
        const accessToken = request.cookies.get('accessToken')?.value;
        let isGuest = true;
        let userId = 'guest';

        if (accessToken) {
            const decoded = verifyAccessToken(accessToken);
            if (decoded) {
                isGuest = decoded.isGuest || false;
                userId = decoded.userId;
            }
        }

        // Parse and validate request body
        const body = await request.json();
        const validation = validateInput(chatMessageSchema, body);

        if (!validation.success) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Invalid message',
                    errors: validation.errors,
                },
                { status: 400 }
            );
        }

        const { message, conversationId } = validation.data;
        const sanitizedMessage = sanitizeInput(message);
        const lowerMessage = sanitizedMessage.toLowerCase();

        // Get or create conversation state
        const convId = conversationId || `${userId}_${Date.now()}`;
        let state = conversationStates.get(convId) || { stage: 'initial', query: '' };

        // Record rate limit attempt
        await recordAttempt(rateLimitKey, RATE_LIMITS.chat);

        // Check if user is starting a new topic when in results stage
        if ((state.stage === 'clarifying' || state.stage === 'results') && isNewTopic(sanitizedMessage, state.query)) {
            // User is asking about something new, reset to initial and treat as new search
            state = { stage: 'initial', query: '' };
        }

        // Handle different conversation stages
        if (state.stage === 'initial') {
            // Check if user is asking about tutorials
            const isSearchRequest = SEARCH_KEYWORDS.some(keyword => lowerMessage.includes(keyword));

            if (isSearchRequest || lowerMessage.length > 10) {
                // Generate clarifying questions
                const questions = generateClarifyingQuestions(sanitizedMessage);

                if (questions.length > 0) {
                    // Save state and ask clarifying questions
                    state = { stage: 'clarifying', query: sanitizedMessage };
                    conversationStates.set(convId, state);

                    return NextResponse.json({
                        success: true,
                        response: `Great! I'd like to find the best tutorials for you. Let me ask a few quick questions:\n\n${questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}`,
                        clarifyingQuestions: questions,
                        conversationId: convId,
                    });
                } else {
                    // No clarifying questions needed, search directly
                    state = { stage: 'searching', query: sanitizedMessage };
                }
            } else {
                // General greeting or unclear intent
                return NextResponse.json({
                    success: true,
                    response: "👋 Hi! I'm LinkMe, your tutorial discovery assistant.\n\nTell me what you'd like to learn, and I'll find the best tutorial videos for you. For example:\n\n• \"I want to learn React for beginners\"\n• \"Find Python data science tutorials\"\n• \"How to build a website with Next.js\"",
                    conversationId: convId,
                });
            }
        }

        if (state.stage === 'clarifying') {
            // User is answering clarifying questions, enhance the query
            const enhancedQuery = `${state.query} ${sanitizedMessage}`;
            state = { stage: 'searching', query: enhancedQuery };
        }

        if (state.stage === 'searching' || state.stage === 'results') {
            // For results stage with non-new-topic messages, use the new message as search enhancement
            const searchQuery = state.stage === 'results' ?
                `${state.query} ${sanitizedMessage}` : state.query;

            // Search for tutorials
            try {
                const tutorials = await searchTutorials(searchQuery, 7);

                if (tutorials.length === 0) {
                    state = { stage: 'initial', query: '' };
                    conversationStates.set(convId, state);

                    return NextResponse.json({
                        success: true,
                        response: "I couldn't find any tutorials matching your request. Could you try rephrasing or being more specific about what you'd like to learn?",
                        conversationId: convId,
                    });
                }

                // Update state to results
                state = { stage: 'results', query: searchQuery };
                conversationStates.set(convId, state);

                const response = `🎯 I found ${tutorials.length} great tutorials for you!\n\nHere are the best videos I've curated based on quality and relevance:`;

                return NextResponse.json({
                    success: true,
                    response,
                    tutorials,
                    conversationId: convId,
                });
            } catch (error) {
                console.error('YouTube search error:', error);
                return NextResponse.json(
                    {
                        success: false,
                        message: 'Failed to search for tutorials. Please try again.',
                    },
                    { status: 500 }
                );
            }
        }

        // Default response
        return NextResponse.json({
            success: true,
            response: "I'm here to help you find the best tutorials! What would you like to learn today?",
            conversationId: convId,
        });
    } catch (error) {
        console.error('Chat error:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'An error occurred',
            },
            { status: 500 }
        );
    }
}
