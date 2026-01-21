/**
 * Sources API Route
 * 
 * GET /api/admin/sources - List all sources
 * POST /api/admin/sources - Create new source
 * 
 * @module app/api/admin/sources
 * @created 2026-01-20
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db/mongoose';
import { Source } from '@/lib/db/models/Source';
import { requireAdmin } from '@/lib/auth/admin';

const createSourceSchema = z.object({
  type: z.enum(['rss', 'reddit', 'youtube', 'x']),
  name: z.string().min(1).max(100),
  url: z.string().url(),
  enabled: z.boolean().optional(),
  config: z.object({
    fetchInterval: z.number().min(5).max(1440).optional(),
    priority: z.enum(['low', 'medium', 'high']).optional(),
    maxItems: z.number().min(1).max(200).optional(),
    tags: z.array(z.string()).optional(),
  }).optional(),
});

/**
 * GET - List all sources
 */
export async function GET() {
  try {
    await requireAdmin();
    await connectDB();

    const sources = await Source.find({}).sort({ createdAt: -1 });

    return NextResponse.json({
      sources,
      count: sources.length,
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.error('Error fetching sources:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST - Create new source
 */
export async function POST(request: NextRequest) {
  try {
    console.log('[API] POST /api/admin/sources - Starting...');
    
    await requireAdmin();
    console.log('[API] Authentication passed');
    
    await connectDB();
    console.log('[API] Database connected');

    const body = await request.json();
    console.log('[API] Request body:', body);
    
    const data = createSourceSchema.parse(body);
    console.log('[API] Validation passed:', data);

    // Check for duplicate URL
    const existing = await Source.findOne({ url: data.url });
    console.log('[API] Duplicate check:', existing ? 'Found duplicate' : 'No duplicate');
    
    if (existing) {
      console.log('[API] Returning 400 - duplicate URL');
      return NextResponse.json(
        { error: 'Source with this URL already exists' },
        { status: 400 }
      );
    }

    console.log('[API] Creating source...');
    const source = await Source.create(data);
    console.log('[API] Source created:', source._id);

    return NextResponse.json(
      { source },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[API] Error in POST /api/admin/sources:', error);
    
    if (error.message === 'Unauthorized') {
      console.log('[API] Returning 401 - Unauthorized');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (error instanceof z.ZodError) {
      console.log('[API] Returning 400 - Validation error:', error.issues);
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      );
    }

    console.error('[API] Returning 500 - Internal server error');
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
