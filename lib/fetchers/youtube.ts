/**
 * YouTube Fetcher Service
 * 
 * Fetches videos from YouTube channels using YouTube Data API v3
 * Extracts metadata, metrics, and converts to ContentItem format
 * 
 * @module lib/fetchers/youtube
 * @created 2026-01-20
 */

import axios from 'axios';
import { ISource } from '@/lib/db/models/Source';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  publishedAt: string;
  channelTitle: string;
  thumbnailUrl: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  tags: string[];
}

/**
 * Extract channel ID from YouTube URL
 * Supports: youtube.com/@handle, youtube.com/channel/ID, youtube.com/c/customname
 */
function extractChannelIdentifier(url: string): { type: 'handle' | 'channelId' | 'custom'; value: string } | null {
  // Handle format: @username
  const handleMatch = url.match(/youtube\.com\/@([^/?]+)/);
  if (handleMatch) {
    return { type: 'handle', value: handleMatch[1] };
  }

  // Channel ID format: /channel/UCxxxxx
  const channelMatch = url.match(/youtube\.com\/channel\/([^/?]+)/);
  if (channelMatch) {
    return { type: 'channelId', value: channelMatch[1] };
  }

  // Custom URL format: /c/customname
  const customMatch = url.match(/youtube\.com\/c\/([^/?]+)/);
  if (customMatch) {
    return { type: 'custom', value: customMatch[1] };
  }

  return null;
}

/**
 * Resolve @handle or custom URL to channel ID using YouTube API
 */
async function resolveToChannelId(identifier: { type: 'handle' | 'channelId' | 'custom'; value: string }): Promise<string | null> {
  if (!YOUTUBE_API_KEY) {
    throw new Error('YouTube API key not configured');
  }

  // If already a channel ID, return it
  if (identifier.type === 'channelId') {
    return identifier.value;
  }

  try {
    // For @handle, search for the channel by name (without @)
    if (identifier.type === 'handle') {
      const searchResponse = await axios.get(`${YOUTUBE_API_BASE}/search`, {
        params: {
          part: 'snippet',
          q: identifier.value, // Search without @ symbol
          type: 'channel',
          maxResults: 1,
          key: YOUTUBE_API_KEY,
        },
      });

      if (searchResponse.data.items?.[0]?.id?.channelId) {
        console.log(`[YouTube] Resolved @${identifier.value} to channel ID: ${searchResponse.data.items[0].id.channelId}`);
        return searchResponse.data.items[0].id.channelId;
      }
    }

    // For custom URL, try to find via search
    if (identifier.type === 'custom') {
      const searchResponse = await axios.get(`${YOUTUBE_API_BASE}/search`, {
        params: {
          part: 'snippet',
          q: identifier.value,
          type: 'channel',
          maxResults: 1,
          key: YOUTUBE_API_KEY,
        },
      });

      if (searchResponse.data.items?.[0]?.id?.channelId) {
        console.log(`[YouTube] Resolved custom URL to channel ID: ${searchResponse.data.items[0].id.channelId}`);
        return searchResponse.data.items[0].id.channelId;
      }
    }
  } catch (error: any) {
    console.error('[YouTube] Error resolving channel ID:', error.response?.data || error.message);
    
    // If we get a specific error from YouTube API, log it
    if (error.response?.data?.error) {
      console.error('[YouTube] YouTube API Error:', JSON.stringify(error.response.data.error, null, 2));
    }
  }

  return null;
}

/**
 * Fetch videos from a YouTube channel
 */
export async function fetchYouTubeVideos(source: ISource): Promise<YouTubeVideo[]> {
  if (!YOUTUBE_API_KEY) {
    throw new Error('YouTube API key not configured. Please set YOUTUBE_API_KEY in .env');
  }

  console.log(`[YouTube] Fetching videos from: ${source.url}`);

  // Extract and resolve channel identifier
  const identifier = extractChannelIdentifier(source.url);
  if (!identifier) {
    throw new Error(`Invalid YouTube URL format: ${source.url}`);
  }

  const channelId = await resolveToChannelId(identifier);
  if (!channelId) {
    throw new Error(`Could not resolve channel ID from: ${source.url}`);
  }

  console.log(`[YouTube] Resolved channel ID: ${channelId}`);

  try {
    // Step 1: Get channel's uploads playlist ID
    const channelResponse = await axios.get(`${YOUTUBE_API_BASE}/channels`, {
      params: {
        part: 'contentDetails',
        id: channelId,
        key: YOUTUBE_API_KEY,
      },
    });

    const uploadsPlaylistId = channelResponse.data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
    if (!uploadsPlaylistId) {
      throw new Error('Could not find uploads playlist for channel');
    }

    console.log(`[YouTube] Uploads playlist ID: ${uploadsPlaylistId}`);

    // Step 2: Get videos from uploads playlist
    const playlistResponse = await axios.get(`${YOUTUBE_API_BASE}/playlistItems`, {
      params: {
        part: 'snippet,contentDetails',
        playlistId: uploadsPlaylistId,
        maxResults: source.config.maxItems || 50,
        key: YOUTUBE_API_KEY,
      },
    });

    const videoIds = playlistResponse.data.items
      .map((item: any) => item.contentDetails?.videoId)
      .filter(Boolean);

    if (videoIds.length === 0) {
      console.log('[YouTube] No videos found');
      return [];
    }

    console.log(`[YouTube] Found ${videoIds.length} videos`);

    // Step 3: Get video statistics and details
    const videosResponse = await axios.get(`${YOUTUBE_API_BASE}/videos`, {
      params: {
        part: 'snippet,statistics',
        id: videoIds.join(','),
        key: YOUTUBE_API_KEY,
      },
    });

    const videos: YouTubeVideo[] = videosResponse.data.items.map((video: any) => ({
      id: video.id,
      title: video.snippet.title,
      description: video.snippet.description,
      publishedAt: video.snippet.publishedAt,
      channelTitle: video.snippet.channelTitle,
      thumbnailUrl: video.snippet.thumbnails?.high?.url || video.snippet.thumbnails?.default?.url,
      viewCount: parseInt(video.statistics?.viewCount || '0', 10),
      likeCount: parseInt(video.statistics?.likeCount || '0', 10),
      commentCount: parseInt(video.statistics?.commentCount || '0', 10),
      tags: video.snippet.tags || [],
    }));

    console.log(`[YouTube] Successfully fetched ${videos.length} videos with statistics`);
    return videos;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.error?.message || error.message;
      console.error('[YouTube] API Error:', message);
      throw new Error(`YouTube API Error: ${message}`);
    }
    throw error;
  }
}

/**
 * Convert YouTube video to ContentItem format for database storage
 */
export function convertYouTubeToContent(video: YouTubeVideo, sourceId: string) {
  // Calculate base score from engagement metrics
  const engagementRate = video.viewCount > 0 
    ? (video.likeCount + video.commentCount) / video.viewCount 
    : 0;

  const baseScore = Math.min(
    (video.viewCount / 10000) * 0.3 +
    (video.likeCount / 1000) * 0.4 +
    (video.commentCount / 100) * 0.3,
    1
  );

  // Create excerpt from description (first 200 chars)
  const excerpt = video.description.length > 200 
    ? video.description.substring(0, 197) + '...' 
    : video.description;

  return {
    sourceId,
    sourceType: 'youtube' as const,
    title: video.title,
    excerpt,
    url: `https://www.youtube.com/embed/${video.id}`,
    externalId: video.id,
    author: video.channelTitle,
    publishedAt: new Date(video.publishedAt),
    tags: video.tags.slice(0, 10), // Limit to 10 tags
    metrics: {
      upvotes: video.likeCount,
      comments: video.commentCount,
      shares: 0, // YouTube API doesn't provide share count
      views: video.viewCount,
      rating: baseScore,
    },
    ratingData: {
      baseScore,
      decayFactor: 1,
      lastCalculated: new Date(),
    },
    featured: false,
    archived: false,
  };
}
