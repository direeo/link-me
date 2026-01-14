// Curriculum Generation with AI Analysis
// Uses Gemini to analyze videos and create structured learning paths

import { GoogleGenerativeAI } from '@google/generative-ai';
import { YouTubeVideo } from './youtube';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// ============================================
// Types
// ============================================

export interface VideoAnalysis {
    videoId: string;
    title: string;
    qualityScore: number;        // 1-10 educational value
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    conceptsCovered: string[];   // Key concepts in this video
    learningOutcomes: string[];  // What you'll learn
    prerequisites: string[];     // What you should know first
    whyRecommended: string;      // Why AI picked this video
    estimatedTime: string;       // Video duration
    order: number;               // Recommended watch order
}

export interface LearningStage {
    stageName: string;           // e.g., "Foundations", "Core Skills", "Projects"
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
    completionGoals: string[];   // What user will achieve after completing
    summary: string;             // AI summary of this learning path
}

// ============================================
// Gemini Model Setup
// ============================================

function getGeminiModel() {
    if (!GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY not configured');
    }
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    return genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
}

// ============================================
// Video Analysis Prompt
// ============================================

const ANALYSIS_PROMPT = `You are an expert educational curator. Analyze these YouTube tutorial videos and create a structured learning path.

USER CONTEXT:
- Topic: {TOPIC}
- Current Level: {LEVEL}
- Learning Goal: {GOAL}

VIDEOS TO ANALYZE:
{VIDEOS}

TASK: Create a personalized learning curriculum. Return ONLY valid JSON in this exact format:

{
  "summary": "Brief 1-2 sentence description of this learning path",
  "estimatedTotalTime": "X hours Y minutes",
  "completionGoals": [
    "What user will be able to do after completing",
    "Another skill they'll gain"
  ],
  "stages": [
    {
      "stageName": "Stage 1: Foundations",
      "stageNumber": 1,
      "description": "Brief description of this stage",
      "videos": [
        {
          "videoId": "abc123",
          "order": 1,
          "qualityScore": 9,
          "difficulty": "beginner",
          "conceptsCovered": ["concept1", "concept2"],
          "learningOutcomes": ["You'll learn X", "You'll understand Y"],
          "prerequisites": [],
          "whyRecommended": "Clear explanations, perfect pace for beginners"
        }
      ]
    }
  ]
}

RULES:
1. Only include videos that are ACTUALLY educational and relevant to the topic
2. Remove spam, unrelated content, or low-quality videos
3. Order videos from easiest to hardest within each stage
4. Group into 2-4 stages: Foundations, Core Skills, and optionally Advanced/Projects
5. Each video should build on concepts from previous videos
6. Be honest about quality scores - not all videos deserve a 9 or 10
7. If a video is irrelevant or low quality, exclude it entirely
8. Include 5-12 videos total (quality over quantity)

Return ONLY the JSON, no markdown code blocks or explanations.`;

// ============================================
// Main Analysis Function
// ============================================

export async function analyzeAndCurateVideos(
    videos: YouTubeVideo[],
    topic: string,
    userLevel: string,
    userGoal: string
): Promise<LearningPath | null> {
    if (!GEMINI_API_KEY || videos.length === 0) {
        return null;
    }

    try {
        const model = getGeminiModel();

        // Format videos for the prompt
        const videosText = videos.map((v, i) =>
            `${i + 1}. [ID: ${v.id}] "${v.title}" by ${v.channelTitle} | ${v.duration || 'Unknown'} | ${v.viewCount || 'Unknown views'}\n   Description: ${v.description.substring(0, 200)}...`
        ).join('\n\n');

        // Build the prompt
        const prompt = ANALYSIS_PROMPT
            .replace('{TOPIC}', topic)
            .replace('{LEVEL}', userLevel)
            .replace('{GOAL}', userGoal)
            .replace('{VIDEOS}', videosText);

        console.log('=== ANALYZING VIDEOS FOR CURRICULUM ===');
        console.log('Topic:', topic, '| Level:', userLevel, '| Goal:', userGoal);
        console.log('Videos to analyze:', videos.length);

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Parse JSON response
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            console.error('Failed to parse curriculum JSON from Gemini');
            return null;
        }

        const analysis = JSON.parse(jsonMatch[0]);

        // Build the learning path
        const learningPath: LearningPath = {
            topic,
            userLevel,
            userGoal,
            totalVideos: 0,
            estimatedTotalTime: analysis.estimatedTotalTime || 'Unknown',
            stages: [],
            completionGoals: analysis.completionGoals || [],
            summary: analysis.summary || ''
        };

        // Process stages and match with original video data
        for (const stage of analysis.stages || []) {
            const processedStage: LearningStage = {
                stageName: stage.stageName,
                stageNumber: stage.stageNumber,
                description: stage.description,
                videos: []
            };

            for (const videoAnalysis of stage.videos || []) {
                // Find the original video data
                const originalVideo = videos.find(v => v.id === videoAnalysis.videoId);
                if (originalVideo) {
                    processedStage.videos.push({
                        videoId: originalVideo.id,
                        title: originalVideo.title,
                        qualityScore: videoAnalysis.qualityScore || 7,
                        difficulty: videoAnalysis.difficulty || 'beginner',
                        conceptsCovered: videoAnalysis.conceptsCovered || [],
                        learningOutcomes: videoAnalysis.learningOutcomes || [],
                        prerequisites: videoAnalysis.prerequisites || [],
                        whyRecommended: videoAnalysis.whyRecommended || 'Relevant to your learning goals',
                        estimatedTime: originalVideo.duration || 'Unknown',
                        order: videoAnalysis.order || 1
                    });
                    learningPath.totalVideos++;
                }
            }

            if (processedStage.videos.length > 0) {
                learningPath.stages.push(processedStage);
            }
        }

        console.log('=== CURRICULUM GENERATED ===');
        console.log('Stages:', learningPath.stages.length);
        console.log('Total videos:', learningPath.totalVideos);

        return learningPath;

    } catch (error) {
        console.error('Error analyzing videos:', error);
        return null;
    }
}

// ============================================
// Format Learning Path for Display
// ============================================

export function formatLearningPathAsText(path: LearningPath): string {
    if (!path || path.stages.length === 0) {
        return '';
    }

    const lines: string[] = [];

    lines.push(`🎓 YOUR PERSONALIZED ${path.topic.toUpperCase()} LEARNING PATH`);
    lines.push('');
    lines.push(path.summary);
    lines.push(`📊 ${path.totalVideos} videos | ⏱️ ${path.estimatedTotalTime}`);
    lines.push('');

    for (const stage of path.stages) {
        lines.push('━'.repeat(45));
        lines.push(`📍 ${stage.stageName.toUpperCase()}`);
        lines.push(stage.description);
        lines.push('━'.repeat(45));
        lines.push('');

        for (const video of stage.videos) {
            lines.push(`${video.order}️⃣ "${video.title}"`);
            lines.push(`   ⏱️ ${video.estimatedTime} | ⭐ Quality: ${video.qualityScore}/10`);
            lines.push('');
            lines.push(`   📚 CONCEPTS: ${video.conceptsCovered.join(', ')}`);
            lines.push(`   🎯 YOU'LL LEARN: ${video.learningOutcomes.slice(0, 2).join('; ')}`);
            lines.push(`   💡 WHY THIS: ${video.whyRecommended}`);
            lines.push('');
        }
    }

    if (path.completionGoals.length > 0) {
        lines.push('━'.repeat(45));
        lines.push('🏁 AFTER COMPLETING THIS PATH, YOU\'LL BE ABLE TO:');
        lines.push('━'.repeat(45));
        for (const goal of path.completionGoals) {
            lines.push(`✓ ${goal}`);
        }
    }

    return lines.join('\n');
}
