/**
 * @fileoverview MongoDB database connection utilities
 * @author aggroNATION Development Team
 * @version 1.0.0
 */

import { MongoClient, Db } from 'mongodb';

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

/**
 * Connect to MongoDB database
 */
export async function connectDB(): Promise<Db> {
  if (cachedDb) {
    return cachedDb;
  }

  const uri =
    process.env.MONGODB_URI || 'mongodb+srv://fame:Sthcnh4525!@aggronation.b2xoypd.mongodb.net/';

  try {
    if (!cachedClient) {
      cachedClient = new MongoClient(uri);
      await cachedClient.connect();
    }

    cachedDb = cachedClient.db('aggroNATION');

    // Create indexes for better performance
    await createIndexes(cachedDb);

    console.log('Connected to MongoDB successfully');
    return cachedDb;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw new Error('Failed to connect to database');
  }
}

/**
 * Create database indexes for optimal performance
 */
async function createIndexes(db: Db): Promise<void> {
  try {
    // Bookmarks indexes
    await db
      .collection('bookmarks')
      .createIndexes([
        { key: { userId: 1, articleId: 1 }, unique: true },
        { key: { userId: 1, createdAt: -1 } },
        { key: { category: 1, createdAt: -1 } },
        { key: { tags: 1 } },
      ]);

    // Reading Lists indexes
    await db
      .collection('reading_lists')
      .createIndexes([
        { key: { userId: 1, name: 1 }, unique: true },
        { key: { userId: 1, updatedAt: -1 } },
        { key: { isPublic: 1, updatedAt: -1 } },
      ]);

    console.log('Database indexes created successfully');
  } catch (error) {
    console.error('Error creating indexes:', error);
  }
}

/**
 * Close database connection
 */
export async function closeDB(): Promise<void> {
  if (cachedClient) {
    await cachedClient.close();
    cachedClient = null;
    cachedDb = null;
  }
}
