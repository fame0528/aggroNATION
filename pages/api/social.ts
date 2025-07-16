import { NextApiRequest, NextApiResponse } from 'next';
import { rateLimit } from '@/lib/services/security';
import { trackEvent } from '@/lib/services/analytics';

interface ShareRequest extends NextApiRequest {
  body: {
    url: string;
    title: string;
    description?: string;
    platform: 'twitter' | 'facebook' | 'linkedin' | 'reddit' | 'email' | 'copy';
    hashtags?: string[];
  };
}

interface ShareStats {
  shares: number;
  platform: string;
  url: string;
  title: string;
  lastShared: Date;
}

// In-memory storage for demo (use database in production)
const shareStats: Map<string, ShareStats> = new Map();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Apply rate limiting
    await rateLimit(req, res);

    const { method, query } = req;
    const { type } = query;

    switch (method) {
      case 'GET':
        if (type === 'stats') {
          return await getShareStats(req, res);
        }
        return await getShareUrls(req, res);
      case 'POST':
        return await recordShare(req as ShareRequest, res);
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Social API Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message:
        process.env.NODE_ENV === 'development' ? (error as Error).message : 'Something went wrong',
    });
  }
}

async function getShareUrls(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { url, title, description, hashtags } = req.query;

    if (!url || !title) {
      return res.status(400).json({ error: 'URL and title are required' });
    }

    const encodedUrl = encodeURIComponent(url as string);
    const encodedTitle = encodeURIComponent(title as string);
    const encodedDescription = encodeURIComponent((description as string) || '');
    const encodedHashtags = hashtags
      ? encodeURIComponent(
          (hashtags as string)
            .split(',')
            .map((tag) => `#${tag.trim()}`)
            .join(' '),
        )
      : '';

    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}&hashtags=${encodedHashtags}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      reddit: `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
      email: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`,
      whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
      copy: url as string,
    };

    await trackEvent('share', 'urls_generated', {
      url: url as string,
      title: title as string,
      platforms: Object.keys(shareUrls),
    });

    return res.status(200).json({
      shareUrls,
      metadata: {
        url: url as string,
        title: title as string,
        description: description as string,
        hashtags: hashtags ? (hashtags as string).split(',').map((tag) => tag.trim()) : [],
      },
    });
  } catch (error) {
    console.error('Get share URLs error:', error);
    return res.status(500).json({ error: 'Failed to generate share URLs' });
  }
}

async function recordShare(req: ShareRequest, res: NextApiResponse) {
  try {
    const { url, title, description, platform, hashtags } = req.body;

    if (!url || !title || !platform) {
      return res.status(400).json({ error: 'URL, title, and platform are required' });
    }

    const shareKey = `${url}_${platform}`;
    const existing = shareStats.get(shareKey);

    if (existing) {
      existing.shares += 1;
      existing.lastShared = new Date();
      shareStats.set(shareKey, existing);
    } else {
      shareStats.set(shareKey, {
        shares: 1,
        platform,
        url,
        title,
        lastShared: new Date(),
      });
    }

    await trackEvent('share', 'recorded', {
      url,
      title,
      platform,
      hashtags: hashtags || [],
    });

    return res.status(200).json({
      message: 'Share recorded successfully',
      stats: shareStats.get(shareKey),
    });
  } catch (error) {
    console.error('Record share error:', error);
    return res.status(500).json({ error: 'Failed to record share' });
  }
}

async function getShareStats(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { url, platform } = req.query;

    if (url && platform) {
      const shareKey = `${url}_${platform}`;
      const stats = shareStats.get(shareKey);

      if (!stats) {
        return res.status(404).json({ error: 'Share stats not found' });
      }

      return res.status(200).json({ stats });
    }

    if (url) {
      const urlStats = Array.from(shareStats.entries())
        .filter(([key]) => key.startsWith(url as string))
        .map(([, stats]) => stats);

      const totalShares = urlStats.reduce((sum, stats) => sum + stats.shares, 0);
      const platformBreakdown = urlStats.reduce(
        (acc, stats) => {
          acc[stats.platform] = (acc[stats.platform] || 0) + stats.shares;
          return acc;
        },
        {} as Record<string, number>,
      );

      return res.status(200).json({
        url,
        totalShares,
        platformBreakdown,
        stats: urlStats,
      });
    }

    // Get all share stats
    const allStats = Array.from(shareStats.values());
    const totalShares = allStats.reduce((sum, stats) => sum + stats.shares, 0);
    const platformBreakdown = allStats.reduce(
      (acc, stats) => {
        acc[stats.platform] = (acc[stats.platform] || 0) + stats.shares;
        return acc;
      },
      {} as Record<string, number>,
    );

    const topShared = allStats.sort((a, b) => b.shares - a.shares).slice(0, 10);

    return res.status(200).json({
      totalShares,
      platformBreakdown,
      topShared,
      totalUrls: allStats.length,
    });
  } catch (error) {
    console.error('Get share stats error:', error);
    return res.status(500).json({ error: 'Failed to get share stats' });
  }
}
