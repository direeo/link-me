// YouTube Playlist management utilities
// Creates and manages playlists from learning paths

import { youtube_v3 } from 'googleapis';
import { getAuthenticatedClient } from './youtube-auth';
import { getDb } from './db';

type YouTubeAPI = youtube_v3.Youtube;

/**
 * Create a new YouTube playlist
 */
export async function createPlaylist(
    youtube: YouTubeAPI,
    title: string,
    description: string
): Promise<string> {
    const response = await youtube.playlists.insert({
        part: ['snippet', 'status'],
        requestBody: {
            snippet: {
                title,
                description,
            },
            status: {
                privacyStatus: 'private', // Start as private, user can make public
            },
        },
    });

    const playlistId = response.data.id;
    if (!playlistId) {
        throw new Error('Failed to create playlist');
    }

    return playlistId;
}

/**
 * Add a video to a playlist
 */
export async function addVideoToPlaylist(
    youtube: YouTubeAPI,
    playlistId: string,
    videoId: string
): Promise<void> {
    await youtube.playlistItems.insert({
        part: ['snippet'],
        requestBody: {
            snippet: {
                playlistId,
                resourceId: {
                    kind: 'youtube#video',
                    videoId,
                },
            },
        },
    });
}

/**
 * Add multiple videos to a playlist
 */
export async function addVideosToPlaylist(
    youtube: YouTubeAPI,
    playlistId: string,
    videoIds: string[]
): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (const videoId of videoIds) {
        try {
            await addVideoToPlaylist(youtube, playlistId, videoId);
            success++;
            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
            console.error(`Failed to add video ${videoId}:`, error);
            failed++;
        }
    }

    return { success, failed };
}

/**
 * Export a saved learning path to a YouTube playlist
 */
export async function exportLearningPathToPlaylist(
    userId: string,
    learningPathId: string,
    customTitle?: string
): Promise<{
    success: boolean;
    playlistId?: string;
    playlistUrl?: string;
    videosAdded?: number;
    videosFailed?: number;
    error?: string;
}> {
    const prisma = getDb();

    // Get authenticated YouTube client
    const auth = await getAuthenticatedClient(userId);
    if (!auth) {
        return {
            success: false,
            error: 'YouTube account not connected. Please connect in Settings.',
        };
    }

    // Get the learning path
    const learningPath = await prisma.savedLearningPath.findUnique({
        where: { id: learningPathId },
    });

    if (!learningPath || learningPath.userId !== userId) {
        return {
            success: false,
            error: 'Learning path not found',
        };
    }

    try {
        // Parse the stages to get video IDs
        const stages = JSON.parse(learningPath.stages);
        const videoIds: string[] = [];

        for (const stage of stages) {
            for (const video of stage.videos || []) {
                if (video.videoId) {
                    videoIds.push(video.videoId);
                }
            }
        }

        if (videoIds.length === 0) {
            return {
                success: false,
                error: 'No videos found in learning path',
            };
        }

        // Create the playlist
        const title = customTitle || `LinkMe: ${learningPath.topic}`;
        const description = `Learning path created by LinkMe\n\n${learningPath.summary}\n\nLevel: ${learningPath.userLevel}\nGoal: ${learningPath.userGoal}\nTotal videos: ${learningPath.totalVideos}\nEstimated time: ${learningPath.estimatedTotalTime}`;

        const playlistId = await createPlaylist(auth.youtube, title, description);

        // Add videos to playlist
        const { success: added, failed } = await addVideosToPlaylist(
            auth.youtube,
            playlistId,
            videoIds
        );

        const playlistUrl = `https://www.youtube.com/playlist?list=${playlistId}`;

        return {
            success: true,
            playlistId,
            playlistUrl,
            videosAdded: added,
            videosFailed: failed,
        };
    } catch (error) {
        console.error('Failed to export learning path:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to create playlist',
        };
    }
}

/**
 * Get the YouTube playlist URL
 */
export function getPlaylistUrl(playlistId: string): string {
    return `https://www.youtube.com/playlist?list=${playlistId}`;
}
