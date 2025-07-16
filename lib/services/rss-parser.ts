/**
 * @fileoverview Advanced RSS parsing service with error handling and data transformation
 * @author aggroNATION Development Team
 * @version 1.0.0
 */

import Parser from 'rss-parser';
import crypto from 'crypto';
import { RSSArticle, RSSVideo, RSSFeed, RSSParseResult } from '@/lib/types/rss';

/**
 * RSS Parser with enhanced capabilities
 */
export class RSSParserService {
  private parser: Parser;
  private readonly USER_AGENT = 'aggroNATION-RSS-Bot/1.0';
  private readonly TIMEOUT_MS = 30000; // 30 seconds

  constructor() {
    this.parser = new Parser({
      timeout: this.TIMEOUT_MS,
      headers: {
        'User-Agent': this.USER_AGENT,
        Accept: 'application/rss+xml, application/xml, text/xml',
      },
      customFields: {
        feed: ['language', 'copyright', 'managingEditor'],
        item: [
          'media:thumbnail',
          'media:content',
          'content:encoded',
          'yt:videoId',
          'yt:channelId',
          'duration',
          'author',
        ],
      },
    });
  }

  /**
   * Parse RSS feed and return structured data
   */
  async parseFeed(feedConfig: RSSFeed, maxItems: number = 50): Promise<RSSParseResult> {
    const startTime = Date.now();

    try {
      console.log(`🔄 Parsing RSS feed: ${feedConfig.name} (${feedConfig.url})`);

      const feed = await this.parser.parseURL(feedConfig.url);
      const responseTime = Date.now() - startTime;

      if (!feed.items || feed.items.length === 0) {
        return {
          success: true,
          articles: [],
          videos: [],
          responseTime,
          itemsFound: 0,
          newItems: 0,
        };
      }

      // Limit items to process
      const items = feed.items.slice(0, maxItems);

      if (feedConfig.type === 'youtube') {
        const videos = await this.parseYouTubeItems(items, feedConfig, feed);
        return {
          success: true,
          videos,
          responseTime,
          itemsFound: items.length,
          newItems: videos.length,
        };
      } else {
        const articles = await this.parseNewsItems(items, feedConfig, feed);
        return {
          success: true,
          articles,
          responseTime,
          itemsFound: items.length,
          newItems: articles.length,
        };
      }
    } catch (error: any) {
      console.error(`❌ RSS parsing error for ${feedConfig.url}:`, error.message);

      return {
        success: false,
        error: error.message,
        responseTime: Date.now() - startTime,
        itemsFound: 0,
        newItems: 0,
      };
    }
  }

  /**
   * Parse news/blog items into RSSArticle format
   */
  private async parseNewsItems(
    items: any[],
    feedConfig: RSSFeed,
    feed: any,
  ): Promise<RSSArticle[]> {
    const articles: RSSArticle[] = [];

    for (const item of items) {
      try {
        const article = await this.transformToArticle(item, feedConfig, feed);
        if (article) {
          articles.push(article);
        }
      } catch (error) {
        console.warn(`⚠️ Error parsing article item:`, error);
        continue;
      }
    }

    console.log(`✅ Parsed ${articles.length} articles from ${feedConfig.name}`);
    return articles;
  }

  /**
   * Parse YouTube items into RSSVideo format
   */
  private async parseYouTubeItems(
    items: any[],
    feedConfig: RSSFeed,
    feed: any,
  ): Promise<RSSVideo[]> {
    const videos: RSSVideo[] = [];

    for (const item of items) {
      try {
        const video = await this.transformToVideo(item, feedConfig, feed);
        if (video) {
          videos.push(video);
        }
      } catch (error) {
        console.warn(`⚠️ Error parsing video item:`, error);
        continue;
      }
    }

    console.log(`✅ Parsed ${videos.length} videos from ${feedConfig.name}`);
    return videos;
  }

  /**
   * Transform RSS item to RSSArticle
   */
  private async transformToArticle(
    item: any,
    feedConfig: RSSFeed,
    feed: any,
  ): Promise<RSSArticle | null> {
    if (!item.title || !item.link) {
      return null;
    }

    // Extract content
    const content = this.extractContent(item);
    const summary = this.extractSummary(item, content);

    // Generate unique hash
    const hash = this.generateHash(item.link, item.title, item.pubDate);

    // Extract and clean text
    const cleanTitle = this.cleanText(item.title);
    const cleanSummary = this.cleanText(summary);
    const cleanContent = this.cleanText(content);

    // Determine reading time
    const readTime = this.calculateReadingTime(cleanContent || cleanSummary);

    // Extract author
    const author = this.extractAuthor(item, feedConfig);

    // Extract tags and category
    const tags = this.extractTags(item);
    const category = this.determineCategory(cleanTitle, cleanContent, tags);

    // Check if breaking news
    const isBreaking = this.isBreakingNews(cleanTitle, tags);

    // Extract image
    const imageUrl = this.extractImageUrl(item);

    const article: RSSArticle = {
      hash,
      title: cleanTitle,
      summary: cleanSummary,
      content: cleanContent,
      author,
      source: feedConfig.name,
      sourceUrl: item.link,
      feedUrl: feedConfig.url,
      publishedAt: new Date(item.pubDate || item.isoDate || Date.now()),
      fetchedAt: new Date(),
      category,
      tags,
      isBreaking,
      readTime,
      status: 'active',
      views: 0,
      language: this.normalizeLanguage(feed.language) || 'en',
      imageUrl,
    };

    return article;
  }

  /**
   * Transform RSS item to RSSVideo
   */
  private async transformToVideo(
    item: any,
    feedConfig: RSSFeed,
    feed: any,
  ): Promise<RSSVideo | null> {
    if (!item.title || !item.link) {
      return null;
    }

    // Extract YouTube video ID
    const videoId = this.extractYouTubeVideoId(item);
    if (!videoId) {
      return null;
    }

    // Generate unique hash
    const hash = this.generateHash(item.link, item.title, item.pubDate);

    // Extract content
    const description = this.cleanText(item.content || item.contentSnippet || item.summary || '');
    const cleanTitle = this.cleanText(item.title);

    // Extract channel info
    const channelId = this.extractChannelId(feedConfig.url);
    const channelName = this.extractChannelName(item, feed);

    // Generate thumbnail URL
    const thumbnail = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;

    // Extract tags and category
    const tags = this.extractTags(item);
    const category = this.determineVideoCategory(cleanTitle, description, channelName);

    // Extract duration (if available)
    const duration = this.extractDuration(item);

    const video: RSSVideo = {
      hash,
      title: cleanTitle,
      description,
      thumbnail,
      videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
      videoId,
      channelName,
      channelId,
      feedUrl: feedConfig.url,
      duration,
      viewCount: 0,
      publishedAt: new Date(item.pubDate || item.isoDate || Date.now()),
      fetchedAt: new Date(),
      tags,
      category,
      status: 'active',
      language: 'en',
    };

    return video;
  }

  /**
   * Extract content from RSS item
   */
  private extractContent(item: any): string {
    return (
      item['content:encoded'] ||
      item.content ||
      item.contentSnippet ||
      item.summary ||
      item.description ||
      ''
    );
  }

  /**
   * Extract summary from content
   */
  private extractSummary(item: any, content: string): string {
    const summary = item.contentSnippet || item.summary || item.description;

    if (summary) {
      return summary;
    }

    // Generate summary from content
    if (content) {
      const plainText = this.stripHtml(content);
      return plainText.substring(0, 300) + (plainText.length > 300 ? '...' : '');
    }

    return '';
  }

  /**
   * Generate unique hash for deduplication
   */
  private generateHash(url: string, title: string, date?: string): string {
    const content = `${url}|${title}|${date || ''}`;
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  /**
   * Clean and sanitize text content
   */
  private cleanText(text: string): string {
    if (!text) return '';

    return this.stripHtml(text).replace(/\s+/g, ' ').trim();
  }

  /**
   * Strip HTML tags from text
   */
  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '');
  }

  /**
   * Calculate reading time
   */
  private calculateReadingTime(text: string): string {
    const wordsPerMinute = 200;
    const words = text.split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);

    if (minutes < 1) return '< 1 min';
    if (minutes === 1) return '1 min';
    return `${minutes} min`;
  }

  /**
   * Extract author information
   */
  private extractAuthor(item: any, feedConfig: RSSFeed): string {
    return item.author || item.creator || item['dc:creator'] || feedConfig.name || 'Unknown';
  }

  /**
   * Extract tags from RSS item
   */
  private extractTags(item: any): string[] {
    const tags: string[] = [];

    if (item.categories) {
      tags.push(...item.categories);
    }

    if (item.tags) {
      tags.push(...item.tags);
    }

    // Clean and deduplicate tags
    return [...new Set(tags)]
      .filter((tag) => tag && tag.length > 1)
      .map((tag) => tag.toLowerCase().trim())
      .slice(0, 10); // Limit to 10 tags
  }

  /**
   * Determine content category based on AI keywords
   */
  private determineCategory(title: string, content: string, tags: string[]): string {
    const text = `${title} ${content} ${tags.join(' ')}`.toLowerCase();

    const categories = {
      'Generative AI': [
        'gpt',
        'generative',
        'llm',
        'language model',
        'chatgpt',
        'openai',
        'claude',
        'gemini',
      ],
      'Computer Vision': ['vision', 'image', 'detection', 'opencv', 'yolo', 'cnn', 'visual'],
      'Machine Learning': [
        'machine learning',
        'ml',
        'neural network',
        'deep learning',
        'tensorflow',
        'pytorch',
      ],
      NLP: ['nlp', 'natural language', 'text processing', 'sentiment', 'bert', 'transformer'],
      Research: ['research', 'paper', 'arxiv', 'study', 'experiment', 'algorithm'],
      'Industry News': ['company', 'funding', 'acquisition', 'startup', 'business', 'market'],
      'Ethics & Safety': ['ethics', 'safety', 'bias', 'fairness', 'responsible ai', 'governance'],
    };

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some((keyword) => text.includes(keyword))) {
        return category;
      }
    }

    return 'General AI';
  }

  /**
   * Determine video category
   */
  private determineVideoCategory(title: string, description: string, channel: string): string {
    const text = `${title} ${description} ${channel}`.toLowerCase();

    if (text.includes('tutorial') || text.includes('how to') || text.includes('guide')) {
      return 'Tutorial';
    }
    if (text.includes('news') || text.includes('update') || text.includes('announcement')) {
      return 'News';
    }
    if (text.includes('review') || text.includes('comparison') || text.includes('analysis')) {
      return 'Review';
    }
    if (text.includes('conference') || text.includes('talk') || text.includes('presentation')) {
      return 'Conference';
    }

    return 'General';
  }

  /**
   * Check if content is breaking news
   */
  private isBreakingNews(title: string, tags: string[]): boolean {
    const breakingKeywords = ['breaking', 'urgent', 'alert', 'just in', 'live', 'developing'];
    const text = `${title} ${tags.join(' ')}`.toLowerCase();

    return breakingKeywords.some((keyword) => text.includes(keyword));
  }

  /**
   * Extract image URL from RSS item
   */
  private extractImageUrl(item: any): string | undefined {
    // Try different image sources
    if (item.enclosure && item.enclosure.type && item.enclosure.type.startsWith('image/')) {
      return item.enclosure.url;
    }

    if (item['media:thumbnail']) {
      return item['media:thumbnail'].$.url || item['media:thumbnail'];
    }

    if (
      item['media:content'] &&
      item['media:content'].$.type &&
      item['media:content'].$.type.startsWith('image/')
    ) {
      return item['media:content'].$.url;
    }

    // Extract from content
    const content = item.content || item['content:encoded'] || '';
    const imgMatch = content.match(/<img[^>]+src="([^">]+)"/i);
    if (imgMatch) {
      return imgMatch[1];
    }

    return undefined;
  }

  /**
   * Extract YouTube video ID
   */
  private extractYouTubeVideoId(item: any): string | null {
    // Try custom field first
    if (item['yt:videoId']) {
      return item['yt:videoId'];
    }

    // Extract from link
    const url = item.link || item.guid;
    if (!url) return null;

    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  }

  /**
   * Extract YouTube channel ID from feed URL
   */
  private extractChannelId(feedUrl: string): string {
    const match = feedUrl.match(/channel_id=([a-zA-Z0-9_-]+)/);
    return match ? match[1] : '';
  }

  /**
   * Extract channel name
   */
  private extractChannelName(item: any, feed: any): string {
    return item.author || feed.title || feed.description || 'Unknown Channel';
  }

  /**
   * Extract video duration
   */
  private extractDuration(item: any): string {
    if (item.duration) {
      return item.duration;
    }

    // Default duration for videos
    return 'Unknown';
  }

  /**
   * Normalize language code for MongoDB text search compatibility
   */
  private normalizeLanguage(language: string): string {
    if (!language) return 'en';

    // Convert common language codes to MongoDB supported ones
    const langMap: Record<string, string> = {
      'en-US': 'en',
      'en-GB': 'en',
      'en-CA': 'en',
      'en-AU': 'en',
      'es-ES': 'es',
      'es-MX': 'es',
      'fr-FR': 'fr',
      'fr-CA': 'fr',
      'de-DE': 'de',
      'it-IT': 'it',
      'pt-PT': 'pt',
      'pt-BR': 'pt',
      'ru-RU': 'ru',
      'zh-CN': 'zh',
      'zh-TW': 'zh',
      'ja-JP': 'ja',
      'ko-KR': 'ko',
      'ar-SA': 'ar',
      'hi-IN': 'hi',
    };

    const normalized = langMap[language];
    if (normalized) return normalized;

    // Extract base language code (e.g., "en" from "en-US")
    const baseLang = language.split('-')[0].toLowerCase();

    // Check if base language is supported by MongoDB text search
    const supportedLangs = ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ko', 'ar', 'hi'];
    if (supportedLangs.includes(baseLang)) {
      return baseLang;
    }

    // Default to English if unsupported
    return 'en';
  }

  /**
   * Test RSS feed connectivity
   */
  async testFeed(url: string): Promise<{ success: boolean; error?: string; itemCount?: number }> {
    try {
      const feed = await this.parser.parseURL(url);
      return {
        success: true,
        itemCount: feed.items?.length || 0,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

/**
 * Singleton RSS Parser instance
 */
export const rssParser = new RSSParserService();
