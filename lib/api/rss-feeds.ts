/**
 * @fileoverview RSS Feed configuration and management service
 * @author aggroNATION Development Team
 * @version 1.0.0
 */

import { RSSFeed } from '@/lib/types/rss';

/**
 * RSS Feed configurations based on all-rss-feeds.txt
 */
export const RSS_FEED_CONFIGS: Omit<RSSFeed, '_id' | 'createdAt' | 'updatedAt'>[] = [
  // News Feeds
  {
    name: 'WIRED AI',
    url: 'https://www.wired.com/feed/tag/ai/latest/rss',
    type: 'news',
    category: 'Technology News',
    isActive: true,
    failureCount: 0,
    avgResponseTime: 0,
    healthScore: 100,
    fetchInterval: 30,
    description: 'Latest AI news and analysis from WIRED magazine',
    language: 'en',
  },
  {
    name: 'KnowTechie AI',
    url: 'https://knowtechie.com/category/ai/feed/',
    type: 'news',
    category: 'Technology News',
    isActive: true,
    failureCount: 0,
    avgResponseTime: 0,
    healthScore: 100,
    fetchInterval: 30,
    description: 'AI news and insights from KnowTechie',
    language: 'en',
  },
  {
    name: 'Dev.to',
    url: 'https://dev.to/feed',
    type: 'blog',
    category: 'Developer Community',
    isActive: true,
    failureCount: 0,
    avgResponseTime: 0,
    healthScore: 100,
    fetchInterval: 15,
    description: 'Developer community posts including AI and ML content',
    language: 'en',
  },
  {
    name: 'HuggingFace Blog',
    url: 'https://huggingface.co/blog/feed.xml',
    type: 'blog',
    category: 'AI Research',
    isActive: true,
    failureCount: 0,
    avgResponseTime: 0,
    healthScore: 100,
    fetchInterval: 60,
    description: 'Official HuggingFace blog with AI model updates and research',
    language: 'en',
  },
  {
    name: 'HackerNoon AI',
    url: 'https://hackernoon.com/tagged/ai/feed',
    type: 'blog',
    category: 'Technology News',
    isActive: true,
    failureCount: 0,
    avgResponseTime: 0,
    healthScore: 100,
    fetchInterval: 30,
    description: 'AI articles and insights from HackerNoon community',
    language: 'en',
  },
  {
    name: 'arXiv AI Papers',
    url: 'https://export.arxiv.org/rss/cs.AI',
    type: 'research',
    category: 'Academic Research',
    isActive: true,
    failureCount: 0,
    avgResponseTime: 0,
    healthScore: 100,
    fetchInterval: 60,
    description: 'Latest AI research papers from arXiv',
    language: 'en',
  },
  {
    name: 'AI Models Substack',
    url: 'https://aimodels.substack.com/feed',
    type: 'blog',
    category: 'AI Research',
    isActive: true,
    failureCount: 0,
    avgResponseTime: 0,
    healthScore: 100,
    fetchInterval: 60,
    description: 'AI model updates and analysis newsletter',
    language: 'en',
  },
  {
    name: 'The Decoder',
    url: 'https://the-decoder.com/feed/',
    type: 'news',
    category: 'AI News',
    isActive: true,
    failureCount: 0,
    avgResponseTime: 0,
    healthScore: 100,
    fetchInterval: 30,
    description: 'Comprehensive AI news and analysis',
    language: 'en',
  },
  {
    name: 'AI Intelligence News',
    url: 'https://www.artificialintelligence-news.com/feed/',
    type: 'news',
    category: 'AI News',
    isActive: true,
    failureCount: 0,
    avgResponseTime: 0,
    healthScore: 100,
    fetchInterval: 30,
    description: 'Latest artificial intelligence industry news',
    language: 'en',
  },

  // YouTube Channels
  {
    name: 'Two Minute Papers',
    url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCbfYPyITQ-7l4upoX8nvctg',
    type: 'youtube',
    category: 'AI Education',
    isActive: true,
    failureCount: 0,
    avgResponseTime: 0,
    healthScore: 100,
    fetchInterval: 60,
    description: 'AI research paper explanations and breakthroughs',
    language: 'en',
  },
  {
    name: 'Lex Fridman',
    url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCSHZKyawb77ixDdsGog4iWA',
    type: 'youtube',
    category: 'AI Interviews',
    isActive: true,
    failureCount: 0,
    avgResponseTime: 0,
    healthScore: 100,
    fetchInterval: 120,
    description: 'Long-form conversations with AI researchers and tech leaders',
    language: 'en',
  },
  {
    name: 'AI Explained',
    url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCNJ1Ymd5yFuUPtn21xtRbbw',
    type: 'youtube',
    category: 'AI Education',
    isActive: true,
    failureCount: 0,
    avgResponseTime: 0,
    healthScore: 100,
    fetchInterval: 60,
    description: 'Clear explanations of AI concepts and research',
    language: 'en',
  },
  {
    name: 'Yannic Kilcher',
    url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCZHmQk67mSJgfCCTn7xBfew',
    type: 'youtube',
    category: 'AI Research',
    isActive: true,
    failureCount: 0,
    avgResponseTime: 0,
    healthScore: 100,
    fetchInterval: 60,
    description: 'Deep dives into AI research papers and machine learning',
    language: 'en',
  },
  {
    name: '3Blue1Brown',
    url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCYO_jab_esuFRV4b17AJtAw',
    type: 'youtube',
    category: 'Mathematics & AI',
    isActive: true,
    failureCount: 0,
    avgResponseTime: 0,
    healthScore: 100,
    fetchInterval: 120,
    description: 'Mathematical foundations of neural networks and AI',
    language: 'en',
  },
  {
    name: 'Sentdex',
    url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCfzlCWGWYyIQ0aLC5w48gBQ',
    type: 'youtube',
    category: 'AI Programming',
    isActive: true,
    failureCount: 0,
    avgResponseTime: 0,
    healthScore: 100,
    fetchInterval: 60,
    description: 'Python programming tutorials for machine learning and AI',
    language: 'en',
  },
  {
    name: 'Machine Learning Street Talk',
    url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCMLtBahI5DMrt0NPvDSoIRQ',
    type: 'youtube',
    category: 'AI Discussions',
    isActive: true,
    failureCount: 0,
    avgResponseTime: 0,
    healthScore: 100,
    fetchInterval: 120,
    description: 'Discussions with leading AI researchers and practitioners',
    language: 'en',
  },
  {
    name: 'Andrej Karpathy',
    url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCPk8m_r6fkUSYmvgCBwq-sw',
    type: 'youtube',
    category: 'AI Education',
    isActive: true,
    failureCount: 0,
    avgResponseTime: 0,
    healthScore: 100,
    fetchInterval: 120,
    description: 'Neural networks and deep learning from Tesla AI director',
    language: 'en',
  },
  {
    name: 'AI Coffee Break',
    url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCqYPhGiB9tkShUT-gqQVLzw',
    type: 'youtube',
    category: 'AI News',
    isActive: true,
    failureCount: 0,
    avgResponseTime: 0,
    healthScore: 100,
    fetchInterval: 60,
    description: 'Quick AI news updates and research summaries',
    language: 'en',
  },
  {
    name: 'Robert Miles',
    url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCLB7AzTwc6VFZrBsO2ucBMg',
    type: 'youtube',
    category: 'AI Safety',
    isActive: true,
    failureCount: 0,
    avgResponseTime: 0,
    healthScore: 100,
    fetchInterval: 120,
    description: 'AI safety and alignment research explanations',
    language: 'en',
  },
  {
    name: 'Welch Labs',
    url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UConVfxXodg78Tzh5nNu85Ew',
    type: 'youtube',
    category: 'AI Education',
    isActive: true,
    failureCount: 0,
    avgResponseTime: 0,
    healthScore: 100,
    fetchInterval: 120,
    description: 'Educational videos about machine learning and neural networks',
    language: 'en',
  },
  {
    name: 'CodeEmporium',
    url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC7kw6Mth-PFYPR5ZfU7wQCQ',
    type: 'youtube',
    category: 'AI Programming',
    isActive: true,
    failureCount: 0,
    avgResponseTime: 0,
    healthScore: 100,
    fetchInterval: 60,
    description: 'Programming tutorials for AI and machine learning',
    language: 'en',
  },
  {
    name: 'Computerphile',
    url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC9-y-6csu5WGm29I7JiwpnA',
    type: 'youtube',
    category: 'Computer Science',
    isActive: true,
    failureCount: 0,
    avgResponseTime: 0,
    healthScore: 100,
    fetchInterval: 60,
    description: 'Computer science concepts including AI and machine learning',
    language: 'en',
  },
];

/**
 * RSS Feed categories for filtering
 */
export const RSS_CATEGORIES = {
  'AI News': ['WIRED AI', 'The Decoder', 'AI Intelligence News', 'AI Coffee Break'],
  'Technology News': ['KnowTechie AI', 'HackerNoon AI'],
  'AI Research': ['HuggingFace Blog', 'AI Models Substack', 'Yannic Kilcher'],
  'Academic Research': ['arXiv AI Papers'],
  'Developer Community': ['Dev.to'],
  'AI Education': [
    'Two Minute Papers',
    'AI Explained',
    '3Blue1Brown',
    'Andrej Karpathy',
    'Welch Labs',
  ],
  'AI Interviews': ['Lex Fridman'],
  'AI Discussions': ['Machine Learning Street Talk'],
  'AI Programming': ['Sentdex', 'CodeEmporium'],
  'AI Safety': ['Robert Miles'],
  'Mathematics & AI': ['3Blue1Brown'],
  'Computer Science': ['Computerphile'],
};

/**
 * RSS Feed types
 */
export const RSS_TYPES = {
  news: 'News Articles',
  blog: 'Blog Posts',
  research: 'Research Papers',
  youtube: 'YouTube Videos',
};

/**
 * Default fetch intervals by type (in minutes)
 */
export const DEFAULT_FETCH_INTERVALS = {
  news: 15, // News feeds - check every 15 minutes
  blog: 30, // Blog feeds - check every 30 minutes
  research: 60, // Research feeds - check every hour
  youtube: 60, // YouTube feeds - check every hour
};

/**
 * RSS Feed management service
 */
export class RSSFeedManager {
  /**
   * Get all feed configurations
   */
  static getAllFeeds(): typeof RSS_FEED_CONFIGS {
    return RSS_FEED_CONFIGS;
  }

  /**
   * Get feeds by type
   */
  static getFeedsByType(type: 'news' | 'blog' | 'research' | 'youtube'): typeof RSS_FEED_CONFIGS {
    return RSS_FEED_CONFIGS.filter((feed) => feed.type === type);
  }

  /**
   * Get feeds by category
   */
  static getFeedsByCategory(category: string): typeof RSS_FEED_CONFIGS {
    return RSS_FEED_CONFIGS.filter((feed) => feed.category === category);
  }

  /**
   * Get active feeds only
   */
  static getActiveFeeds(): typeof RSS_FEED_CONFIGS {
    return RSS_FEED_CONFIGS.filter((feed) => feed.isActive);
  }

  /**
   * Get feeds due for refresh
   */
  static getFeedsDueForRefresh(): typeof RSS_FEED_CONFIGS {
    const now = new Date();
    return RSS_FEED_CONFIGS.filter((feed) => {
      if (!feed.isActive) return false;

      const lastFetch = feed.lastFetchedAt || new Date(0);
      const intervalMs = feed.fetchInterval * 60 * 1000;
      const nextFetch = new Date(lastFetch.getTime() + intervalMs);

      return now >= nextFetch;
    });
  }

  /**
   * Validate RSS feed URL
   */
  static validateFeedUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return ['http:', 'https:'].includes(urlObj.protocol);
    } catch {
      return false;
    }
  }

  /**
   * Get recommended feed categories
   */
  static getCategories(): string[] {
    return Object.keys(RSS_CATEGORIES);
  }

  /**
   * Get feeds in category
   */
  static getFeedsInCategory(category: string): string[] {
    return RSS_CATEGORIES[category as keyof typeof RSS_CATEGORIES] || [];
  }

  /**
   * Get feed statistics
   */
  static getFeedStats() {
    const total = RSS_FEED_CONFIGS.length;
    const active = RSS_FEED_CONFIGS.filter((f) => f.isActive).length;
    const byType = {
      news: RSS_FEED_CONFIGS.filter((f) => f.type === 'news').length,
      blog: RSS_FEED_CONFIGS.filter((f) => f.type === 'blog').length,
      research: RSS_FEED_CONFIGS.filter((f) => f.type === 'research').length,
      youtube: RSS_FEED_CONFIGS.filter((f) => f.type === 'youtube').length,
    };

    return {
      total,
      active,
      inactive: total - active,
      byType,
      categories: Object.keys(RSS_CATEGORIES).length,
    };
  }

  /**
   * Create feed configuration with defaults
   */
  static createFeedConfig(
    name: string,
    url: string,
    type: 'news' | 'blog' | 'research' | 'youtube',
    category?: string,
  ): Omit<RSSFeed, '_id' | 'createdAt' | 'updatedAt'> {
    if (!this.validateFeedUrl(url)) {
      throw new Error('Invalid RSS feed URL');
    }

    return {
      name,
      url,
      type,
      category: category || type,
      isActive: true,
      failureCount: 0,
      avgResponseTime: 0,
      healthScore: 100,
      fetchInterval: DEFAULT_FETCH_INTERVALS[type],
      description: `${name} - ${type} feed`,
      language: 'en',
    };
  }
}

/**
 * Export default feed configurations
 */
export default RSS_FEED_CONFIGS;
