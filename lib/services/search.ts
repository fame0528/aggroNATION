/**
 * @fileoverview Advanced search service for RSS content
 * @author aggroNATION Development Team
 * @version 1.0.0
 */

import { getModels } from '@/lib/db/models/rss';
import { RSSArticle, RSSVideo } from '@/lib/types/rss';

export interface SearchQuery {
  query: string;
  filters?: {
    type?: 'article' | 'video' | 'all';
    category?: string;
    source?: string;
    dateFrom?: Date;
    dateTo?: Date;
    tags?: string[];
  };
  sort?: {
    field: 'relevance' | 'date' | 'views' | 'likes';
    order: 'asc' | 'desc';
  };
  pagination?: {
    page: number;
    limit: number;
  };
}

export interface SearchResult {
  articles: RSSArticle[];
  videos: RSSVideo[];
  total: {
    articles: number;
    videos: number;
    all: number;
  };
  facets: {
    categories: Array<{ name: string; count: number }>;
    sources: Array<{ name: string; count: number }>;
    tags: Array<{ name: string; count: number }>;
  };
  suggestions: string[];
  query: string;
  took: number;
}

/**
 * Advanced search service
 */
export class SearchService {
  /**
   * Search across articles and videos
   */
  async search(searchQuery: SearchQuery): Promise<SearchResult> {
    const startTime = Date.now();
    const { articles: articlesModel, videos: videosModel } = await getModels();

    // Build MongoDB search filters
    const mongoFilter = this.buildMongoFilter(searchQuery);

    // Determine what to search
    const searchArticles =
      !searchQuery.filters?.type ||
      searchQuery.filters.type === 'article' ||
      searchQuery.filters.type === 'all';
    const searchVideos =
      !searchQuery.filters?.type ||
      searchQuery.filters.type === 'video' ||
      searchQuery.filters.type === 'all';

    const { page = 1, limit = 20 } = searchQuery.pagination || {};

    // Execute searches
    const [articlesResult, videosResult] = await Promise.all([
      searchArticles
        ? articlesModel.getArticles({
            ...mongoFilter,
            page,
            limit: searchQuery.filters?.type === 'article' ? limit : Math.ceil(limit / 2),
            search: searchQuery.query,
          })
        : { articles: [], total: 0 },

      searchVideos
        ? videosModel.getVideos({
            ...mongoFilter,
            page,
            limit: searchQuery.filters?.type === 'video' ? limit : Math.ceil(limit / 2),
            search: searchQuery.query,
          })
        : { videos: [], total: 0 },
    ]);

    // Apply advanced sorting if needed
    const sortedArticles = this.sortResults(articlesResult.articles, searchQuery);
    const sortedVideos = this.sortResults(videosResult.videos, searchQuery);

    // Generate facets
    const facets = await this.generateFacets(searchQuery.query, mongoFilter);

    // Generate search suggestions
    const suggestions = this.generateSuggestions(searchQuery.query);

    const took = Date.now() - startTime;

    return {
      articles: sortedArticles,
      videos: sortedVideos,
      total: {
        articles: articlesResult.total,
        videos: videosResult.total,
        all: articlesResult.total + videosResult.total,
      },
      facets,
      suggestions,
      query: searchQuery.query,
      took,
    };
  }

  /**
   * Build MongoDB filter from search query
   */
  private buildMongoFilter(searchQuery: SearchQuery): any {
    const filter: any = {};

    if (searchQuery.filters?.category) {
      filter.category = searchQuery.filters.category;
    }

    if (searchQuery.filters?.source) {
      filter.source = searchQuery.filters.source;
    }

    if (searchQuery.filters?.dateFrom || searchQuery.filters?.dateTo) {
      filter.publishedAt = {};
      if (searchQuery.filters.dateFrom) {
        filter.publishedAt.$gte = searchQuery.filters.dateFrom;
      }
      if (searchQuery.filters.dateTo) {
        filter.publishedAt.$lte = searchQuery.filters.dateTo;
      }
    }

    if (searchQuery.filters?.tags && searchQuery.filters.tags.length > 0) {
      filter.tags = { $in: searchQuery.filters.tags };
    }

    return filter;
  }

  /**
   * Sort search results
   */
  private sortResults(results: any[], searchQuery: SearchQuery): any[] {
    if (!searchQuery.sort) {
      return results;
    }

    const { field, order } = searchQuery.sort;
    const multiplier = order === 'asc' ? 1 : -1;

    return results.sort((a, b) => {
      switch (field) {
        case 'date':
          return (
            (new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime()) * multiplier
          );
        case 'views':
          return ((a.views || a.viewCount || 0) - (b.views || b.viewCount || 0)) * multiplier;
        case 'likes':
          return ((a.likes || a.likeCount || 0) - (b.likes || b.likeCount || 0)) * multiplier;
        case 'relevance':
        default:
          // Simple relevance scoring based on query presence in title
          const aScore = this.calculateRelevanceScore(a, searchQuery.query);
          const bScore = this.calculateRelevanceScore(b, searchQuery.query);
          return (aScore - bScore) * multiplier;
      }
    });
  }

  /**
   * Calculate relevance score for search result
   */
  private calculateRelevanceScore(item: any, query: string): number {
    let score = 0;
    const queryLower = query.toLowerCase();

    // Title match
    if (item.title?.toLowerCase().includes(queryLower)) {
      score += 10;
    }

    // Description/summary match
    if (
      item.description?.toLowerCase().includes(queryLower) ||
      item.summary?.toLowerCase().includes(queryLower)
    ) {
      score += 5;
    }

    // Tag match
    if (item.tags?.some((tag: string) => tag.toLowerCase().includes(queryLower))) {
      score += 3;
    }

    // Author/source match
    if (
      item.author?.toLowerCase().includes(queryLower) ||
      item.source?.toLowerCase().includes(queryLower)
    ) {
      score += 2;
    }

    return score;
  }

  /**
   * Generate search facets
   */
  private async generateFacets(query: string, filter: any): Promise<SearchResult['facets']> {
    // This is a simplified implementation
    // In production, you'd use MongoDB aggregation pipeline for efficient faceting

    try {
      const { articles: articlesModel, videos: videosModel } = await getModels();

      // Get sample data for facets
      const [articlesData, videosData] = await Promise.all([
        articlesModel.getArticles({ limit: 1000 }),
        videosModel.getVideos({ limit: 1000 }),
      ]);

      const allContent = [...articlesData.articles, ...videosData.videos];

      // Calculate facets
      const categoryMap = new Map<string, number>();
      const sourceMap = new Map<string, number>();
      const tagMap = new Map<string, number>();

      allContent.forEach((item) => {
        // Categories
        if (item.category) {
          categoryMap.set(item.category, (categoryMap.get(item.category) || 0) + 1);
        }

        // Sources
        const source =
          'source' in item ? item.source : 'channelName' in item ? item.channelName : null;
        if (source) {
          sourceMap.set(source, (sourceMap.get(source) || 0) + 1);
        }

        // Tags
        if (item.tags) {
          item.tags.forEach((tag: string) => {
            tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
          });
        }
      });

      return {
        categories: Array.from(categoryMap.entries())
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10),
        sources: Array.from(sourceMap.entries())
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10),
        tags: Array.from(tagMap.entries())
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 20),
      };
    } catch (error) {
      console.error('Error generating facets:', error);
      return {
        categories: [],
        sources: [],
        tags: [],
      };
    }
  }

  /**
   * Generate search suggestions
   */
  private generateSuggestions(query: string): string[] {
    // Simple suggestions based on common AI/ML terms
    const commonTerms = [
      'machine learning',
      'artificial intelligence',
      'neural networks',
      'deep learning',
      'transformers',
      'GPT',
      'LLM',
      'computer vision',
      'natural language processing',
      'reinforcement learning',
      'pytorch',
      'tensorflow',
      'hugging face',
      'openai',
      'ai models',
      'ai research',
    ];

    const queryLower = query.toLowerCase();
    return commonTerms
      .filter((term) => term.includes(queryLower) && term !== queryLower)
      .slice(0, 5);
  }

  /**
   * Get trending searches
   */
  async getTrendingSearches(): Promise<string[]> {
    // This would typically be stored in database and updated based on actual search queries
    return [
      'ChatGPT',
      'Stable Diffusion',
      'Transformer models',
      'AI safety',
      'Computer vision',
      'Large language models',
      'OpenAI',
      'Machine learning',
    ];
  }

  /**
   * Get search history for a user
   */
  async getSearchHistory(userId: string, limit: number = 10): Promise<string[]> {
    // This would fetch from user search history in database
    return [];
  }
}

/**
 * Global search service instance
 */
export const searchService = new SearchService();
