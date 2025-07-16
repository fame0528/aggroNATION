import { NextApiRequest, NextApiResponse } from 'next';
import { getModels } from '@/lib/db/models/rss';
import { rssParser } from '@/lib/services/rss-parser';
import { z } from 'zod';

const refreshSchema = z.object({
  feedId: z.string().optional(),
  category: z.string().optional(),
  type: z.enum(['news', 'blog', 'youtube']).optional(),
  force: z.boolean().optional().default(false),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', ['POST']);
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { feedId, category, type, force } = refreshSchema.parse(req.body);
    const { feeds, articles, videos } = await getModels();

    // Get feeds to refresh
    let feedsToRefresh;
    if (feedId) {
      // Refresh specific feed
      feedsToRefresh = await feeds.getActiveFeeds();
      feedsToRefresh = feedsToRefresh.filter((f) => f._id?.toString() === feedId);
    } else {
      // Refresh all active feeds or filtered feeds
      feedsToRefresh = await feeds.getActiveFeeds();
      if (category) {
        feedsToRefresh = feedsToRefresh.filter((f) => f.category === category);
      }
      if (type) {
        feedsToRefresh = feedsToRefresh.filter((f) => f.type === type);
      }
    }

    if (feedsToRefresh.length === 0) {
      return res.status(404).json({ error: 'No feeds found to refresh' });
    }

    const results = {
      totalFeeds: feedsToRefresh.length,
      successful: 0,
      failed: 0,
      newArticles: 0,
      newVideos: 0,
      errors: [] as any[],
    };

    // Process feeds
    for (const feed of feedsToRefresh) {
      const startTime = Date.now();

      try {
        // Use the unified parseFeed method
        const result = await rssParser.parseFeed(feed);

        if (feed.type === 'youtube') {
          // Save videos to database
          console.log(
            `📊 Attempting to save ${result.videos?.length || 0} videos from ${feed.name}`,
          );
          for (const video of result.videos || []) {
            try {
              const saved = await videos.create({
                ...video,
                feedUrl: feed.url,
                fetchedAt: new Date(),
              });
              if (saved) {
                results.newVideos++;
                console.log(`✅ Saved new video: ${video.title}`);
              } else {
                console.log(`⚠️ Video already exists: ${video.title}`);
              }
            } catch (error) {
              console.error(`❌ Error saving video "${video.title}":`, error);
              results.errors.push({
                feed: feed.name,
                video: video.title,
                error: error instanceof Error ? error.message : String(error),
              });
            }
          }
        } else {
          // Save articles to database
          console.log(
            `📊 Attempting to save ${result.articles?.length || 0} articles from ${feed.name}`,
          );
          for (const article of result.articles || []) {
            try {
              const saved = await articles.create({
                ...article,
                feedUrl: feed.url,
                fetchedAt: new Date(),
              });
              if (saved) {
                results.newArticles++;
                console.log(`✅ Saved new article: ${article.title}`);
              } else {
                console.log(`⚠️ Article already exists: ${article.title}`);
              }
            } catch (error) {
              console.error(`❌ Error saving article "${article.title}":`, error);
              results.errors.push({
                feed: feed.name,
                article: article.title,
                error: error instanceof Error ? error.message : String(error),
              });
            }
          }
        }

        // Update feed health
        const responseTime = Date.now() - startTime;
        await feeds.updateHealth(feed._id?.toString() || '', true, responseTime);

        results.successful++;
      } catch (error) {
        console.error(`Error refreshing feed ${feed.name}:`, error);

        // Update feed health
        const responseTime = Date.now() - startTime;
        await feeds.updateHealth(
          feed._id?.toString() || '',
          false,
          responseTime,
          (error as Error).message,
        );

        results.failed++;
        results.errors.push({
          feedId: feed._id?.toString() || '',
          feedName: feed.name,
          error: (error as Error).message,
        });
      }
    }

    res.status(200).json({
      success: true,
      results,
      message: `Refreshed ${results.successful}/${results.totalFeeds} feeds. Found ${results.newArticles} new articles and ${results.newVideos} new videos.`,
    });
  } catch (error) {
    console.error('API Error:', error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors,
      });
    }

    res.status(500).json({
      error: 'Internal server error',
      message:
        process.env.NODE_ENV === 'development' ? (error as Error).message : 'Something went wrong',
    });
  }
}
