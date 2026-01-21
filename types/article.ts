/**
 * Article Type Definitions
 * 
 * Core TypeScript interfaces for article data structure
 * Used across the news aggregator application
 * 
 * @module types/article
 * @created 2026-01-20
 */

/**
 * Article source types supported by the aggregator
 */
export type SourceType = 'rss' | 'reddit' | 'youtube' | 'x' | 'other';

/**
 * Article source metadata
 */
export interface ArticleSource {
  /** Unique identifier for the source */
  id: string;
  /** Display name of the source */
  name: string;
  /** Type of source */
  type: SourceType;
  /** Source icon/logo URL (optional) */
  icon?: string;
  /** Source URL */
  url: string;
}

/**
 * Article engagement metrics
 */
export interface ArticleMetrics {
  /** Number of upvotes/likes */
  upvotes: number;
  /** Number of comments/replies */
  comments: number;
  /** Number of shares */
  shares: number;
  /** Current rating score (calculated) */
  rating: number;
}

/**
 * Main article data structure
 */
export interface Article {
  /** Unique article identifier */
  id: string;
  /** Article title */
  title: string;
  /** Article excerpt/summary */
  excerpt: string;
  /** Full article URL */
  url: string;
  /** Article source information */
  source: ArticleSource;
  /** Publication timestamp (ISO 8601) */
  publishedAt: string;
  /** Engagement metrics */
  metrics: ArticleMetrics;
  /** Article tags/categories */
  tags: string[];
  /** Article author (optional) */
  author?: string;
  /** Thumbnail image URL (optional) */
  thumbnail?: string;
}

/**
 * Filter options for article display
 */
export interface ArticleFilters {
  /** Filter by source type */
  sourceType?: SourceType | 'all';
  /** Filter by tag */
  tag?: string;
  /** Sort order */
  sortBy: 'rating' | 'recent' | 'trending';
  /** Time range filter */
  timeRange?: '1h' | '6h' | '24h' | '7d' | 'all';
}
