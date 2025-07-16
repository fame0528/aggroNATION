#!/usr/bin/env node

/**
 * Script to seed RSS feeds from configuration into the database
 */

import { MongoClient } from 'mongodb';
import fs from 'fs';
import path from 'path';

// MongoDB connection (Atlas URI, URL-encoded password, correct db)
const MONGODB_URI =
  process.env.MONGODB_URI ||
  'mongodb+srv://fame:Sthcnh4525%21@aggronation.b2xoypd.mongodb.net/aggroNATION?retryWrites=true&w=majority';

// RSS Feed configurations (simplified from the TypeScript config)
const RSS_FEED_CONFIGS = [
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
    name: 'Hugging Face Blog',
    url: 'https://huggingface.co/blog/feed.xml',
    type: 'blog',
    category: 'AI Research',
    isActive: true,
    failureCount: 0,
    avgResponseTime: 0,
    healthScore: 100,
    fetchInterval: 60,
    description: 'Latest posts from Hugging Face blog',
    language: 'en',
  },
  {
    name: 'HackerNoon AI',
    url: 'https://hackernoon.com/tagged/ai/feed',
    type: 'news',
    category: 'Technology News',
    isActive: true,
    failureCount: 0,
    avgResponseTime: 0,
    healthScore: 100,
    fetchInterval: 30,
    description: 'AI-related articles from HackerNoon',
    language: 'en',
  },
  {
    name: 'ArXiv AI',
    url: 'https://export.arxiv.org/rss/cs.AI',
    type: 'research',
    category: 'Academic Papers',
    isActive: true,
    failureCount: 0,
    avgResponseTime: 0,
    healthScore: 100,
    fetchInterval: 120,
    description: 'Latest AI research papers from ArXiv',
    language: 'en',
  },
  {
    name: 'The Decoder',
    url: 'https://the-decoder.com/feed/',
    type: 'news',
    category: 'Technology News',
    isActive: true,
    failureCount: 0,
    avgResponseTime: 0,
    healthScore: 100,
    fetchInterval: 30,
    description: 'AI news and analysis from The Decoder',
    language: 'en',
  },
  {
    name: 'AI News',
    url: 'https://www.artificialintelligence-news.com/feed/',
    type: 'news',
    category: 'Technology News',
    isActive: true,
    failureCount: 0,
    avgResponseTime: 0,
    healthScore: 100,
    fetchInterval: 30,
    description: 'Latest artificial intelligence news and developments',
    language: 'en',
  },
  {
    name: 'MIT Technology Review',
    url: 'https://www.technologyreview.com/feed/',
    type: 'news',
    category: 'Technology News',
    isActive: true,
    failureCount: 0,
    avgResponseTime: 0,
    healthScore: 100,
    fetchInterval: 30,
    description: 'Technology news and analysis from MIT Technology Review',
    language: 'en',
  },
];

async function seedRSSFeeds() {
  let client;

  try {
    console.log('Connecting to MongoDB...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();

    const db = client.db();
    const feedsCollection = db.collection('rss_feeds');

    console.log('Checking existing feeds...');
    const existingFeeds = await feedsCollection.find({}).toArray();
    console.log(`Found ${existingFeeds.length} existing feeds`);

    // Add timestamps to feeds
    const feedsWithTimestamps = RSS_FEED_CONFIGS.map((feed) => ({
      ...feed,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    console.log('Seeding RSS feeds...');

    // Use upsert to avoid duplicates
    for (const feed of feedsWithTimestamps) {
      const result = await feedsCollection.updateOne(
        { url: feed.url },
        { $set: feed },
        { upsert: true },
      );

      if (result.upsertedCount > 0) {
        console.log(`✓ Added new feed: ${feed.name}`);
      } else {
        console.log(`✓ Updated existing feed: ${feed.name}`);
      }
    }

    const totalFeeds = await feedsCollection.countDocuments();
    console.log(`\nSeeding complete! Total feeds in database: ${totalFeeds}`);
  } catch (error) {
    console.error('Error seeding RSS feeds:', error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

// Run the seeding
seedRSSFeeds().catch(console.error);
