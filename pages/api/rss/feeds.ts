import { NextApiRequest, NextApiResponse } from 'next';
import { getModels } from '@/lib/db/models/rss';
import { RSS_FEED_CONFIGS } from '@/lib/api/rss-feeds';
import { z } from 'zod';

const feedQuerySchema = z.object({
  isActive: z.string().optional(),
  type: z.string().optional(),
  category: z.string().optional(),
});

const feedPostSchema = z.object({
  name: z.string().min(1),
  url: z.string().url(),
  type: z.enum(['news', 'blog', 'youtube']),
  category: z.string().min(1),
  description: z.string().optional(),
  language: z.string().optional().default('en'),
  fetchInterval: z.number().optional().default(30),
  isActive: z.boolean().optional().default(true),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { feeds } = await getModels();

    if (req.method === 'GET') {
      const query = feedQuerySchema.parse(req.query);

      if (query.isActive === 'true') {
        const activeFeeds = await feeds.getActiveFeeds();
        return res.status(200).json({ feeds: activeFeeds });
      }

      // For admin: get all feeds with health status
      const healthStatus = await feeds.getHealthStatus();
      return res.status(200).json({ feeds: healthStatus });
    } else if (req.method === 'POST') {
      const feedData = feedPostSchema.parse(req.body);

      const feedToCreate = {
        ...feedData,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastFetchedAt: new Date(0), // Never fetched
        lastSuccessAt: new Date(0), // Never succeeded
        failureCount: 0,
        avgResponseTime: 0,
        healthScore: 100,
      };

      const feed = await feeds.create(feedToCreate);

      res.status(201).json({ feed });
    } else if (req.method === 'PUT') {
      // Update feed health (internal use)
      const { feedId, success, responseTime, errorMessage } = req.body;

      if (!feedId || typeof success !== 'boolean' || typeof responseTime !== 'number') {
        return res.status(400).json({ error: 'Invalid request body' });
      }

      await feeds.updateHealth(feedId, success, responseTime, errorMessage);

      res.status(200).json({ success: true });
    } else if (req.method === 'DELETE') {
      // Initialize default feeds (admin only)
      const { action } = req.body;

      if (action === 'initialize') {
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
      }

      res.status(400).json({ error: 'Invalid action' });
    } else {
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).json({ error: 'Method not allowed' });
    }
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
