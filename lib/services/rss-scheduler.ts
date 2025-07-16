/**
 * @fileoverview Background job scheduler for RSS feed updates
 * @author aggroNATION Development Team
 * @version 1.0.0
 */

import { getModels } from '@/lib/db/models/rss';
import { rssParser } from '@/lib/services/rss-parser';
import { RSSFeed } from '@/lib/types/rss';

/**
 * RSS Background Job Scheduler
 */
export class RSSScheduler {
  private intervals: Map<string, NodeJS.Timeout> = new Map();
  private isRunning = false;

  /**
   * Start the scheduler
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      console.warn('RSS Scheduler is already running');
      return;
    }

    this.isRunning = true;
    console.log('Starting RSS Scheduler...');

    try {
      const { feeds } = await getModels();
      const activeFeeds = await feeds.getActiveFeeds();

      // Schedule each feed based on its fetch interval
      for (const feed of activeFeeds) {
        this.scheduleFeed(feed);
      }

      console.log(`RSS Scheduler started with ${activeFeeds.length} feeds`);
    } catch (error) {
      console.error('Failed to start RSS Scheduler:', error);
      this.isRunning = false;
    }
  }

  /**
   * Stop the scheduler
   */
  stop(): void {
    console.log('Stopping RSS Scheduler...');

    for (const [feedId, interval] of this.intervals) {
      clearInterval(interval);
      this.intervals.delete(feedId);
    }

    this.isRunning = false;
    console.log('RSS Scheduler stopped');
  }

  /**
   * Schedule a single feed
   */
  private scheduleFeed(feed: RSSFeed): void {
    const feedId = feed._id?.toString() || '';
    const intervalMs = (feed.fetchInterval || 30) * 60 * 1000; // Convert minutes to milliseconds

    // Clear existing interval if any
    if (this.intervals.has(feedId)) {
      clearInterval(this.intervals.get(feedId)!);
    }

    console.log(`Scheduling feed ${feed.name} every ${feed.fetchInterval} minutes`);

    // Schedule the fetch
    const interval = setInterval(async () => {
      await this.fetchFeed(feed);
    }, intervalMs);

    this.intervals.set(feedId, interval);

    // Run immediately for the first time
    this.fetchFeed(feed);
  }

  /**
   * Fetch a single feed
   */
  private async fetchFeed(feed: RSSFeed): Promise<void> {
    const feedId = feed._id?.toString() || '';
    const startTime = Date.now();

    try {
      console.log(`Fetching feed: ${feed.name}`);

      const { feeds, articles, videos } = await getModels();
      const result = await rssParser.parseFeed(feed);

      let newArticles = 0;
      let newVideos = 0;

      if (feed.type === 'youtube') {
        // Save videos
        for (const video of result.videos || []) {
          try {
            const saved = await videos.create({
              ...video,
              feedUrl: feed.url,
              fetchedAt: new Date(),
            });
            if (saved) newVideos++;
          } catch (error) {
            // Skip duplicates
          }
        }
      } else {
        // Save articles
        for (const article of result.articles || []) {
          try {
            const saved = await articles.create({
              ...article,
              feedUrl: feed.url,
              fetchedAt: new Date(),
            });
            if (saved) newArticles++;
          } catch (error) {
            // Skip duplicates
          }
        }
      }

      // Update feed health
      const responseTime = Date.now() - startTime;
      await feeds.updateHealth(feedId, true, responseTime);

      console.log(`Feed ${feed.name}: ${newArticles} articles, ${newVideos} videos`);
    } catch (error) {
      console.error(`Error fetching feed ${feed.name}:`, error);

      // Update feed health
      const responseTime = Date.now() - startTime;
      const { feeds } = await getModels();
      await feeds.updateHealth(feedId, false, responseTime, (error as Error).message);
    }
  }

  /**
   * Reschedule feeds (call after feed configuration changes)
   */
  async reschedule(): Promise<void> {
    console.log('Rescheduling RSS feeds...');

    // Stop all current intervals
    for (const [feedId, interval] of this.intervals) {
      clearInterval(interval);
      this.intervals.delete(feedId);
    }

    // Restart with updated configuration
    if (this.isRunning) {
      await this.start();
    }
  }

  /**
   * Get scheduler status
   */
  getStatus(): {
    isRunning: boolean;
    scheduledFeeds: number;
    activeIntervals: string[];
  } {
    return {
      isRunning: this.isRunning,
      scheduledFeeds: this.intervals.size,
      activeIntervals: Array.from(this.intervals.keys()),
    };
  }
}

/**
 * Global scheduler instance
 */
export const rssScheduler = new RSSScheduler();

/**
 * Initialize scheduler on module load (in production environments)
 */
if (process.env.NODE_ENV === 'production' && process.env.ENABLE_RSS_SCHEDULER !== 'false') {
  rssScheduler.start().catch(console.error);
}
