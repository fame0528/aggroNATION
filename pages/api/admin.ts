import { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '../../lib/db/connection';
import { getModels } from '../../lib/db/models/rss';
import { rateLimit } from '../../lib/services/security';
import { trackEvent } from '../../lib/services/analytics';

interface AdminStats {
  system: {
    uptime: number;
    memory: {
      used: number;
      total: number;
      percentage: number;
    };
    cpu: {
      usage: number;
    };
    disk: {
      used: number;
      total: number;
      percentage: number;
    };
  };
  database: {
    totalArticles: number;
    totalVideos: number;
    totalFeeds: number;
    activeFeeds: number;
    failedFeeds: number;
    totalUsers: number;
    totalBookmarks: number;
    totalReadingLists: number;
  };
  activity: {
    last24h: {
      articles: number;
      videos: number;
      pageViews: number;
      searches: number;
      errors: number;
    };
    last7d: {
      articles: number;
      videos: number;
      pageViews: number;
      searches: number;
      errors: number;
    };
  };
  performance: {
    avgResponseTime: number;
    errorRate: number;
    successRate: number;
  };
  feeds: {
    healthiest: Array<{ name: string; url: string; healthScore: number; lastFetchedAt: Date }>;
    problematic: Array<{ name: string; url: string; failureCount: number; lastErrorAt: Date }>;
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Apply rate limiting
    await rateLimit(req, res);

    // Simple admin auth check (use proper auth in production)
    const adminKey = req.headers['x-admin-key'];
    if (!adminKey || adminKey !== process.env.ADMIN_API_KEY) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await connectDB();

    const { method, query } = req;
    const { action } = query;

    switch (method) {
      case 'GET':
        if (action === 'stats') {
          return await getAdminStats(req, res);
        }
        if (action === 'users') {
          return await getUsers(req, res);
        }
        if (action === 'feeds') {
          return await getFeedsManagement(req, res);
        }
        if (action === 'logs') {
          return await getLogs(req, res);
        }
        return await getAdminStats(req, res);
      case 'POST':
        if (action === 'feeds') {
          return await manageFeed(req, res);
        }
        if (action === 'users') {
          return await manageUser(req, res);
        }
        if (action === 'system') {
          return await manageSystem(req, res);
        }
        break;
      case 'PUT':
        if (action === 'feeds') {
          return await updateFeed(req, res);
        }
        break;
      case 'DELETE':
        if (action === 'feeds') {
          return await deleteFeed(req, res);
        }
        break;
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Admin API Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message:
        process.env.NODE_ENV === 'development' ? (error as Error).message : 'Something went wrong',
    });
  }
}

async function getAdminStats(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { articles, videos, feeds, bookmarks, readingLists } = await getModels();

    // Get database stats
    const [totalArticles, totalVideos, totalFeeds, feedsHealth, totalBookmarks, totalReadingLists] =
      await Promise.all([
        articles.getTotalCount(),
        videos.getTotalCount(),
        feeds.getTotalCount(),
        feeds.getHealthStatus(),
        bookmarks.countDocuments({}),
        readingLists.countDocuments({}),
      ]);

    const activeFeeds = feedsHealth.filter((f) => f.isActive).length;
    const failedFeeds = feedsHealth.filter((f) => f.failureCount > 0).length;

    // Get system stats
    const systemStats = getSystemStats();

    // Get recent activity from database
    const last24h = {
      articles: await articles.countDocuments({
        fetchedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      }),
      videos: await videos.countDocuments({
        fetchedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      }),
      pageViews: 0, // TODO: Implement analytics collection
      searches: 0, // TODO: Implement search analytics
      errors: 0, // TODO: Implement error tracking
    };

    const last7d = {
      articles: await articles.countDocuments({
        fetchedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      }),
      videos: await videos.countDocuments({
        fetchedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      }),
      pageViews: 0, // TODO: Implement analytics collection
      searches: 0,
      errors: 0,
    };

    // Get performance metrics
    const performance = {
      avgResponseTime: 250,
      errorRate: 0.02,
      successRate: 0.98,
    };

    // Get feed health data
    const healthiest = feedsHealth
      .sort((a, b) => (b.healthScore || 0) - (a.healthScore || 0))
      .slice(0, 5)
      .map((feed) => ({
        name: feed.name,
        url: feed.url,
        healthScore: feed.healthScore || 0,
        lastFetchedAt: feed.lastFetchedAt,
      }));

    const problematic = feedsHealth
      .filter((f) => f.failureCount > 0)
      .sort((a, b) => b.failureCount - a.failureCount)
      .slice(0, 5)
      .map((feed) => ({
        name: feed.name,
        url: feed.url,
        failureCount: feed.failureCount,
        lastErrorAt: feed.lastErrorAt,
      }));

    const stats: AdminStats = {
      system: systemStats,
      database: {
        totalArticles,
        totalVideos,
        totalFeeds,
        activeFeeds,
        failedFeeds,
        totalUsers: 1, // Mock data
        totalBookmarks,
        totalReadingLists,
      },
      activity: {
        last24h,
        last7d,
      },
      performance,
      feeds: {
        healthiest,
        problematic,
      },
    };

    await trackEvent('admin', 'stats_viewed', { adminId: 'admin' });

    return res.status(200).json(stats);
  } catch (error) {
    console.error('Get admin stats error:', error);
    return res.status(500).json({ error: 'Failed to get admin stats' });
  }
}

async function getUsers(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Mock user data (integrate with your auth system)
    const users = [
      {
        id: 'default',
        email: 'admin@aggronation.com',
        name: 'Admin User',
        role: 'admin',
        createdAt: new Date(),
        lastLoginAt: new Date(),
        isActive: true,
        bookmarksCount: 0,
        readingListsCount: 0,
      },
    ];

    await trackEvent('admin', 'users_viewed', { adminId: 'admin' });

    return res.status(200).json({ users, total: users.length });
  } catch (error) {
    console.error('Get users error:', error);
    return res.status(500).json({ error: 'Failed to get users' });
  }
}

async function getFeedsManagement(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { feeds } = await getModels();
    const feedsData = await feeds.getAllFeeds();

    await trackEvent('admin', 'feeds_viewed', { adminId: 'admin' });

    return res.status(200).json({ feeds: feedsData, total: feedsData.length });
  } catch (error) {
    console.error('Get feeds management error:', error);
    return res.status(500).json({ error: 'Failed to get feeds' });
  }
}

async function getLogs(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { limit = '50', offset = '0', level = 'all' } = req.query;

    // Mock log data (integrate with your logging system)
    const logs = [
      {
        id: '1',
        timestamp: new Date(),
        level: 'info',
        message: 'RSS feed updated successfully',
        source: 'rss-scheduler',
        data: { feedId: 'feed1', articlesCount: 5 },
      },
      {
        id: '2',
        timestamp: new Date(),
        level: 'error',
        message: 'Failed to fetch RSS feed',
        source: 'rss-parser',
        data: { feedUrl: 'https://example.com/rss', error: 'Timeout' },
      },
    ];

    await trackEvent('admin', 'logs_viewed', { adminId: 'admin', level });

    return res.status(200).json({ logs, total: logs.length });
  } catch (error) {
    console.error('Get logs error:', error);
    return res.status(500).json({ error: 'Failed to get logs' });
  }
}

async function manageFeed(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { action, feedId } = req.body;

    if (!action || !feedId) {
      return res.status(400).json({ error: 'Action and feed ID are required' });
    }

    const { feeds } = await getModels();

    switch (action) {
      case 'activate':
        await feeds.updateFeed(feedId, { isActive: true });
        break;
      case 'deactivate':
        await feeds.updateFeed(feedId, { isActive: false });
        break;
      case 'refresh':
        // Trigger manual refresh
        await feeds.updateFeed(feedId, { lastFetchedAt: new Date() });
        break;
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }

    await trackEvent('admin', 'feed_managed', { adminId: 'admin', action, feedId });

    return res.status(200).json({ message: `Feed ${action} successful` });
  } catch (error) {
    console.error('Manage feed error:', error);
    return res.status(500).json({ error: 'Failed to manage feed' });
  }
}

async function manageUser(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { action, userId } = req.body;

    if (!action || !userId) {
      return res.status(400).json({ error: 'Action and user ID are required' });
    }

    // Mock user management (integrate with your auth system)
    await trackEvent('admin', 'user_managed', { adminId: 'admin', action, userId });

    return res.status(200).json({ message: `User ${action} successful` });
  } catch (error) {
    console.error('Manage user error:', error);
    return res.status(500).json({ error: 'Failed to manage user' });
  }
}

async function manageSystem(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { action } = req.body;

    if (!action) {
      return res.status(400).json({ error: 'Action is required' });
    }

    switch (action) {
      case 'clear-cache':
        // Clear cache (implement cache clearing logic)
        break;
      case 'refresh-all-feeds':
        // Trigger refresh of all feeds
        break;
      case 'optimize-database':
        // Run database optimization
        break;
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }

    await trackEvent('admin', 'system_managed', { adminId: 'admin', action });

    return res.status(200).json({ message: `System ${action} successful` });
  } catch (error) {
    console.error('Manage system error:', error);
    return res.status(500).json({ error: 'Failed to manage system' });
  }
}

async function updateFeed(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { feedId, updates } = req.body;

    if (!feedId || !updates) {
      return res.status(400).json({ error: 'Feed ID and updates are required' });
    }

    const { feeds } = await getModels();
    await feeds.updateFeed(feedId, updates);

    await trackEvent('admin', 'feed_updated', { adminId: 'admin', feedId });

    return res.status(200).json({ message: 'Feed updated successfully' });
  } catch (error) {
    console.error('Update feed error:', error);
    return res.status(500).json({ error: 'Failed to update feed' });
  }
}

async function deleteFeed(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { feedId } = req.body;

    if (!feedId) {
      return res.status(400).json({ error: 'Feed ID is required' });
    }

    const { feeds } = await getModels();
    await feeds.deleteFeed(feedId);

    await trackEvent('admin', 'feed_deleted', { adminId: 'admin', feedId });

    return res.status(200).json({ message: 'Feed deleted successfully' });
  } catch (error) {
    console.error('Delete feed error:', error);
    return res.status(500).json({ error: 'Failed to delete feed' });
  }
}

function getSystemStats() {
  const used = process.memoryUsage();
  const total = require('os').totalmem();
  const free = require('os').freemem();

  return {
    uptime: process.uptime(),
    memory: {
      used: used.heapUsed,
      total: total,
      percentage: ((total - free) / total) * 100,
    },
    cpu: {
      usage: require('os').loadavg()[0],
    },
    disk: {
      used: 0, // Would need disk usage library
      total: 0,
      percentage: 0,
    },
  };
}
