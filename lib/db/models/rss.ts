/**
 * @fileoverview MongoDB database models and schemas for RSS data
 * @author aggroNATION Development Team
 * @version 1.0.0
 */

import { MongoClient, Db, Collection } from 'mongodb';
import {
  RSSArticle,
  RSSVideo,
  RSSFeed,
  RSSFetchLog,
  AnalyticsEvent,
  UserPreferences,
  SearchQuery,
} from '@/lib/types/rss';

/**
 * Bookmark and Reading List interfaces
 */
export interface IBookmark {
  _id?: string;
  userId: string;
  articleId: string;
  title: string;
  url: string;
  description?: string;
  tags: string[];
  category: string;
  createdAt: Date;
}

export interface IReadingList {
  _id?: string;
  userId: string;
  name: string;
  description?: string;
  articles: string[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Database connection singleton
 */
class DatabaseManager {
  private static instance: DatabaseManager;
  private client: MongoClient | null = null;
  private db: Db | null = null;

  private constructor() {}

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  /**
   * Connect to MongoDB
   */
  public async connect(): Promise<Db> {
    if (this.db) {
      return this.db;
    }

    const uri =
      process.env.MONGODB_URI || 'mongodb+srv://fame:Sthcnh4525!@aggronation.b2xoypd.mongodb.net/';

    try {
      this.client = new MongoClient(uri);
      await this.client.connect();
      this.db = this.client.db('aggroNATION');

      // Create indexes for better performance
      await this.createIndexes();

      console.log('Connected to MongoDB successfully');
      return this.db;
    } catch (error) {
      console.error('MongoDB connection error:', error);
      throw new Error('Failed to connect to database');
    }
  }

  /**
   * Create database indexes for optimal performance
   */
  private async createIndexes(): Promise<void> {
    if (!this.db) return;

    try {
      // RSS Articles indexes
      await this.db
        .collection('rss_articles')
        .createIndexes([
          { key: { hash: 1 }, unique: true },
          { key: { publishedAt: -1 } },
          { key: { source: 1, publishedAt: -1 } },
          { key: { category: 1, publishedAt: -1 } },
          { key: { tags: 1 } },
          { key: { status: 1, publishedAt: -1 } },
          { key: { title: 'text', content: 'text', summary: 'text' } },
        ]);

      // RSS Videos indexes
      await this.db
        .collection('rss_videos')
        .createIndexes([
          { key: { hash: 1 }, unique: true },
          { key: { publishedAt: -1 } },
          { key: { channelName: 1, publishedAt: -1 } },
          { key: { category: 1, publishedAt: -1 } },
          { key: { tags: 1 } },
          { key: { status: 1, publishedAt: -1 } },
          { key: { title: 'text', description: 'text' } },
        ]);

      // RSS Feeds indexes
      await this.db
        .collection('rss_feeds')
        .createIndexes([
          { key: { url: 1 }, unique: true },
          { key: { type: 1, isActive: 1 } },
          { key: { category: 1, isActive: 1 } },
          { key: { healthScore: -1 } },
          { key: { lastFetchedAt: -1 } },
        ]);

      // RSS Fetch Logs indexes
      await this.db
        .collection('rss_fetch_logs')
        .createIndexes([
          { key: { feedId: 1, fetchedAt: -1 } },
          { key: { fetchedAt: -1 } },
          { key: { success: 1, fetchedAt: -1 } },
        ]);

      // Analytics Events indexes
      await this.db
        .collection('analytics_events')
        .createIndexes([
          { key: { timestamp: -1 } },
          { key: { eventType: 1, timestamp: -1 } },
          { key: { contentType: 1, timestamp: -1 } },
          { key: { userId: 1, timestamp: -1 } },
          { key: { sessionId: 1, timestamp: -1 } },
        ]);

      // User Preferences indexes
      await this.db
        .collection('user_preferences')
        .createIndexes([{ key: { userId: 1 }, unique: true }]);

      // Search Queries indexes
      await this.db
        .collection('search_queries')
        .createIndexes([
          { key: { queryHash: 1, timestamp: -1 } },
          { key: { timestamp: -1 } },
          { key: { userId: 1, timestamp: -1 } },
        ]);

      // Bookmarks indexes
      await this.db
        .collection('bookmarks')
        .createIndexes([{ key: { userId: 1, articleId: 1 }, unique: true }]);

      // Reading Lists indexes
      await this.db
        .collection('reading_lists')
        .createIndexes([{ key: { userId: 1, name: 1 }, unique: true }]);

      console.log('Database indexes created successfully');
    } catch (error) {
      console.error('Error creating indexes:', error);
    }
  }

  /**
   * Get database instance
   */
  public getDb(): Db {
    if (!this.db) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.db;
  }

  /**
   * Close database connection
   */
  public async close(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
    }
  }
}

/**
 * RSS Articles Model
 */
export class RSSArticleModel {
  private collection: Collection<RSSArticle>;

  constructor(db: Db) {
    this.collection = db.collection<RSSArticle>('rss_articles');
  }

  /**
   * Create new article (with deduplication)
   */
  async create(article: Omit<RSSArticle, '_id'>): Promise<RSSArticle | null> {
    try {
      const result = await this.collection.insertOne(article);
      return { ...article, _id: result.insertedId };
    } catch (error: any) {
      if (error.code === 11000) {
        // Duplicate hash - article already exists
        return null;
      }
      throw error;
    }
  }

  /**
   * Get articles with pagination and filtering
   */
  async getArticles(
    options: {
      page?: number;
      limit?: number;
      category?: string;
      source?: string;
      status?: string;
      search?: string;
    } = {},
  ): Promise<{ articles: RSSArticle[]; total: number }> {
    const { page = 1, limit = 20, category, source, status = 'active', search } = options;

    const filter: any = { status };

    if (category) filter.category = category;
    if (source) filter.source = source;
    if (search) {
      filter.$text = { $search: search };
    }

    const skip = (page - 1) * limit;

    const [articles, total] = await Promise.all([
      this.collection.find(filter).sort({ publishedAt: -1 }).skip(skip).limit(limit).toArray(),
      this.collection.countDocuments(filter),
    ]);

    return { articles, total };
  }

  /**
   * Get article by ID
   */
  async getById(id: string): Promise<RSSArticle | null> {
    return this.collection.findOne({ _id: new (require('mongodb').ObjectId)(id) });
  }

  /**
   * Update article
   */
  async update(id: string, update: Partial<RSSArticle>): Promise<boolean> {
    const result = await this.collection.updateOne(
      { _id: new (require('mongodb').ObjectId)(id) },
      { $set: { ...update, updatedAt: new Date() } },
    );
    return result.modifiedCount > 0;
  }

  /**
   * Delete old articles (data retention)
   */
  async deleteOld(daysOld: number): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await this.collection.deleteMany({
      publishedAt: { $lt: cutoffDate },
      status: { $ne: 'archived' },
    });

    return result.deletedCount;
  }

  /**
   * Get total count of articles
   */
  async getTotalCount(): Promise<number> {
    return this.collection.countDocuments({});
  }

  /**
   * Increment view count for article
   */
  async incrementViews(id: string): Promise<void> {
    await this.collection.updateOne(
      { _id: new (require('mongodb').ObjectId)(id) },
      { $inc: { views: 1 } },
    );
  }

  /**
   * Count documents matching query
   */
  async countDocuments(query: any): Promise<number> {
    return this.collection.countDocuments(query);
  }
}

/**
 * RSS Videos Model
 */
export class RSSVideoModel {
  private collection: Collection<RSSVideo>;

  constructor(db: Db) {
    this.collection = db.collection<RSSVideo>('rss_videos');
  }

  /**
   * Create new video (with deduplication)
   */
  async create(video: Omit<RSSVideo, '_id'>): Promise<RSSVideo | null> {
    try {
      const result = await this.collection.insertOne(video);
      return { ...video, _id: result.insertedId };
    } catch (error: any) {
      if (error.code === 11000) {
        // Duplicate hash - video already exists
        return null;
      }
      throw error;
    }
  }

  /**
   * Get videos with pagination and filtering
   */
  async getVideos(
    options: {
      page?: number;
      limit?: number;
      category?: string;
      channelName?: string;
      status?: string;
      search?: string;
    } = {},
  ): Promise<{ videos: RSSVideo[]; total: number }> {
    const { page = 1, limit = 12, category, channelName, status = 'active', search } = options;

    const filter: any = { status };

    if (category) filter.category = category;
    if (channelName) filter.channelName = channelName;
    if (search) {
      filter.$text = { $search: search };
    }

    const skip = (page - 1) * limit;

    const [videos, total] = await Promise.all([
      this.collection.find(filter).sort({ publishedAt: -1 }).skip(skip).limit(limit).toArray(),
      this.collection.countDocuments(filter),
    ]);

    return { videos, total };
  }

  /**
   * Get total count of videos
   */
  async getTotalCount(): Promise<number> {
    return this.collection.countDocuments({});
  }

  /**
   * Get video by ID
   */
  async getById(id: string): Promise<RSSVideo | null> {
    return this.collection.findOne({ _id: new (require('mongodb').ObjectId)(id) });
  }

  /**
   * Count documents matching query
   */
  async countDocuments(query: any): Promise<number> {
    return this.collection.countDocuments(query);
  }
}

/**
 * RSS Feeds Model
 */
export class RSSFeedModel {
  private collection: Collection<RSSFeed>;

  constructor(db: Db) {
    this.collection = db.collection<RSSFeed>('rss_feeds');
  }

  /**
   * Create new feed
   */
  async create(feed: Omit<RSSFeed, '_id'>): Promise<RSSFeed> {
    const result = await this.collection.insertOne(feed);
    return { ...feed, _id: result.insertedId };
  }

  /**
   * Get all active feeds
   */
  async getActiveFeeds(): Promise<RSSFeed[]> {
    return this.collection.find({ isActive: true }).toArray();
  }

  /**
   * Update feed health metrics
   */
  async updateHealth(
    feedId: string,
    success: boolean,
    responseTime: number,
    errorMessage?: string,
  ): Promise<void> {
    const update: any = {
      lastFetchedAt: new Date(),
      avgResponseTime: responseTime,
      updatedAt: new Date(),
    };

    if (success) {
      update.lastSuccessAt = new Date();
      update.failureCount = 0;
      update.healthScore = Math.min(100, (update.healthScore || 0) + 10);
    } else {
      update.$inc = { failureCount: 1 };
      update.healthScore = Math.max(0, (update.healthScore || 100) - 20);
    }

    await this.collection.updateOne(
      { _id: new (require('mongodb').ObjectId)(feedId) },
      { $set: update },
    );
  }

  /**
   * Get feed health status
   */
  async getHealthStatus(): Promise<any[]> {
    return this.collection
      .find(
        {},
        {
          projection: {
            name: 1,
            url: 1,
            type: 1,
            isActive: 1,
            lastSuccessAt: 1,
            failureCount: 1,
            healthScore: 1,
            avgResponseTime: 1,
          },
        },
      )
      .toArray();
  }

  /**
   * Get total count of feeds
   */
  async getTotalCount(): Promise<number> {
    return this.collection.countDocuments({});
  }

  /**
   * Get all feeds (for admin)
   */
  async getAllFeeds(): Promise<RSSFeed[]> {
    return this.collection.find({}).toArray();
  }

  /**
   * Update feed
   */
  async updateFeed(feedId: string, updates: Partial<RSSFeed>): Promise<void> {
    await this.collection.updateOne(
      { _id: new (require('mongodb').ObjectId)(feedId) },
      { $set: { ...updates, updatedAt: new Date() } },
    );
  }

  /**
   * Delete feed
   */
  async deleteFeed(feedId: string): Promise<void> {
    await this.collection.deleteOne({ _id: new (require('mongodb').ObjectId)(feedId) });
  }
}

/**
 * Bookmark Model
 */
export class BookmarkModel {
  private collection: Collection<IBookmark>;

  constructor(db: Db) {
    this.collection = db.collection<IBookmark>('bookmarks');
  }

  /**
   * Create a new bookmark
   */
  async create(bookmark: Omit<IBookmark, '_id'>): Promise<IBookmark> {
    const result = await this.collection.insertOne(bookmark);
    return { ...bookmark, _id: result.insertedId.toString() };
  }

  /**
   * Find bookmarks by user
   */
  async findByUser(
    userId: string,
    options: { limit?: number; skip?: number; category?: string; tags?: string[] } = {},
  ): Promise<IBookmark[]> {
    const query: any = { userId };
    if (options.category) query.category = options.category;
    if (options.tags) query.tags = { $in: options.tags };

    return this.collection
      .find(query)
      .sort({ createdAt: -1 })
      .limit(options.limit || 50)
      .skip(options.skip || 0)
      .toArray();
  }

  /**
   * Find one bookmark
   */
  async findOne(query: any): Promise<IBookmark | null> {
    return this.collection.findOne(query);
  }

  /**
   * Delete a bookmark
   */
  async findOneAndDelete(query: any): Promise<IBookmark | null> {
    return this.collection.findOneAndDelete(query);
  }

  /**
   * Count bookmarks
   */
  async countDocuments(query: any): Promise<number> {
    return this.collection.countDocuments(query);
  }

  /**
   * Save a bookmark
   */
  async save(bookmark: IBookmark): Promise<IBookmark> {
    if (bookmark._id) {
      await this.collection.updateOne({ _id: bookmark._id }, { $set: bookmark });
      return bookmark;
    } else {
      return this.create(bookmark);
    }
  }
}

/**
 * Reading List Model
 */
export class ReadingListModel {
  private collection: Collection<IReadingList>;

  constructor(db: Db) {
    this.collection = db.collection<IReadingList>('reading_lists');
  }

  /**
   * Create a new reading list
   */
  async create(readingList: Omit<IReadingList, '_id'>): Promise<IReadingList> {
    const result = await this.collection.insertOne(readingList);
    return { ...readingList, _id: result.insertedId.toString() };
  }

  /**
   * Find reading lists by user
   */
  async findByUser(
    userId: string,
    options: { limit?: number; skip?: number } = {},
  ): Promise<IReadingList[]> {
    return this.collection
      .find({ userId })
      .sort({ updatedAt: -1 })
      .limit(options.limit || 20)
      .skip(options.skip || 0)
      .toArray();
  }

  /**
   * Find one reading list
   */
  async findOne(query: any): Promise<IReadingList | null> {
    return this.collection.findOne(query);
  }

  /**
   * Update a reading list
   */
  async findOneAndUpdate(query: any, update: any, options: any = {}): Promise<IReadingList | null> {
    const result = await this.collection.findOneAndUpdate(query, update, options);
    return result.value;
  }

  /**
   * Delete a reading list
   */
  async findOneAndDelete(query: any): Promise<IReadingList | null> {
    return this.collection.findOneAndDelete(query);
  }

  /**
   * Count reading lists
   */
  async countDocuments(query: any): Promise<number> {
    return this.collection.countDocuments(query);
  }

  /**
   * Save a reading list
   */
  async save(readingList: IReadingList): Promise<IReadingList> {
    if (readingList._id) {
      await this.collection.updateOne({ _id: readingList._id }, { $set: readingList });
      return readingList;
    } else {
      return this.create(readingList);
    }
  }
}

/**
 * Database instance
 */
export const dbManager = DatabaseManager.getInstance();

/**
 * Get database models
 */
export async function getModels() {
  const db = await dbManager.connect();

  return {
    articles: new RSSArticleModel(db),
    videos: new RSSVideoModel(db),
    feeds: new RSSFeedModel(db),
    bookmarks: new BookmarkModel(db),
    readingLists: new ReadingListModel(db),
  };
}
