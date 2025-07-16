/**
 * @fileoverview RSS and content type definitions for aggroNATION
 * @author aggroNATION Development Team
 * @version 1.0.0
 */

import { ObjectId } from 'mongodb';

/**
 * RSS Article interface for news content
 */
export interface RSSArticle {
  _id?: ObjectId;
  /** Unique hash for deduplication */
  hash: string;
  /** Article title */
  title: string;
  /** Article summary/excerpt */
  summary: string;
  /** Full article content */
  content: string;
  /** Article author */
  author: string;
  /** Source publication name */
  source: string;
  /** Original article URL */
  sourceUrl: string;
  /** RSS feed URL */
  feedUrl: string;
  /** Publication timestamp */
  publishedAt: Date;
  /** When we fetched this article */
  fetchedAt: Date;
  /** Content category */
  category: string;
  /** Content tags */
  tags: string[];
  /** Is this breaking news */
  isBreaking: boolean;
  /** Estimated reading time */
  readTime: string;
  /** Article status */
  status: 'active' | 'archived' | 'hidden';
  /** View count */
  views?: number;
  /** Article language */
  language?: string;
  /** Article image URL */
  imageUrl?: string;
}

/**
 * RSS Video interface for YouTube content
 */
export interface RSSVideo {
  _id?: ObjectId;
  /** Unique hash for deduplication */
  hash: string;
  /** Video title */
  title: string;
  /** Video description */
  description: string;
  /** Video thumbnail URL */
  thumbnail: string;
  /** YouTube video URL */
  videoUrl: string;
  /** YouTube video ID */
  videoId: string;
  /** Channel name */
  channelName: string;
  /** YouTube channel ID */
  channelId: string;
  /** RSS feed URL */
  feedUrl: string;
  /** Video duration */
  duration: string;
  /** View count */
  viewCount: number;
  /** Publication timestamp */
  publishedAt: Date;
  /** When we fetched this video */
  fetchedAt: Date;
  /** Video tags */
  tags: string[];
  /** Video category */
  category: string;
  /** Video status */
  status: 'active' | 'archived' | 'hidden';
  /** Video language */
  language?: string;
  /** Like count */
  likeCount?: number;
  /** Comment count */
  commentCount?: number;
}

/**
 * RSS Feed configuration interface
 */
export interface RSSFeed {
  _id?: ObjectId;
  /** Feed display name */
  name: string;
  /** RSS feed URL */
  url: string;
  /** Feed type */
  type: 'news' | 'youtube' | 'research' | 'blog';
  /** Feed category */
  category: string;
  /** Is feed active */
  isActive: boolean;
  /** Last fetch attempt */
  lastFetchedAt?: Date;
  /** Last successful fetch */
  lastSuccessAt?: Date;
  /** Consecutive failure count */
  failureCount: number;
  /** Average response time in ms */
  avgResponseTime: number;
  /** Health score (0-100) */
  healthScore: number;
  /** Fetch interval in minutes */
  fetchInterval: number;
  /** Feed description */
  description?: string;
  /** Feed icon URL */
  iconUrl?: string;
  /** Feed language */
  language?: string;
  /** Created timestamp */
  createdAt: Date;
  /** Updated timestamp */
  updatedAt: Date;
}

/**
 * RSS Fetch Log interface for monitoring
 */
export interface RSSFetchLog {
  _id?: ObjectId;
  /** Feed ID */
  feedId: ObjectId;
  /** Feed URL */
  feedUrl: string;
  /** Fetch timestamp */
  fetchedAt: Date;
  /** Was fetch successful */
  success: boolean;
  /** Response time in ms */
  responseTime: number;
  /** Items found in feed */
  itemsFound: number;
  /** New items added */
  newItems: number;
  /** Error message if failed */
  errorMessage?: string;
  /** HTTP status code */
  statusCode?: number;
  /** Response size in bytes */
  responseSize?: number;
}

/**
 * Analytics Event interface
 */
export interface AnalyticsEvent {
  _id?: ObjectId;
  /** Event type */
  eventType: 'view' | 'click' | 'share' | 'bookmark' | 'search';
  /** Content type */
  contentType: 'article' | 'video' | 'page';
  /** Content ID */
  contentId: string;
  /** User ID (if logged in) */
  userId?: string;
  /** Session ID */
  sessionId: string;
  /** User IP address (hashed) */
  ipHash: string;
  /** User agent */
  userAgent: string;
  /** Referrer URL */
  referrer?: string;
  /** Event timestamp */
  timestamp: Date;
  /** Additional event data */
  metadata?: Record<string, any>;
}

/**
 * User preferences interface
 */
export interface UserPreferences {
  _id?: ObjectId;
  /** User ID */
  userId: string;
  /** Preferred categories */
  categories: string[];
  /** Email notifications enabled */
  emailNotifications: boolean;
  /** Push notifications enabled */
  pushNotifications: boolean;
  /** Notification frequency */
  notificationFrequency: 'immediate' | 'daily' | 'weekly';
  /** Theme preference */
  theme: 'dark' | 'light' | 'auto';
  /** Language preference */
  language: string;
  /** Reading list IDs */
  readingList: string[];
  /** Bookmarked items */
  bookmarks: string[];
  /** Blocked sources */
  blockedSources: string[];
  /** Created timestamp */
  createdAt: Date;
  /** Updated timestamp */
  updatedAt: Date;
}

/**
 * Search Query interface
 */
export interface SearchQuery {
  _id?: ObjectId;
  /** Search query text */
  query: string;
  /** Query hash for analytics */
  queryHash: string;
  /** User ID (if logged in) */
  userId?: string;
  /** Session ID */
  sessionId: string;
  /** Results count */
  resultsCount: number;
  /** Search timestamp */
  timestamp: Date;
  /** Search filters applied */
  filters?: {
    category?: string;
    dateRange?: string;
    contentType?: string;
  };
}

/**
 * Content recommendation interface
 */
export interface ContentRecommendation {
  contentId: string;
  contentType: 'article' | 'video';
  score: number;
  reason: string;
  factors: string[];
}

/**
 * RSS Parser result interface
 */
export interface RSSParseResult {
  success: boolean;
  articles?: RSSArticle[];
  videos?: RSSVideo[];
  error?: string;
  responseTime: number;
  itemsFound: number;
  newItems: number;
}

/**
 * Feed health status
 */
export interface FeedHealth {
  feedId: string;
  url: string;
  isHealthy: boolean;
  lastSuccess: Date | null;
  failureCount: number;
  avgResponseTime: number;
  healthScore: number;
  issues: string[];
}

/**
 * System stats interface
 */
export interface SystemStats {
  totalFeeds: number;
  activeFeeds: number;
  totalArticles: number;
  totalVideos: number;
  articlesToday: number;
  videosToday: number;
  avgFetchTime: number;
  successRate: number;
  lastUpdate: Date;
}
