import { NextApiRequest, NextApiResponse } from 'next';
import { getModels } from '@/lib/db/models/rss';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'GET') {
      res.setHeader('Allow', ['GET']);
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { feeds, articles, videos } = await getModels();

    // Get basic health statistics
    const [feedsHealth, articlesCount, videosCount] = await Promise.all([
      feeds.getHealthStatus(),
      articles.getArticles({ limit: 1 }),
      videos.getVideos({ limit: 1 }),
    ]);

    // Calculate health metrics
    const totalFeeds = feedsHealth.length;
    const activeFeeds = feedsHealth.filter((f) => f.isActive).length;
    const healthyFeeds = feedsHealth.filter((f) => f.healthScore > 70).length;
    const unhealthyFeeds = feedsHealth.filter((f) => f.healthScore < 30).length;

    // Get recent activity
    const recentActivity = {
      totalArticles: articlesCount.total,
      totalVideos: videosCount.total,
      lastUpdate: new Date(),
    };

    // System health score
    const systemHealthScore = totalFeeds > 0 ? Math.round((healthyFeeds / totalFeeds) * 100) : 0;

    // Determine overall status
    let status = 'healthy';
    if (systemHealthScore < 50) {
      status = 'critical';
    } else if (systemHealthScore < 80) {
      status = 'warning';
    }

    res.status(200).json({
      status,
      timestamp: new Date().toISOString(),
      systemHealth: {
        score: systemHealthScore,
        status: status,
      },
      feeds: {
        total: totalFeeds,
        active: activeFeeds,
        healthy: healthyFeeds,
        unhealthy: unhealthyFeeds,
        details: feedsHealth,
      },
      content: {
        articles: articlesCount.total,
        videos: videosCount.total,
      },
      recentActivity,
    });
  } catch (error) {
    console.error('Health check error:', error);

    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
      message:
        process.env.NODE_ENV === 'development' ? (error as Error).message : 'Internal server error',
    });
  }
}
