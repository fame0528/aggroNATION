import { NextApiRequest, NextApiResponse } from 'next';
import { getModels } from '@/lib/db/models/rss';
import { RSSFeed } from '@/lib/types/rss';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { feeds } = await getModels();

    // Read YouTube feeds from file
    const feedsFilePath = path.join(process.cwd(), 'youtube-feeds.txt');
    const feedsContent = fs.readFileSync(feedsFilePath, 'utf8');
    const feedUrls = feedsContent
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#'));

    // AI YouTube channels mapping
    const channelMapping: Record<string, string> = {
      'UC2WmuBuFq6gL08QYG-JjXKw': 'WorldofAI',
      'UC5l7RouTQ60oUjLjt1Nh-UQ': 'AI Explained',
      'UCpWS2Gmt0N31th-vdIizPJQ': 'Two Minute Papers',
      UC0m81bQuthaQZmFbXEY9QSw: 'Yannic Kilcher',
      UC37JpWP5PxLSma2lh79HU9A: 'Lex Fridman',
      UCvS59S24crXmGfIEiejcr9g: 'Machine Learning Street Talk',
      'UC2Jl-LpV_J8l-az2GNG3VUQ': 'StatQuest',
      UCGpsgNbzdF7BECCVbB1COHw: 'DeepMind',
      UCDN47rjzNMRTkGY3182ApaQ: 'Google AI',
      UCZ3KGRwOA_uONNE_6VGG2bA: 'OpenAI',
      UC08Fah8EIryeOZRkjBRohcQ: 'Anthropic',
      UC4JX40jDee_tINbkjycV4Sg: 'AI Research',
      UCBhTxsFP2VvjO87RsQY75Tw: 'ML Engineering',
      UCPix8N6PMRI4KzgyjuZeF0g: 'AI Papers',
    };

    const results = {
      added: 0,
      skipped: 0,
      errors: [] as string[],
    };

    for (const feedUrl of feedUrls) {
      try {
        // Extract channel ID from URL
        const match = feedUrl.match(/channel_id=([^&]+)/);
        if (!match) {
          results.errors.push(`Invalid YouTube feed URL: ${feedUrl}`);
          continue;
        }

        const channelId = match[1];
        const channelName = channelMapping[channelId] || `AI Channel ${channelId}`;

        const feedData: Omit<RSSFeed, '_id'> = {
          name: channelName,
          url: feedUrl,
          type: 'youtube',
          category: 'AI',
          description: `AI and Machine Learning content from ${channelName}`,
          language: 'en',
          isActive: true,
          lastFetchedAt: undefined,
          fetchInterval: 1800, // 30 minutes
          failureCount: 0,
          avgResponseTime: 0,
          healthScore: 100,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        // Try to create feed (will fail if duplicate)
        try {
          await feeds.create(feedData);
          results.added++;
        } catch (error: any) {
          if (error.code === 11000) {
            // Duplicate key error - feed already exists
            results.skipped++;
          } else {
            throw error;
          }
        }
        console.log(`✅ Added YouTube feed: ${channelName}`);
      } catch (error) {
        console.error(`❌ Error adding feed ${feedUrl}:`, error);
        results.errors.push(
          `Error adding ${feedUrl}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    res.status(200).json({
      success: true,
      message: `Added ${results.added} YouTube feeds, skipped ${results.skipped} existing feeds`,
      results,
    });
  } catch (error) {
    console.error('Error adding YouTube feeds:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add YouTube feeds',
      message: error instanceof Error ? error.message : String(error),
    });
  }
}
