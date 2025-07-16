import { NextApiRequest, NextApiResponse } from 'next';
import { getModels } from '@/lib/db/models/rss';
import { RSS_FEED_CONFIGS } from '@/lib/api/rss-feeds';
import { z } from 'zod';

const adminActionSchema = z.object({
  action: z.enum(['initialize', 'reset', 'cleanup', 'stats', 'maintenance']),
  confirm: z.boolean().optional(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', ['POST']);
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Basic auth check (you should implement proper authentication)
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { action, confirm } = adminActionSchema.parse(req.body);
    const { feeds, articles, videos } = await getModels();

    switch (action) {
      case 'initialize':
        // Initialize default feeds
        const createdFeeds = [];

        for (const config of RSS_FEED_CONFIGS) {
          try {
            const feed = await feeds.create({
              ...config,
              createdAt: new Date(),
              updatedAt: new Date(),
              lastFetchedAt: new Date(0),
              lastSuccessAt: new Date(0),
            });
            createdFeeds.push(feed);
          } catch (error) {
            // Skip duplicates
            console.warn(`Feed ${config.name} already exists`);
          }
        }

        return res.status(200).json({
          message: `Initialized ${createdFeeds.length} feeds`,
          feeds: createdFeeds,
        });

      case 'stats':
        // Get comprehensive statistics
        const [feedsHealth, articlesResult, videosResult] = await Promise.all([
          feeds.getHealthStatus(),
          articles.getArticles({ limit: 1 }),
          videos.getVideos({ limit: 1 }),
        ]);

        const stats = {
          feeds: {
            total: feedsHealth.length,
            active: feedsHealth.filter((f) => f.isActive).length,
            healthy: feedsHealth.filter((f) => f.healthScore > 70).length,
            categories: [...new Set(feedsHealth.map((f) => f.category))],
            types: [...new Set(feedsHealth.map((f) => f.type))],
          },
          content: {
            articles: articlesResult.total,
            videos: videosResult.total,
          },
          health: {
            averageScore:
              feedsHealth.reduce((sum, f) => sum + f.healthScore, 0) / feedsHealth.length,
            averageResponseTime:
              feedsHealth.reduce((sum, f) => sum + f.avgResponseTime, 0) / feedsHealth.length,
          },
        };

        return res.status(200).json({ stats });

      case 'cleanup':
        // Clean up old/inactive content
        if (!confirm) {
          return res.status(400).json({
            error: 'Cleanup requires confirmation',
            message: 'This action will remove old content. Add "confirm": true to proceed.',
          });
        }

        // TODO: Implement cleanup logic based on age, status, etc.
        const cleanupResult = {
          articlesRemoved: 0,
          videosRemoved: 0,
          feedsUpdated: 0,
        };

        return res.status(200).json({
          message: 'Cleanup completed',
          result: cleanupResult,
        });

      case 'maintenance':
        // Perform maintenance tasks
        const maintenanceResult = {
          indexesOptimized: 0,
          duplicatesRemoved: 0,
          healthScoresUpdated: 0,
        };

        // TODO: Implement maintenance logic
        // - Optimize database indexes
        // - Remove duplicates
        // - Update health scores
        // - Clean up logs

        return res.status(200).json({
          message: 'Maintenance completed',
          result: maintenanceResult,
        });

      case 'reset':
        // Reset all data (dangerous!)
        if (!confirm) {
          return res.status(400).json({
            error: 'Reset requires confirmation',
            message: 'This action will delete all data. Add "confirm": true to proceed.',
          });
        }

        // TODO: Implement reset logic
        const resetResult = {
          articlesDeleted: 0,
          videosDeleted: 0,
          feedsReset: 0,
        };

        return res.status(200).json({
          message: 'System reset completed',
          result: resetResult,
        });

      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.error('Admin API Error:', error);

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
