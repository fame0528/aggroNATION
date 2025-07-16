// === seed-rss-articles.js ===
// Created: 2025-07-16
// Purpose: ECHO-compliant script to fetch, parse, and store RSS articles in MongoDB
// Key Exports: None (run as a script)
// Interactions: Populates 'rss_articles' from all active feeds in 'rss_feeds'
// Notes: Requires MongoDB Atlas access and 'rss-parser' installed

/**
 * OVERVIEW
 *
 * This script fetches all active RSS feeds from the 'rss_feeds' collection,
 * parses each feed for articles using 'rss-parser', and upserts them into
 * the 'rss_articles' collection. It includes diagnostics, type guards, and
 * robust error handling per ECHO standards.
 *
 * Edge Cases:
 * - Handles network, parsing, and DB errors gracefully
 * - Deduplicates articles by hash or URL
 *
 * Usage Example:
 *   node scripts/seed-rss-articles.js
 */

import { MongoClient } from 'mongodb';
import Parser from 'rss-parser';

const MONGODB_URI =
  process.env.MONGODB_URI ||
  'mongodb+srv://fame:Sthcnh4525%21@aggronation.b2xoypd.mongodb.net/aggroNATION?retryWrites=true&w=majority';
const DB_NAME = 'aggroNATION';

const parser = new Parser();

function isValidArticle(article) {
  return (
    article &&
    typeof article.title === 'string' &&
    typeof article.link === 'string' &&
    typeof article.pubDate === 'string'
  );
}

async function main() {
  let client;
  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db(DB_NAME);
    const feedsCol = db.collection('rss_feeds');
    const articlesCol = db.collection('rss_articles');

    const feeds = await feedsCol.find({ isActive: true }).toArray();
    if (!feeds.length) {
      console.warn('No active feeds found. Exiting.');
      return;
    }
    console.log(`Found ${feeds.length} active feeds.`);

    let totalInserted = 0;
    for (const feed of feeds) {
      try {
        console.log(`Fetching: ${feed.url}`);
        const feedData = await parser.parseURL(feed.url);
        const items = Array.isArray(feedData.items) ? feedData.items : [];
        let inserted = 0;
        for (const item of items) {
          if (!isValidArticle(item)) continue;
          const doc = {
            hash: item.guid || item.id || item.link || item.title,
            title: item.title,
            summary: item.contentSnippet || item.summary || item.content || item.description || '',
            content: item.content || '',
            author: item.creator || item.author || '',
            source: feedData.title || feed.name || '',
            sourceUrl: item.link,
            feedUrl: feed.url,
            publishedAt: new Date(item.isoDate || item.pubDate),
            fetchedAt: new Date(),
            category: feed.category || '',
            tags: item.categories || [],
            isBreaking: false,
            readTime: '',
            status: 'active',
            views: 0,
            language: feed.language || 'en',
            imageUrl: (item.enclosure && item.enclosure.url) || '',
          };
          // Upsert by hash or sourceUrl
          const res = await articlesCol.updateOne(
            { $or: [{ hash: doc.hash }, { sourceUrl: doc.sourceUrl }] },
            { $set: doc },
            { upsert: true },
          );
          if (res.upsertedCount > 0) inserted++;
        }
        totalInserted += inserted;
        console.log(`✓ ${inserted} new articles from: ${feed.url}`);
      } catch (err) {
        console.error(`✗ Error processing feed ${feed.url}:`, err.message);
      }
    }
    console.log(`\nSeeding complete! Total new articles inserted: ${totalInserted}`);
  } catch (err) {
    console.error('Fatal error:', err);
    process.exit(1);
  } finally {
    if (client) await client.close();
  }
}

main();

/*
 * === seed-rss-articles.js ===
 * Updated: 2025-07-16
 * Summary: Fetches, parses, and stores RSS articles in MongoDB with diagnostics and ECHO compliance.
 * Key Components:
 *   - main(): Orchestrates fetching and upserting articles
 *   - isValidArticle(): Type guard for RSS items
 * Dependencies:
 *   - Requires: 'mongodb', 'rss-parser', valid MongoDB URI
 * Version History:
 *   v1.0 - Initial release
 * Notes:
 *   - Idempotent and safe to re-run
 */
