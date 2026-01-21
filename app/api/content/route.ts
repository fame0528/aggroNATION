/**
 * Content API Route
 * 
 * Public endpoint for retrieving cached content from the database
 * Supports filtering by source type, pagination, and sorting
 * 
 * @route GET /api/content
 * @created 2026-01-20
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import { Content, IContent } from '@/lib/db/models/Content';
import { Source, ISource } from '@/lib/db/models/Source';

interface ContentQuery {
  sourceType?: 'youtube' | 'rss' | 'reddit' | 'x';
  limit?: number;
  offset?: number;
  featured?: boolean;
}

/**
 * GET /api/content
 * Retrieve cached content from database
 * 
 * Query params:
 * - sourceType: Filter by content type (youtube, rss, reddit, x)
 * - limit: Number of items to return (default: 20, max: 100)
 * - offset: Pagination offset (default: 0)
 * - featured: Only return featured content (default: false)
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const sourceType = searchParams.get('sourceType') as ContentQuery['sourceType'];
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const featured = searchParams.get('featured') === 'true';

    console.log(`[Content API] Query: type=${sourceType}, limit=${limit}, offset=${offset}, featured=${featured}`);

    // Build query
    const query: any = {
      archived: false, // Never show archived content
    };

    if (sourceType) {
      query.sourceType = sourceType;
    }

    if (featured) {
      query.featured = true;
    }

    // Execute query with pagination
    const content = await Content.find(query)
      .sort({ 'metrics.rating': -1, publishedAt: -1 }) // Sort by rating, then date
      .skip(offset)
      .limit(limit)
      .lean();

    // Get source details for each content item
    const sourceIds = Array.from(new Set(content.map((c: any) => c.sourceId.toString())));
    const sources = await Source.find({
      _id: { $in: sourceIds },
    }).lean();

    // Create source lookup map
    const sourceMap = new Map(
      sources.map((s: any) => [s._id.toString(), s])
    );

    // Enrich content with source details
    const enrichedContent = content.map((item: any) => {
      const source = sourceMap.get(item.sourceId.toString()) as any;
      
      return {
        _id: item._id.toString(),
        title: item.title,
        excerpt: item.excerpt,
        url: item.url,
        author: item.author,
        publishedAt: item.publishedAt,
        tags: item.tags,
        metrics: item.metrics,
        featured: item.featured,
        source: {
          id: source?._id.toString(),
          type: source?.type || item.sourceType,
          name: source?.name || 'Unknown',
          url: source?.url,
        },
      };
    });

    // Get total count for pagination
    const total = await Content.countDocuments(query);

    console.log(`[Content API] Returning ${enrichedContent.length} items (total: ${total})`);

    return NextResponse.json({
      content: enrichedContent,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error: any) {
    console.error('[Content API] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
