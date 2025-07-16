#!/usr/bin/env node

/**
 * Script to seed RSS feeds via API endpoints
 */

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
];

async function seedRSSFeedsViaAPI() {
  try {
    console.log('Seeding RSS feeds via API...');

    for (const feed of RSS_FEED_CONFIGS) {
      try {
        const response = await fetch('http://localhost:3002/api/rss/feeds', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(feed),
        });

        if (response.ok) {
          const result = await response.json();
          console.log(`✓ Added feed: ${feed.name}`);
        } else {
          const error = await response.text();
          console.log(`✗ Failed to add feed ${feed.name}: ${error}`);
        }
      } catch (error) {
        console.log(`✗ Error adding feed ${feed.name}: ${error.message}`);
      }
    }

    console.log('\nSeeding complete! Now triggering RSS refresh...');

    // Trigger RSS refresh
    const refreshResponse = await fetch('http://localhost:3002/api/rss/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type: 'news', force: true }),
    });

    if (refreshResponse.ok) {
      const result = await refreshResponse.json();
      console.log('RSS refresh result:', result);
    } else {
      console.log('RSS refresh failed:', await refreshResponse.text());
    }
  } catch (error) {
    console.error('Error seeding RSS feeds:', error);
    process.exit(1);
  }
}

// Run the seeding
seedRSSFeedsViaAPI().catch(console.error);
