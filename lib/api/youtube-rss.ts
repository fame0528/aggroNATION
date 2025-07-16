import Parser from 'rss-parser';
import { AI_YOUTUBE_CHANNELS } from './youtube';

export { AI_YOUTUBE_CHANNELS };

export interface RSSYouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
  channelTitle: string;
  channelId: string;
  videoUrl: string;
}

// --- Caching and Pagination ---
import NodeCache from 'node-cache';
const videoCache = new NodeCache({ stdTTL: 300, checkperiod: 120 }); // 5 min cache

export async function fetchYouTubeVideosRSSPaginated({
  page = 1,
  limit = 24,
}: {
  page?: number;
  limit?: number;
}): Promise<{ videos: RSSYouTubeVideo[]; total: number }> {
  const cacheKey = `videos:all`;
  let allVideos: RSSYouTubeVideo[] | undefined = videoCache.get(cacheKey);
  if (!allVideos) {
    const parser = new Parser({
      customFields: {
        item: [
          ['media:group', 'media:group'],
          ['media:description', 'media:description'],
          ['media:group.media:description', 'media:group.media:description'],
          ['media$thumbnail', 'media$thumbnail'],
          ['id', 'id'],
          ['title', 'title'],
          ['description', 'description'],
          ['contentSnippet', 'contentSnippet'],
          ['pubDate', 'pubDate'],
        ],
      },
    });
    allVideos = [];
    await Promise.all(
      AI_YOUTUBE_CHANNELS.map(async (channel) => {
        try {
          const feed = await parser.parseURL(channel.rssUrl);
          for (const item of feed.items) {
            const videoId = (item as any).id?.split(':').pop() || '';
            let description = '';

            // Try multiple sources for description
            if ((item as any).contentSnippet && (item as any).contentSnippet.trim()) {
              description = (item as any).contentSnippet;
            } else if ((item as any).content && (item as any).content.trim()) {
              description = (item as any).content;
            } else if ((item as any).summary && (item as any).summary.trim()) {
              description = (item as any).summary;
            } else if ((item as any).description && (item as any).description.trim()) {
              description = (item as any).description;
            } else if (
              (item as any)['media:group'] &&
              (item as any)['media:group']['media:description']
            ) {
              const mediaDesc = (item as any)['media:group']['media:description'];
              if (typeof mediaDesc === 'string') {
                description = mediaDesc;
              } else if (mediaDesc && mediaDesc._) {
                description = mediaDesc._;
              }
            } else if ((item as any)['media:description']) {
              description = (item as any)['media:description'];
            }

            // If still no description, generate one from title
            if (!description || description.trim() === '') {
              description = `AI video: ${(item as any).title || 'Untitled'}`;
            }

            allVideos!.push({
              id: videoId,
              title: (item as any).title || '',
              description,
              thumbnail:
                (item as any).media$thumbnail?.url ||
                `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
              publishedAt: (item as any).pubDate || '',
              channelTitle: channel.name,
              channelId: channel.id,
              videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
            });
          }
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error(`Error fetching RSS for ${channel.name}:`, error);
        }
      }),
    );
    allVideos = allVideos.sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    );
    videoCache.set(cacheKey, allVideos);
  }
  const total = allVideos.length;
  const start = (page - 1) * limit;
  const end = start + limit;
  const videos = allVideos.slice(start, end);
  return { videos, total };
}
