/**
 * @fileoverview Analytics and monitoring service
 * @author aggroNATION Development Team
 * @version 1.0.0
 */

import { getModels } from '@/lib/db/models/rss';

export interface AnalyticsEvent {
  id: string;
  type: 'page_view' | 'article_read' | 'video_watch' | 'search' | 'error' | 'api_call';
  data: Record<string, any>;
  userId?: string;
  sessionId: string;
  timestamp: number;
  userAgent?: string;
  ip?: string;
  referrer?: string;
}

export interface DashboardStats {
  overview: {
    totalArticles: number;
    totalVideos: number;
    totalFeeds: number;
    activeFeeds: number;
  };
  activity: {
    last24h: {
      articles: number;
      videos: number;
      pageViews: number;
      searches: number;
    };
    last7d: {
      articles: number;
      videos: number;
      pageViews: number;
      searches: number;
    };
  };
  trends: {
    topCategories: Array<{ name: string; count: number }>;
    topSources: Array<{ name: string; count: number }>;
    topSearches: Array<{ query: string; count: number }>;
  };
  performance: {
    avgResponseTime: number;
    errorRate: number;
    uptime: number;
  };
  feeds: {
    healthy: number;
    warning: number;
    critical: number;
  };
}

/**
 * Analytics service
 */
export class AnalyticsService {
  private static instance: AnalyticsService;
  private events: AnalyticsEvent[] = [];
  private maxEventsSize = 10000;

  private constructor() {}

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  /**
   * Track an analytics event
   */
  track(
    type: AnalyticsEvent['type'],
    data: Record<string, any>,
    context?: {
      userId?: string;
      sessionId?: string;
      userAgent?: string;
      ip?: string;
      referrer?: string;
    },
  ): void {
    const event: AnalyticsEvent = {
      id: this.generateEventId(),
      type,
      data,
      userId: context?.userId,
      sessionId: context?.sessionId || this.generateSessionId(),
      timestamp: Date.now(),
      userAgent: context?.userAgent,
      ip: context?.ip,
      referrer: context?.referrer,
    };

    this.events.push(event);

    // Keep events size under control
    if (this.events.length > this.maxEventsSize) {
      this.events.shift();
    }

    // In production, you would also send to external analytics service
    this.processEvent(event);
  }

  /**
   * Get comprehensive dashboard statistics
   */
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const { articles, videos, feeds } = await getModels();

      // Get basic counts
      const [articlesResult, videosResult, feedsHealth] = await Promise.all([
        articles.getArticles({ limit: 1 }),
        videos.getVideos({ limit: 1 }),
        feeds.getHealthStatus(),
      ]);

      const now = Date.now();
      const last24h = now - 24 * 60 * 60 * 1000;
      const last7d = now - 7 * 24 * 60 * 60 * 1000;

      // Calculate activity metrics
      const activity24h = this.getActivityMetrics(last24h);
      const activity7d = this.getActivityMetrics(last7d);

      // Calculate trends
      const trends = this.getTrends();

      // Calculate performance metrics
      const performance = this.getPerformanceMetrics();

      // Calculate feed health
      const feedHealth = {
        healthy: feedsHealth.filter((f) => f.healthScore > 70).length,
        warning: feedsHealth.filter((f) => f.healthScore >= 30 && f.healthScore <= 70).length,
        critical: feedsHealth.filter((f) => f.healthScore < 30).length,
      };

      return {
        overview: {
          totalArticles: articlesResult.total,
          totalVideos: videosResult.total,
          totalFeeds: feedsHealth.length,
          activeFeeds: feedsHealth.filter((f) => f.isActive).length,
        },
        activity: {
          last24h: activity24h,
          last7d: activity7d,
        },
        trends,
        performance,
        feeds: feedHealth,
      };
    } catch (error) {
      console.error('Error getting dashboard stats:', error);

      // Return default stats
      return {
        overview: {
          totalArticles: 0,
          totalVideos: 0,
          totalFeeds: 0,
          activeFeeds: 0,
        },
        activity: {
          last24h: { articles: 0, videos: 0, pageViews: 0, searches: 0 },
          last7d: { articles: 0, videos: 0, pageViews: 0, searches: 0 },
        },
        trends: {
          topCategories: [],
          topSources: [],
          topSearches: [],
        },
        performance: {
          avgResponseTime: 0,
          errorRate: 0,
          uptime: process.uptime(),
        },
        feeds: {
          healthy: 0,
          warning: 0,
          critical: 0,
        },
      };
    }
  }

  /**
   * Get user behavior analytics
   */
  getUserAnalytics(timeRange: '24h' | '7d' | '30d' = '7d'): {
    pageViews: Array<{ date: string; count: number }>;
    topPages: Array<{ page: string; views: number }>;
    searchQueries: Array<{ query: string; count: number }>;
    userFlow: Array<{ from: string; to: string; count: number }>;
  } {
    const timeMs = this.getTimeRangeMs(timeRange);
    const cutoff = Date.now() - timeMs;

    const relevantEvents = this.events.filter((e) => e.timestamp >= cutoff);

    // Page views over time
    const pageViewsByDate = new Map<string, number>();
    const topPagesMap = new Map<string, number>();
    const searchQueriesMap = new Map<string, number>();

    relevantEvents.forEach((event) => {
      const date = new Date(event.timestamp).toISOString().split('T')[0];

      if (event.type === 'page_view') {
        pageViewsByDate.set(date, (pageViewsByDate.get(date) || 0) + 1);

        const page = event.data.page || 'unknown';
        topPagesMap.set(page, (topPagesMap.get(page) || 0) + 1);
      }

      if (event.type === 'search') {
        const query = event.data.query || '';
        if (query) {
          searchQueriesMap.set(query, (searchQueriesMap.get(query) || 0) + 1);
        }
      }
    });

    return {
      pageViews: Array.from(pageViewsByDate.entries())
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date)),
      topPages: Array.from(topPagesMap.entries())
        .map(([page, views]) => ({ page, views }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 10),
      searchQueries: Array.from(searchQueriesMap.entries())
        .map(([query, count]) => ({ query, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      userFlow: [], // Simplified - would require session tracking
    };
  }

  /**
   * Track page view
   */
  trackPageView(page: string, context?: any): void {
    this.track('page_view', { page }, context);
  }

  /**
   * Track article read
   */
  trackArticleRead(articleId: string, articleTitle: string, context?: any): void {
    this.track('article_read', { articleId, articleTitle }, context);
  }

  /**
   * Track video watch
   */
  trackVideoWatch(videoId: string, videoTitle: string, context?: any): void {
    this.track('video_watch', { videoId, videoTitle }, context);
  }

  /**
   * Track search
   */
  trackSearch(query: string, results: number, context?: any): void {
    this.track('search', { query, results }, context);
  }

  /**
   * Track error
   */
  trackError(error: string, stack?: string, context?: any): void {
    this.track('error', { error, stack }, context);
  }

  /**
   * Track API call
   */
  trackAPICall(
    endpoint: string,
    method: string,
    responseTime: number,
    statusCode: number,
    context?: any,
  ): void {
    this.track('api_call', { endpoint, method, responseTime, statusCode }, context);
  }

  /**
   * Get real-time metrics
   */
  getRealTimeMetrics(): {
    activeUsers: number;
    requestsPerMinute: number;
    errorsPerMinute: number;
    avgResponseTime: number;
  } {
    const now = Date.now();
    const lastMinute = now - 60000;
    const last5Minutes = now - 300000;

    const recentEvents = this.events.filter((e) => e.timestamp >= lastMinute);
    const last5MinEvents = this.events.filter((e) => e.timestamp >= last5Minutes);

    const uniqueUsers = new Set(last5MinEvents.filter((e) => e.sessionId).map((e) => e.sessionId))
      .size;

    const apiCalls = recentEvents.filter((e) => e.type === 'api_call');
    const errors = recentEvents.filter((e) => e.type === 'error');

    const avgResponseTime =
      apiCalls.length > 0
        ? apiCalls.reduce((sum, e) => sum + (e.data.responseTime || 0), 0) / apiCalls.length
        : 0;

    return {
      activeUsers: uniqueUsers,
      requestsPerMinute: apiCalls.length,
      errorsPerMinute: errors.length,
      avgResponseTime: Math.round(avgResponseTime),
    };
  }

  /**
   * Get export data for external analytics
   */
  exportData(timeRange: '24h' | '7d' | '30d' = '7d'): AnalyticsEvent[] {
    const timeMs = this.getTimeRangeMs(timeRange);
    const cutoff = Date.now() - timeMs;

    return this.events.filter((e) => e.timestamp >= cutoff);
  }

  /**
   * Clear analytics data
   */
  clearData(): void {
    this.events = [];
  }

  // Private helper methods

  private generateEventId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  }

  private generateSessionId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 12);
  }

  private processEvent(event: AnalyticsEvent): void {
    // Here you could send to external analytics services like Google Analytics, Mixpanel, etc.
    console.log('Analytics event:', event.type, event.data);
  }

  private getActivityMetrics(since: number): {
    articles: number;
    videos: number;
    pageViews: number;
    searches: number;
  } {
    const relevantEvents = this.events.filter((e) => e.timestamp >= since);

    return {
      articles: relevantEvents.filter((e) => e.type === 'article_read').length,
      videos: relevantEvents.filter((e) => e.type === 'video_watch').length,
      pageViews: relevantEvents.filter((e) => e.type === 'page_view').length,
      searches: relevantEvents.filter((e) => e.type === 'search').length,
    };
  }

  private getTrends(): DashboardStats['trends'] {
    // This is simplified - in production you'd calculate from actual content data
    return {
      topCategories: [
        { name: 'Machine Learning', count: 45 },
        { name: 'AI Research', count: 32 },
        { name: 'Computer Vision', count: 28 },
        { name: 'NLP', count: 24 },
        { name: 'Robotics', count: 18 },
      ],
      topSources: [
        { name: 'Hugging Face', count: 67 },
        { name: 'OpenAI', count: 43 },
        { name: 'Google AI', count: 39 },
        { name: 'Meta AI', count: 31 },
        { name: 'DeepMind', count: 25 },
      ],
      topSearches: [
        { query: 'ChatGPT', count: 156 },
        { query: 'Stable Diffusion', count: 89 },
        { query: 'transformer models', count: 67 },
        { query: 'computer vision', count: 54 },
        { query: 'machine learning', count: 48 },
      ],
    };
  }

  private getPerformanceMetrics(): DashboardStats['performance'] {
    const apiEvents = this.events.filter((e) => e.type === 'api_call');
    const errorEvents = this.events.filter((e) => e.type === 'error');

    const avgResponseTime =
      apiEvents.length > 0
        ? apiEvents.reduce((sum, e) => sum + (e.data.responseTime || 0), 0) / apiEvents.length
        : 0;

    const errorRate = apiEvents.length > 0 ? (errorEvents.length / apiEvents.length) * 100 : 0;

    return {
      avgResponseTime: Math.round(avgResponseTime),
      errorRate: Math.round(errorRate * 100) / 100,
      uptime: process.uptime(),
    };
  }

  private getTimeRangeMs(timeRange: '24h' | '7d' | '30d'): number {
    switch (timeRange) {
      case '24h':
        return 24 * 60 * 60 * 1000;
      case '7d':
        return 7 * 24 * 60 * 60 * 1000;
      case '30d':
        return 30 * 24 * 60 * 60 * 1000;
      default:
        return 7 * 24 * 60 * 60 * 1000;
    }
  }
}

/**
 * Global analytics service instance
 */
export const analyticsService = AnalyticsService.getInstance();

/**
 * Convenience function to track events
 */
export function trackEvent(eventType: string, action: string, data?: Record<string, any>): void {
  const analytics = AnalyticsService.getInstance();
  analytics.track(eventType as any, {
    action,
    ...data,
  });
}

/**
 * Convenience function to get dashboard stats
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const analytics = AnalyticsService.getInstance();
  return analytics.getDashboardStats();
}
