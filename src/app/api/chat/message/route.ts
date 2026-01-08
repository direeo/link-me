// Chat message API endpoint
// POST /api/chat/message
// Powered by Google Gemini AI for intelligent conversations

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { chatMessageSchema, validateInput, sanitizeInput } from '@/lib/validation';
import { searchTutorials, YouTubeVideo } from '@/lib/youtube';
import { verifyAccessToken } from '@/lib/auth';
import { checkRateLimit, recordAttempt, RATE_LIMITS, getClientIP } from '@/lib/rate-limit';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

// ============================================
// Gemini AI Setup
// ============================================

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

function getGeminiModel() {
    if (!GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY not configured');
    }
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    return genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
}

// ============================================
// Conversation State
// ============================================

interface ConversationMessage {
    role: 'user' | 'assistant';
    content: string;
}

interface ConversationState {
    messages: ConversationMessage[];
    searchReady: boolean;
    searchQuery?: string;
    skillLevel?: string;
    goal?: string;
}

const conversationStates = new Map<string, ConversationState>();

// ============================================
// System Prompt for Gemini
// ============================================

const SYSTEM_PROMPT = `You are LinkMe, a friendly tutorial discovery assistant. Your job is to help users find the perfect tutorial videos for what they want to learn.

IMPORTANT RULES:
1. Be warm, friendly, and conversational - like a helpful friend
2. ALWAYS ask personalization questions before searching (one at a time):
   - First: What they want to learn (if not already clear)
   - Second: Their skill level (beginner/intermediate/advanced)  
   - Third: Their learning goal (build a project, learn concepts, or quick overview)
3. Keep responses SHORT and natural - no long paragraphs
4. Never use markdown formatting like ** or * - just plain text
5. Use emojis sparingly to be friendly
6. Handle greetings naturally - respond warmly and ask what they want to learn

When you have gathered enough information (topic + skill level + goal), respond with EXACTLY this format on a new line:
[SEARCH_READY: topic="the topic"|level="beginner/intermediate/advanced"|goal="project/concepts/quick"]

Example conversation:
User: hey
You: Hey there! 👋 I'm LinkMe, your tutorial discovery assistant. What would you like to learn today?

User: python
You: Nice choice! Python is super versatile. What's your experience level - are you a complete beginner, somewhere in the middle, or already pretty experienced?

User: beginner
You: Perfect! And what's your goal - do you want to build something specific, understand the core concepts deeply, or just get a quick overview to start?

User: i want to build a game
You: Awesome! Building a game is a great way to learn Python! Let me find the best beginner Python game development tutorials for you.
[SEARCH_READY: topic="Python game development"|level="beginner"|goal="project"]

Remember: Be natural, be helpful, and gather info conversationally!`;

// ============================================
// Parse Gemini Response for Search Intent
// ============================================

function parseSearchIntent(response: string): { searchReady: boolean; topic?: string; level?: string; goal?: string; cleanResponse: string } {
    const searchMatch = response.match(/\[SEARCH_READY:\s*topic="([^"]+)"\|level="([^"]+)"\|goal="([^"]+)"\]/);

    if (searchMatch) {
        const cleanResponse = response.replace(/\[SEARCH_READY:.*?\]/g, '').trim();
        return {
            searchReady: true,
            topic: searchMatch[1],
            level: searchMatch[2],
            goal: searchMatch[3],
            cleanResponse
        };
    }

    return { searchReady: false, cleanResponse: response };
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
        let state = conversationStates.get(convId) || { messages: [], searchReady: false };

        await recordAttempt(rateLimitKey, RATE_LIMITS.chat);

        // Add user message to history
        state.messages.push({ role: 'user', content: userMessage });

        // Check if Gemini is configured
        if (!GEMINI_API_KEY) {
            // Fallback to simple response if no API key
            return NextResponse.json({
                success: true,
                response: "Hi! I'm LinkMe. To enable smart conversations, please configure your GEMINI_API_KEY. For now, you can search directly on YouTube!",
                conversationId: convId,
            });
        }

        try {
            // Build conversation history for Gemini
            const model = getGeminiModel();

            const conversationHistory = state.messages.map(m =>
                `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`
            ).join('\n\n');

            const prompt = `${SYSTEM_PROMPT}\n\n--- CONVERSATION SO FAR ---\n${conversationHistory}\n\n--- YOUR RESPONSE ---\nRespond naturally to the user's last message. Remember the rules!`;

            const result = await model.generateContent(prompt);
            const geminiResponse = result.response.text();

            // Parse the response for search intent
            const parsed = parseSearchIntent(geminiResponse);

            // Add assistant response to history
            state.messages.push({ role: 'assistant', content: parsed.cleanResponse });

            // If ready to search, do it!
            let tutorials: YouTubeVideo[] | undefined;

            if (parsed.searchReady && parsed.topic) {
                state.searchReady = true;
                state.searchQuery = parsed.topic;
                state.skillLevel = parsed.level;
                state.goal = parsed.goal;

                // Build search query
                let query = parsed.topic;
                if (parsed.level === 'beginner') query += ' tutorial for beginners';
                else if (parsed.level === 'advanced') query += ' advanced tutorial';
                else query += ' tutorial';

                if (parsed.goal === 'project') query += ' project';
                else if (parsed.goal === 'quick') query += ' crash course';

                try {
                    tutorials = await searchTutorials(query, 7);

                    // Save for logged-in users
                    if (isLoggedIn && tutorials.length > 0) {
                        try {
                            const db = getDb();
                            await db.chatHistory.create({
                                data: {
                                    userId,
                                    messages: JSON.stringify({
                                        topic: parsed.topic,
                                        skillLevel: parsed.level,
                                        goal: parsed.goal,
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
                } catch (searchError) {
                    console.error('YouTube search error:', searchError);
                }
            }

            conversationStates.set(convId, state);

            return NextResponse.json({
                success: true,
                response: parsed.cleanResponse,
                tutorials,
                conversationId: convId,
            });

        } catch (geminiError) {
            console.error('Gemini API error:', geminiError);

            // Fallback response
            return NextResponse.json({
                success: true,
                response: "I'm having trouble thinking right now. Could you try again?",
                conversationId: convId,
            });
        }

    } catch (error) {
        console.error('Chat error:', error);
        return NextResponse.json({
            success: false,
            message: 'Something went wrong. Please try again.',
        }, { status: 500 });
    }
}
