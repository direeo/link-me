// Chat message API endpoint
// POST /api/chat/message
// Powered by Google Gemini AI for intelligent conversations

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { chatMessageSchema, validateInput, sanitizeInput } from '@/lib/validation';
import { searchTutorials, YouTubeVideo } from '@/lib/youtube';
import { analyzeAndCurateVideos, LearningPath, formatLearningPathAsText } from '@/lib/curriculum';
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
    return genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
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

const SYSTEM_PROMPT = `You are LinkMe, a friendly and SMART tutorial discovery assistant. Your job is to help users find the perfect tutorial videos.

YOUR CORE SKILLS:
1. UNDERSTAND INTENT - Users don't always ask clearly. Infer what they mean:
   - "python" → they want to learn Python
   - "I suck at cooking" → they want beginner cooking tutorials
   - "react is confusing" → they need React help, probably intermediate level
   - "wanna build an app" → they want app development tutorials
   - "js pls" → they want JavaScript tutorials
   - "need help with my resume" → they want resume/career tutorials

2. INFER SKILL LEVEL from context when possible:
   - "I'm new to..." / "never done..." / "first time" → beginner
   - "I know basics but..." / "want to improve" → intermediate  
   - "advanced" / "deep dive" / "optimization" → advanced
   - If unclear, ASK naturally: "Are you just starting out or have some experience?"

3. INFER GOAL from context when possible:
   - "build" / "make" / "create" → project-based
   - "understand" / "learn" / "how does X work" → concepts
   - "quick" / "fast" / "crash course" → quick overview
   - If unclear, ASK naturally: "Looking for a deep dive or quick overview?"

4. BE CONVERSATIONAL - Handle ANY input naturally:
   - Typos: "pythin" = Python, "javasript" = JavaScript
   - Slang: "wanna", "gonna", "pls" are normal
   - Frustration: "this is so hard" → be encouraging
   - Multiple topics: "python and javascript" → ask which to start with
   - Vague: "something fun" → ask what areas interest them
   - Greetings: "hi", "hey", "hello" → greet back warmly, ask what to learn

5. GATHER INFO EFFICIENTLY:
   - If user gives topic + level + goal in one message, go straight to search
   - Don't ask questions you can already infer
   - Maximum 2-3 exchanges before searching

RESPONSE RULES:
- Keep responses SHORT (1-3 sentences max)
- Be warm and friendly, use occasional emojis
- Never use markdown formatting (no ** or *)
- Match the user's energy and style

WHEN READY TO SEARCH:
Once you have: topic + skill level (or can infer) + goal (or can infer)
Output this EXACTLY on a new line at the end:
[SEARCH_READY: topic="EXACT TOPIC"|level="beginner/intermediate/advanced"|goal="project/concepts/quick"]

EXAMPLES OF SMART INFERENCE:

User: "I want to learn to code"
You: Awesome choice! 🚀 Any language catching your eye, or want me to suggest one?

User: "react is killing me"
You: I feel you, React can be tricky! What's giving you trouble - the basics, hooks, or something else?

User: "beginner python projects"
You: Perfect! Let me find some great beginner Python project tutorials for you.
[SEARCH_READY: topic="Python projects"|level="beginner"|goal="project"]

User: "teach me guitar from scratch"
You: Love it! 🎸 Let me find the best beginner guitar tutorials for you.
[SEARCH_READY: topic="guitar"|level="beginner"|goal="concepts"]

User: "I know some JavaScript but need to get better at async/await"
You: Good call - async can be confusing! Let me find intermediate JavaScript async tutorials.
[SEARCH_READY: topic="JavaScript async await"|level="intermediate"|goal="concepts"]

User: "quick photoshop basics"
You: Got it! Quick Photoshop crash course coming up!
[SEARCH_READY: topic="Photoshop"|level="beginner"|goal="quick"]

Be smart, be natural, help users learn!`;


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

            console.log('=== GEMINI RAW RESPONSE ===');
            console.log(geminiResponse);
            console.log('=== END RAW RESPONSE ===');

            // Parse the response for search intent
            const parsed = parseSearchIntent(geminiResponse);

            console.log('=== PARSED RESULT ===');
            console.log('searchReady:', parsed.searchReady);
            console.log('topic:', parsed.topic);
            console.log('level:', parsed.level);
            console.log('goal:', parsed.goal);
            console.log('=== END PARSED ===');

            // Add assistant response to history
            state.messages.push({ role: 'assistant', content: parsed.cleanResponse });

            // If ready to search, do it!
            let tutorials: YouTubeVideo[] | undefined;
            let learningPath: LearningPath | null = null;

            if (parsed.searchReady && parsed.topic) {
                state.searchReady = true;
                state.searchQuery = parsed.topic;
                state.skillLevel = parsed.level;
                state.goal = parsed.goal;

                // Build search query
                let query = parsed.topic + ' tutorial';
                if (parsed.level === 'beginner') query += ' for beginners';
                else if (parsed.level === 'advanced') query += ' advanced';

                console.log('=== FETCHING VIDEOS FOR AI CURATION ===');
                console.log('Topic:', parsed.topic);
                console.log('Level:', parsed.level);
                console.log('Goal:', parsed.goal);
                console.log('Query:', query);

                try {
                    // Fetch MORE videos for AI to analyze and curate
                    tutorials = await searchTutorials(query, 15);

                    console.log('Videos fetched:', tutorials.length);

                    // Use AI to analyze and create learning path (with fallback)
                    if (tutorials.length > 0) {
                        try {
                            learningPath = await analyzeAndCurateVideos(
                                tutorials,
                                parsed.topic || '',
                                parsed.level || 'beginner',
                                parsed.goal || 'learn'
                            );

                            if (learningPath) {
                                console.log('Learning path generated with', learningPath.totalVideos, 'curated videos');
                            }
                        } catch (curateError) {
                            console.log('Learning path failed (rate limit?), using raw videos');
                            learningPath = null;
                            // Still continue with raw tutorials as fallback
                        }
                    } else {
                        // No tutorials found - provide helpful message
                        console.log('No tutorials found for query:', query);
                    }

                    // Save for logged-in users
                    if (isLoggedIn && (learningPath || tutorials.length > 0)) {
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
                                        learningPath: learningPath ? {
                                            totalVideos: learningPath.totalVideos,
                                            stages: learningPath.stages.length,
                                            summary: learningPath.summary,
                                        } : null,
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
                    // Provide a helpful message to the user
                    return NextResponse.json({
                        success: true,
                        response: `${parsed.cleanResponse}\n\n⚠️ I found some issues searching for "${parsed.topic}" tutorials. This might be a temporary issue - please try again, or try rephrasing your topic.`,
                        conversationId: convId,
                    });
                }
            }

            conversationStates.set(convId, state);

            // Build response with learning path if available
            let responseText = parsed.cleanResponse;
            if (learningPath && learningPath.stages.length > 0) {
                responseText = parsed.cleanResponse + '\n\n' + formatLearningPathAsText(learningPath);
            } else if (parsed.searchReady && (!tutorials || tutorials.length === 0)) {
                // No tutorials found - provide helpful suggestions
                responseText = `${parsed.cleanResponse}

🔍 I couldn't find tutorials specifically for "${parsed.topic}". This could be a very niche topic, or it might be phrased unusually.

💡 **Try these suggestions:**
• Use more common terms (e.g., "PID control" instead of "control systems")
• Be more specific about what aspect you want to learn
• Try breaking it down into smaller topics

What would you like to try?`;
            }

            return NextResponse.json({
                success: true,
                response: responseText,
                tutorials: learningPath ? undefined : tutorials, // Only send raw tutorials if no learning path
                learningPath,
                conversationId: convId,
            });


        } catch (geminiError) {
            console.error('Gemini API error:', geminiError);

            // Fallback response - more helpful
            const errorMessage = geminiError instanceof Error ? geminiError.message : 'Unknown error';
            const isRateLimit = errorMessage.toLowerCase().includes('rate') || errorMessage.toLowerCase().includes('quota');

            return NextResponse.json({
                success: true,
                response: isRateLimit
                    ? "🔄 I'm a bit overwhelmed right now! Please wait a moment and try again."
                    : "I had a small hiccup processing that. Could you rephrase or try again?",
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
