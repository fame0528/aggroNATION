/**
 * Single Source API Route
 * 
 * GET /api/admin/sources/[id] - Get source details
 * PATCH /api/admin/sources/[id] - Update source
 * DELETE /api/admin/sources/[id] - Delete source
 * 
 * @module app/api/admin/sources/[id]
 * @created 2026-01-20
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db/mongoose';
import { Source } from '@/lib/db/models/Source';
import { Content } from '@/lib/db/models/Content';
import { requireAdmin } from '@/lib/auth/admin';

const updateSourceSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  url: z.string().url().optional(),
  enabled: z.boolean().optional(),
  config: z.object({
    fetchInterval: z.number().min(5).max(1440).optional(),
    priority: z.enum(['low', 'medium', 'high']).optional(),
    maxItems: z.number().min(1).max(200).optional(),
    tags: z.array(z.string()).optional(),
  }).optional(),
});

/**
 * GET - Get source details with content count
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    await connectDB();

    const { id } = await params;
    const source = await Source.findById(id);

    if (!source) {
      return NextResponse.json(
        { error: 'Source not found' },
        { status: 404 }
      );
    }

    // Get content count for this source
    const contentCount = await Content.countDocuments({ sourceId: id });

    return NextResponse.json({
      source,
      contentCount,
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.error('Error fetching source:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH - Update source
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    await connectDB();

    const { id } = await params;
    const body = await request.json();
    const data = updateSourceSchema.parse(body);

    const source = await Source.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );

    if (!source) {
      return NextResponse.json(
        { error: 'Source not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ source });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error updating source:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Delete source and associated content
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    await connectDB();

    const { id } = await params;

    // Delete source
    const source = await Source.findByIdAndDelete(id);

    if (!source) {
      return NextResponse.json(
        { error: 'Source not found' },
        { status: 404 }
      );
    }

    // Delete all content from this source
    await Content.deleteMany({ sourceId: id });

    return NextResponse.json({
      success: true,
      message: 'Source and associated content deleted',
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.error('Error deleting source:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
