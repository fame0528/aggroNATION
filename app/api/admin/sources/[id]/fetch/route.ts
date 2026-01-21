/**
 * Manual Fetch Trigger API Route
 * 
 * Allows admins to manually trigger content fetching for a specific source
 * 
 * @route POST /api/admin/sources/[id]/fetch
 * @created 2026-01-20
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/admin';
import { connectDB } from '@/lib/db/mongoose';
import { Source } from '@/lib/db/models/Source';
import { Content } from '@/lib/db/models/Content';
import { fetchYouTubeVideos, convertYouTubeToContent } from '@/lib/fetchers/youtube';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * POST /api/admin/sources/[id]/fetch
 * Manually trigger content fetch for a specific source
 */
export async function POST(
  request: NextRequest,
  context: RouteParams
) {
  try {
    // Authenticate admin
    await requireAdmin();

    // Connect to database
    await connectDB();

    // Get source ID from params
    const { id } = await context.params;

    // Find the source
    const source = await Source.findById(id);
    if (!source) {
      return NextResponse.json(
        { error: 'Source not found' },
        { status: 404 }
      );
    }

    console.log(`[Fetch] Manually triggered fetch for source: ${source.name} (${source.type})`);

    let fetchedCount = 0;

    try {
      // Fetch based on source type
      switch (source.type) {
        case 'youtube': {
          const videos = await fetchYouTubeVideos(source);
          
          // Convert and save each video
          for (const video of videos) {
            const contentData = convertYouTubeToContent(video, source._id.toString());
            
            // Upsert to prevent duplicates
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
          
          console.log(`[Fetch] Successfully fetched ${fetchedCount} videos from ${source.name}`);
          break;
        }

        case 'rss':
        case 'reddit':
        case 'x':
          return NextResponse.json(
            { error: `Fetcher for ${source.type} not yet implemented` },
            { status: 501 }
          );

        default:
          return NextResponse.json(
            { error: `Unknown source type: ${source.type}` },
            { status: 400 }
          );
      }

      // Update source metadata
      await Source.findByIdAndUpdate(id, {
        $set: {
          'metadata.lastFetched': new Date(),
          'metadata.lastError': null,
          'metadata.consecutiveErrors': 0,
        },
        $inc: {
          'metadata.totalFetched': fetchedCount,
        },
      });

      return NextResponse.json({
        success: true,
        message: `Successfully fetched ${fetchedCount} items from ${source.name}`,
        count: fetchedCount,
      });
    } catch (fetchError: any) {
      console.error(`[Fetch] Error fetching from ${source.name}:`, fetchError.message);

      // Update source with error
      await Source.findByIdAndUpdate(id, {
        $set: {
          'metadata.lastError': fetchError.message,
        },
        $inc: {
          'metadata.consecutiveErrors': 1,
        },
      });

      return NextResponse.json(
        {
          error: 'Failed to fetch content',
          details: fetchError.message,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('[Fetch] Error:', error);
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
