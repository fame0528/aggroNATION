/**
 * Cron Job Webhook Endpoint
 * 
 * Can be called by:
 * - Vercel Cron Jobs
 * - External cron services (cron-job.org, EasyCron, etc.)
 * - GitHub Actions scheduled workflows
 * 
 * Protected by CRON_SECRET environment variable
 * 
 * @route GET /api/cron/fetch
 * @created 2026-01-20
 */

import { NextRequest, NextResponse } from 'next/server';
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
      return { success: false, count: 0, error: 'Source disabled or not found' };
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
        return { success: false, count: 0, error: `${source.type} fetcher not implemented` };
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
    return { success: true, count: fetchedCount, error: null };
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
    
    return { success: false, count: 0, error: error.message };
  }
}

/**
 * GET /api/cron/fetch
 * 
 * Fetch content from all enabled sources
 * Protected by CRON_SECRET token
 * 
 * Usage:
 * - Vercel Cron: GET https://yourdomain.com/api/cron/fetch?secret=YOUR_SECRET
 * - Manual: curl "https://yourdomain.com/api/cron/fetch?secret=YOUR_SECRET"
 */
export async function GET(request: NextRequest) {
  try {
    // Verify secret token
    const secret = request.nextUrl.searchParams.get('secret');
    const expectedSecret = process.env.CRON_SECRET;

    if (!expectedSecret) {
      console.error('[Cron API] CRON_SECRET not configured');
      return NextResponse.json(
        { error: 'Cron endpoint not configured' },
        { status: 500 }
      );
    }

    if (secret !== expectedSecret) {
      console.warn('[Cron API] Invalid secret provided');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('[Cron API] ⏰ Fetch triggered via webhook');

    // Connect to database
    await connectDB();

    // Get all enabled sources
    const sources = await Source.find({ enabled: true });
    console.log(`[Cron API] Found ${sources.length} enabled sources`);

    if (sources.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No enabled sources to fetch',
        results: [],
        summary: {
          total: 0,
          successful: 0,
          failed: 0,
          itemsFetched: 0,
        },
      });
    }

    // Fetch from each source
    const results = [];
    let totalFetched = 0;
    let successCount = 0;
    let failCount = 0;

    for (const source of sources) {
      const result = await fetchSourceContent(source._id.toString());
      
      results.push({
        sourceId: source._id.toString(),
        sourceName: source.name,
        sourceType: source.type,
        ...result,
      });

      if (result.success) {
        successCount++;
        totalFetched += result.count;
      } else {
        failCount++;
      }
    }

    console.log(`[Cron API] ✅ Batch complete: ${totalFetched} items from ${successCount}/${sources.length} sources`);

    return NextResponse.json({
      success: true,
      message: `Fetched ${totalFetched} items from ${successCount} sources`,
      results,
      summary: {
        total: sources.length,
        successful: successCount,
        failed: failCount,
        itemsFetched: totalFetched,
      },
    });
  } catch (error: any) {
    console.error('[Cron API] ❌ Error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
