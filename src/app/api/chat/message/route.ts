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
    timestamp?: string;
}

interface ConversationState {
    messages: ConversationMessage[];
    searchReady: boolean;
    searchQuery?: string;
    skillLevel?: string;
    goal?: string;
}

const conversationStates = new Map<string, ConversationState>();

async function hydrateStateFromHistory(historyId: string, userId: string): Promise<ConversationState | null> {
    try {
        const db = getDb();
        const entry = await db.chatHistory.findUnique({
            where: { id: historyId, userId },
        });
        if (!entry) return null;

        const data = JSON.parse(entry.messages);
        const messages = Array.isArray(data.messages)
            ? data.messages.map((msg: any) => ({ role: msg.role, content: msg.content }))
            : [];

        return {
            messages,
            searchReady: !!data.searchReady,
            searchQuery: data.query,
            skillLevel: data.skillLevel,
            goal: data.goal,
        };
    } catch (error) {
        console.warn('Failed to hydrate conversation state from history:', error);
        return null;
    }
}

// ============================================
// System Prompt for Gemini
// ============================================

const SYSTEM_PROMPT = `You are LinkMe, a friendly and SMART tutorial discovery assistant. Your job is to help users find the perfect tutorial videos tailored to their exact experience level.

YOUR CORE SKILLS:
1. UNDERSTAND INTENT - Users don't always ask clearly. Infer what they mean:
   - "python" → they want to learn Python
   - "I suck at cooking" → they want beginner cooking tutorials
   - "react is confusing" → they need React help
   - "wanna build an app" → they want app development tutorials
   - "js pls" → they want JavaScript tutorials
   - "need help with my resume" → they want resume/career tutorials

2. ALWAYS ASSESS SKILL LEVEL with a specific, concrete question:
   - NEVER assume. ALWAYS ask one targeted question to gauge experience.
   - Ask about CONCRETE experience, not just "beginner/intermediate/advanced":
     * For programming: "Have you written any code before? Like a simple script or followed a tutorial?"
     * For cooking: "Do you cook at all, or would this literally be your first time in the kitchen?"
     * For music: "Have you ever played an instrument before, or is this completely new?"
     * For design: "Have you used any design tools like Canva or Figma, even casually?"
   - ONLY skip this question if the user EXPLICITLY states their level (e.g., "I'm a complete beginner", "I've been coding for 2 years", "I know the basics but...")

3. INFER OR ASK ABOUT GOAL:
   - "build" / "make" / "create" → project-based (don't ask)
   - "understand" / "learn" / "how does X work" → concepts (don't ask)
   - "quick" / "fast" / "crash course" → quick (don't ask)
   - If unclear after knowing level, ask: "Are you working toward a specific project, or just want to understand how it works?"

4. BE CONVERSATIONAL - Handle ANY input naturally:
   - Typos: "pythin" = Python, "javasript" = JavaScript
   - Slang: "wanna", "gonna", "pls" are normal
   - Frustration: "this is so hard" → be encouraging first, then ask what aspect is tricky
   - Multiple topics: "python and javascript" → ask which to focus on first
   - Vague: "something fun" → ask what areas interest them
   - Greetings: "hi", "hey", "hello" → greet back warmly, ask what to learn

5. GATHER INFO EFFICIENTLY:
   - Exchange 1: User states topic → Ask ONE specific skill-level question
   - Exchange 2: User answers → If goal is clear, search. If not, ask one goal question
   - Exchange 3: Search immediately - no more than 3 exchanges total
   - If user gives topic + explicit level + goal in one message, go straight to search

RESPONSE RULES:
- Keep responses SHORT (1-3 sentences max)
- Be warm and friendly, do not use emojis
- Never use markdown formatting (no ** or *)
- Match the user's energy and style
- One question at a time - never ask two questions in the same message

WHEN READY TO SEARCH:
Once you have: topic + skill level + goal (can infer if not stated)
Output this EXACTLY on a new line at the end:
[SEARCH_READY: topic="EXACT TOPIC"|level="beginner/intermediate/advanced"|goal="project/concepts/quick"]

EXAMPLES OF SMART SKILL ASSESSMENT:

User: "I want to learn Python"
You: Nice, Python is a great choice! Have you done any coding before, even something simple like HTML or a basic script?

User: "yeah I've done a bit of JavaScript"
You: Perfect, that gives you a solid base. Are you looking to build something specific with Python, or just get comfortable with the language first?

User: "I want to build stuff"
You: Got it, let me put together a Python project tutorial path for you.
[SEARCH_READY: topic="Python projects for beginners"|level="beginner"|goal="project"]

---

User: "teach me guitar"
You: Awesome! Have you ever played any instrument before, or is this your first time?

User: "never played anything"
You: Perfect starting point! Let me find the best beginner guitar tutorials for you.
[SEARCH_READY: topic="guitar for absolute beginners"|level="beginner"|goal="concepts"]

---

User: "react is killing me, hooks make no sense"
You: Hooks can definitely feel overwhelming! Have you been working with React for a while, or are you fairly new to it?

User: "I know basic React, been using it a few months"
You: Got it, you have the foundation - let me find some solid tutorials specifically on React hooks.
[SEARCH_READY: topic="React hooks tutorial"|level="intermediate"|goal="concepts"]

---

User: "I've been coding for 5 years and want to learn machine learning"
You: With that background, you are well set up for this! Are you looking to understand ML theory, or dive straight into building models?

User: "build models"
You: Let me find some advanced machine learning project tutorials for you.
[SEARCH_READY: topic="machine learning projects"|level="advanced"|goal="project"]

---

User: "quick photoshop basics, I'm new to it"
You: Got it, quick Photoshop intro coming up.
[SEARCH_READY: topic="Photoshop basics for beginners"|level="beginner"|goal="quick"]

Be smart, be specific, help users learn!`;


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
        let state = conversationStates.get(convId);

        // If no in-memory state and we have a conversationId (could be a history ID), hydrate from DB
        if (!state && conversationId && isLoggedIn) {
            const hydrated = await hydrateStateFromHistory(conversationId, userId);
            if (hydrated) {
                state = hydrated;
                conversationStates.set(convId, state);
            }
        }

        if (!state) {
            state = { messages: [], searchReady: false };
        }

        await recordAttempt(rateLimitKey, RATE_LIMITS.chat);

        // Add user message to history
        state.messages.push({ role: 'user', content: userMessage, timestamp: new Date().toISOString() });

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
            state.messages.push({ role: 'assistant', content: parsed.cleanResponse, timestamp: new Date().toISOString() });

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
                            
                            // Prepare the payload with ONLY serializable data
                            const historyPayload = {
                                messages: state.messages.map((msg: any) => ({
                                    role: msg.role,
                                    content: msg.content,
                                    timestamp: msg.timestamp || new Date().toISOString(),
                                })),
                                topic: parsed.topic,
                                skillLevel: parsed.level,
                                goal: parsed.goal,
                                query,
                                tutorials: learningPath ? undefined : (tutorials || []).map((vid: any) => ({
                                    id: vid.id,
                                    videoId: vid.videoId || vid.id,
                                    title: vid.title,
                                    description: vid.description || '',
                                    thumbnail: vid.thumbnail || '',
                                    url: vid.url,
                                    channelTitle: vid.channelTitle,
                                    publishedAt: vid.publishedAt,
                                    viewCount: vid.viewCount,
                                    duration: vid.duration,
                                })),
                                learningPath: learningPath ? {
                                    topic: learningPath.topic,
                                    userLevel: learningPath.userLevel,
                                    userGoal: learningPath.userGoal,
                                    totalVideos: learningPath.totalVideos,
                                    estimatedTotalTime: learningPath.estimatedTotalTime,
                                    completionGoals: learningPath.completionGoals || [],
                                    summary: learningPath.summary || '',
                                    stages: learningPath.stages?.map((stage: any) => ({
                                        stageName: stage.stageName,
                                        stageNumber: stage.stageNumber,
                                        description: stage.description,
                                        videos: stage.videos?.map((vid: any) => ({
                                            videoId: vid.videoId || vid.id,
                                            title: vid.title,
                                            qualityScore: vid.qualityScore,
                                            difficulty: vid.difficulty,
                                            conceptsCovered: vid.conceptsCovered || [],
                                            learningOutcomes: vid.learningOutcomes || [],
                                            prerequisites: vid.prerequisites || [],
                                            whyRecommended: vid.whyRecommended || '',
                                            estimatedTime: vid.estimatedTime || '',
                                            order: vid.order,
                                        })) || [],
                                    })) || [],
                                } : null,
                                timestamp: new Date().toISOString(),
                                tutorialCount: learningPath ? learningPath.totalVideos : (tutorials ? tutorials.length : 0),
                            };

                            // Verify data is JSON serializable
                            const testSerialize = JSON.stringify(historyPayload);
                            console.log('History payload serialization successful, size:', testSerialize.length);

                            await db.chatHistory.create({
                                data: {
                                    userId,
                                    messages: testSerialize,
                                },
                            });
                            console.log('Chat history saved successfully');
                        } catch (err) {
                            console.error('Failed to save chat history:', err);
                        }
                    }
                } catch (searchError) {
                    console.error('YouTube search error:', searchError);
                    // Provide a helpful message to the user
                    return NextResponse.json({
                        success: true,
                        response: `${parsed.cleanResponse}\n\nI found some issues searching for "${parsed.topic}" tutorials. This might be a temporary issue - please try again, or try rephrasing your topic.`,
                        conversationId: convId,
                    });
                }
            }

            conversationStates.set(convId, state);

            // Build response with learning path if available
            // Note: when learningPath is present, the LearningPath component renders the rich view,
            // so we only use the clean response text here (no redundant plain-text listing).
            let responseText = parsed.cleanResponse;
            if (parsed.searchReady && (!tutorials || tutorials.length === 0) && !learningPath) {
                // No tutorials found - provide helpful suggestions
                responseText = `${parsed.cleanResponse}

I couldn't find tutorials specifically for "${parsed.topic}". This could be a very niche topic, or it might be phrased unusually.

Try these suggestions:
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
                    ? "I'm handling a lot of requests right now. Please wait a moment and try again."
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
