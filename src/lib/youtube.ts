// YouTube Data API v3 integration
// Searches for tutorial videos and filters by quality/recency

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search';
const YOUTUBE_VIDEOS_URL = 'https://www.googleapis.com/youtube/v3/videos';

// ============================================
// Types
// ============================================

export interface YouTubeVideo {
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

interface YouTubeSearchItem {
    id: {
        videoId: string;
    };
    snippet: {
        title: string;
        description: string;
        thumbnails: {
            high?: { url: string };
            medium?: { url: string };
            default?: { url: string };
        };
        channelTitle: string;
        publishedAt: string;
    };
}

interface YouTubeVideoItem {
    id: string;
    statistics?: {
        viewCount: string;
    };
    contentDetails?: {
        duration: string;
    };
}

// ============================================
// Helper Functions
// ============================================

/**
 * Convert ISO 8601 duration to human-readable format
 */
function formatDuration(isoDuration: string): string {
    const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return '';

    const hours = match[1] ? `${match[1]}:` : '';
    const minutes = match[2] ? match[2].padStart(2, '0') : '00';
    const seconds = match[3] ? match[3].padStart(2, '0') : '00';

    return `${hours}${minutes}:${seconds}`;
}

/**
 * Format view count with K, M, B suffixes
 */
function formatViewCount(count: string): string {
    const num = parseInt(count, 10);
    if (num >= 1000000000) {
        return `${(num / 1000000000).toFixed(1)}B views`;
    }
    if (num >= 1000000) {
        return `${(num / 1000000).toFixed(1)}M views`;
    }
    if (num >= 1000) {
        return `${(num / 1000).toFixed(1)}K views`;
    }
    return `${num} views`;
}

// ============================================
// Main YouTube Service Functions
// ============================================

/**
 * Search YouTube for tutorial videos
 * @param query - Search query
 * @param maxResults - Number of results to return (5-7 recommended)
 * @returns Array of YouTube video objects
 */
export async function searchTutorials(
    query: string,
    maxResults: number = 7
): Promise<YouTubeVideo[]> {
    if (!YOUTUBE_API_KEY) {
        throw new Error('YouTube API key not configured');
    }

    // Build search query with tutorial keywords
    const enhancedQuery = `${query} tutorial`;

    // Search for videos
    const searchParams = new URLSearchParams({
        part: 'snippet',
        q: enhancedQuery,
        type: 'video',
        maxResults: String(Math.min(maxResults + 3, 15)), // Fetch extra for filtering
        order: 'relevance',
        relevanceLanguage: 'en',
        videoDuration: 'medium', // Filter out very short or very long videos
        videoDefinition: 'high', // Prefer HD videos
        key: YOUTUBE_API_KEY,
        // Only get videos published in the last 2 years for freshness
        publishedAfter: new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000).toISOString(),
    });

    try {
        const searchResponse = await fetch(`${YOUTUBE_SEARCH_URL}?${searchParams}`);

        if (!searchResponse.ok) {
            const error = await searchResponse.json();
            throw new Error(error.error?.message || 'YouTube search failed');
        }

        const searchData = await searchResponse.json();
        const items: YouTubeSearchItem[] = searchData.items || [];

        if (items.length === 0) {
            return [];
        }

        // Get video IDs for additional details
        const videoIds = items.map((item) => item.id.videoId).join(',');

        // Fetch video statistics and duration
        const videoParams = new URLSearchParams({
            part: 'statistics,contentDetails',
            id: videoIds,
            key: YOUTUBE_API_KEY,
        });

        const videoResponse = await fetch(`${YOUTUBE_VIDEOS_URL}?${videoParams}`);
        const videoData = await videoResponse.json();
        const videoDetails: Map<string, YouTubeVideoItem> = new Map();

        (videoData.items || []).forEach((item: YouTubeVideoItem) => {
            videoDetails.set(item.id, item);
        });

        // Map and enhance results
        const videos: YouTubeVideo[] = items.map((item) => {
            const details = videoDetails.get(item.id.videoId);
            return {
                id: item.id.videoId,
                title: item.snippet.title,
                description: item.snippet.description,
                thumbnail:
                    item.snippet.thumbnails.high?.url ||
                    item.snippet.thumbnails.medium?.url ||
                    item.snippet.thumbnails.default?.url ||
                    '',
                channelTitle: item.snippet.channelTitle,
                publishedAt: item.snippet.publishedAt,
                viewCount: details?.statistics?.viewCount
                    ? formatViewCount(details.statistics.viewCount)
                    : undefined,
                duration: details?.contentDetails?.duration
                    ? formatDuration(details.contentDetails.duration)
                    : undefined,
                url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
            };
        });

        // Sort by view count (popular videos are usually higher quality)
        videos.sort((a, b) => {
            const viewsA = parseInt(a.viewCount?.replace(/[^\d]/g, '') || '0', 10);
            const viewsB = parseInt(b.viewCount?.replace(/[^\d]/g, '') || '0', 10);
            return viewsB - viewsA;
        });

        // Return top results
        return videos.slice(0, maxResults);
    } catch (error) {
        console.error('YouTube search error:', error);
        throw error;
    }
}

/**
 * Generate clarifying questions based on user query
 * Returns questions to help narrow down the search
 */
export function generateClarifyingQuestions(query: string): string[] {
    const lowerQuery = query.toLowerCase();
    const questions: string[] = [];

    // Check for programming languages
    const languages = ['python', 'javascript', 'java', 'c++', 'rust', 'go', 'typescript', 'react', 'vue', 'angular'];
    const foundLanguages = languages.filter((lang) => lowerQuery.includes(lang));

    if (foundLanguages.length === 0 && (lowerQuery.includes('programming') || lowerQuery.includes('coding') || lowerQuery.includes('development'))) {
        questions.push('What programming language or framework are you interested in?');
    }

    // Check for skill level
    if (!lowerQuery.includes('beginner') && !lowerQuery.includes('advanced') && !lowerQuery.includes('intermediate')) {
        questions.push('What is your current skill level? (Beginner, Intermediate, or Advanced)');
    }

    // Check for specific goals
    if (!lowerQuery.includes('project') && !lowerQuery.includes('example') && !lowerQuery.includes('build')) {
        questions.push('Are you looking to build something specific, or learn concepts?');
    }

    return questions.slice(0, 2); // Return max 2 questions
}
