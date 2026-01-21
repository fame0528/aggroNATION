/**
 * Cron Job Service
 * 
 * Automatically fetches content from enabled sources at configured intervals
 * Uses node-cron for scheduling
 * 
 * @module lib/cron
 * @created 2026-01-20
 */

import cron from 'node-cron';
import { connectDB } from '@/lib/db/mongoose';
import { Source } from '@/lib/db/models/Source';
import { Content } from '@/lib/db/models/Content';
import { fetchYouTubeVideos, convertYouTubeToContent } from '@/lib/fetchers/youtube';

/**
 * Fetch content for a single source
 */
async function fetchSourceContent(sourceId: string) {
  try {
    const source = await Source.findById(sourceId);
    if (!source || !source.enabled) {
      console.log(`[Cron] Skipping disabled/missing source: ${sourceId}`);
      return 0;
    }

    console.log(`[Cron] Fetching from ${source.name} (${source.type})...`);

    let fetchedCount = 0;

    switch (source.type) {
      case 'youtube': {
        const videos = await fetchYouTubeVideos(source);
        
        for (const video of videos) {
          const contentData = convertYouTubeToContent(video, source._id.toString());
          
          await Content.findOneAndUpdate(
            {
              sourceId: source._id,
              externalId: contentData.externalId,
            },
            { $set: contentData },
            { upsert: true, new: true }
          );
          
          fetchedCount++;
        }
        break;
      }

      case 'rss':
      case 'reddit':
      case 'x':
        console.log(`[Cron] ${source.type} fetcher not yet implemented`);
        return 0;
    }

    // Update source metadata
    await Source.findByIdAndUpdate(sourceId, {
      $set: {
        'metadata.lastFetched': new Date(),
        'metadata.lastError': null,
        'metadata.consecutiveErrors': 0,
      },
      $inc: {
        'metadata.totalFetched': fetchedCount,
      },
    });

    console.log(`[Cron] ✅ Fetched ${fetchedCount} items from ${source.name}`);
    return fetchedCount;
  } catch (error: any) {
    console.error(`[Cron] ❌ Error fetching source ${sourceId}:`, error.message);
    
    // Update source with error
    await Source.findByIdAndUpdate(sourceId, {
      $set: {
        'metadata.lastError': error.message,
      },
      $inc: {
        'metadata.consecutiveErrors': 1,
      },
    });
    
    return 0;
  }
}

/**
 * Fetch all enabled sources
 */
async function fetchAllSources() {
  try {
    await connectDB();
    
    const sources = await Source.find({ enabled: true });
    console.log(`[Cron] Found ${sources.length} enabled sources`);

    let totalFetched = 0;
    
    for (const source of sources) {
      const count = await fetchSourceContent(source._id.toString());
      totalFetched += count;
    }

    console.log(`[Cron] ✅ Batch complete: ${totalFetched} items fetched from ${sources.length} sources`);
  } catch (error) {
    console.error('[Cron] ❌ Error in fetch batch:', error);
  }
}

/**
 * Initialize cron jobs
 * Runs every hour by default
 */
export function initializeCronJobs() {
  // Run every hour at the start of the hour
  cron.schedule('0 * * * *', async () => {
    console.log('[Cron] ⏰ Hourly fetch triggered');
    await fetchAllSources();
  });

  // Also run immediately on startup (after 10 seconds delay)
  setTimeout(async () => {
    console.log('[Cron] 🚀 Initial fetch on startup');
    await fetchAllSources();
  }, 10000);

  console.log('[Cron] ✅ Cron jobs initialized (hourly at :00)');
}

// Manual trigger function for API endpoint
export async function triggerManualFetch() {
  console.log('[Cron] 🔄 Manual fetch triggered');
  await fetchAllSources();
}
