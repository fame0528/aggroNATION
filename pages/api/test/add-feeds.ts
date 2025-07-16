import { NextApiRequest, NextApiResponse } from 'next';
import { getModels } from '../../../lib/db/models/rss';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { feeds } = await getModels();

    // Add some sample RSS feeds for testing
    const sampleFeeds = [
      {
        name: "O'Reilly Radar",
        url: 'https://feeds.feedburner.com/oreilly/radar',
        title: "O'Reilly Radar",
        description: 'Emerging technologies and trends',
        category: 'Technology',
        type: 'news' as const,
        isActive: true,
        tags: ['ai', 'technology', 'development'],
        lastFetched: null,
        lastSuccessful: null,
        failureCount: 0,
        avgResponseTime: 0,
        language: 'en',
        encoding: 'utf8',
        etag: null,
        lastModified: null,
        healthScore: 100,
        fetchInterval: 300000,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'MIT Technology Review',
        url: 'https://www.technologyreview.com/feed/',
        title: 'MIT Technology Review',
        description: 'Latest in AI and technology',
        category: 'AI Research',
        type: 'news' as const,
        isActive: true,
        tags: ['ai', 'research', 'innovation'],
        lastFetched: null,
        lastSuccessful: null,
        failureCount: 0,
        avgResponseTime: 0,
        language: 'en',
        encoding: 'utf8',
        etag: null,
        lastModified: null,
        healthScore: 100,
        fetchInterval: 300000,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'OpenAI Blog',
        url: 'https://blog.openai.com/rss/',
        title: 'OpenAI Blog',
        description: 'Updates from OpenAI',
        category: 'AI Development',
        type: 'blog' as const,
        isActive: true,
        tags: ['openai', 'ai', 'machine-learning'],
        lastFetched: null,
        lastSuccessful: null,
        failureCount: 0,
        avgResponseTime: 0,
        language: 'en',
        encoding: 'utf8',
        etag: null,
        lastModified: null,
        healthScore: 100,
        fetchInterval: 300000,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const results = [];
    for (const feedData of sampleFeeds) {
      try {
        const result = await feeds.create(feedData);
        results.push(result);
      } catch (error) {
        console.log(`Feed ${feedData.url} already exists or failed to create`);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Sample feeds added',
      feeds: results,
    });
  } catch (error) {
    console.error('Error adding sample feeds:', error);
    res.status(500).json({
      error: 'Failed to add sample feeds',
      message:
        process.env.NODE_ENV === 'development' ? (error as Error).message : 'Internal server error',
    });
  }
}
