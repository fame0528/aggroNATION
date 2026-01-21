/**
 * Content Type Definitions
 * 
 * Core TypeScript interfaces for aggregated content from multiple sources
 * Supports RSS feeds, Reddit posts, YouTube videos, X posts, and more
 * 
 * @module types/content
 * @created 2026-01-20
 */

/**
 * Content source types supported by the aggregator
 */
export type SourceType = 'rss' | 'reddit' | 'youtube' | 'x' | 'other';

/**
 * Content source metadata
 */
export interface ContentSource {
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
 * Content engagement metrics
 */
export interface ContentMetrics {
  /** Number of upvotes/likes */
  upvotes: number;
  /** Number of comments/replies */
  comments: number;
  /** Number of shares */
  shares: number;
  /** Current rating score (calculated with decay) */
  rating: number;
}

/**
 * Main content item data structure
 * Represents a single piece of content from any source type
 */
export interface ContentItem {
  /** Unique content identifier */
  id: string;
  /** Content title */
  title: string;
  /** Content excerpt/summary/description */
  excerpt: string;
  /** Full content URL */
  url: string;
  /** Content source information */
  source: ContentSource;
  /** Publication/posted timestamp (ISO 8601) */
  publishedAt: string;
  /** Engagement metrics */
  metrics: ContentMetrics;
  /** Content tags/categories */
  tags: string[];
  /** Content author/creator (optional) */
  author?: string;
  /** Thumbnail/preview image URL (optional) */
  thumbnail?: string;
  /** Video duration in seconds (for YouTube content) */
  duration?: number;
}

/**
 * Filter options for content display
 */
export interface ContentFilters {
  /** Filter by source type */
  sourceType?: SourceType | 'all';
  /** Filter by tag */
  tag?: string;
  /** Sort order */
  sortBy: 'rating' | 'recent' | 'trending';
  /** Time range filter */
  timeRange?: '1h' | '6h' | '24h' | '7d' | 'all';
}
