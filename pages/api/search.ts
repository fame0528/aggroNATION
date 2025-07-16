import { NextApiRequest, NextApiResponse } from 'next';
import { searchService } from '@/lib/services/search';
import { z } from 'zod';

const searchSchema = z.object({
  q: z.string().min(1),
  type: z.enum(['article', 'video', 'all']).optional(),
  category: z.string().optional(),
  source: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  tags: z.string().optional(), // comma-separated
  sort: z.enum(['relevance', 'date', 'views', 'likes']).optional().default('relevance'),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('20'),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'GET') {
      res.setHeader('Allow', ['GET']);
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const params = searchSchema.parse(req.query);

    // Build search query
    const searchQuery = {
      query: params.q,
      filters: {
        type: params.type,
        category: params.category,
        source: params.source,
        dateFrom: params.dateFrom ? new Date(params.dateFrom) : undefined,
        dateTo: params.dateTo ? new Date(params.dateTo) : undefined,
        tags: params.tags ? params.tags.split(',').map((tag) => tag.trim()) : undefined,
      },
      sort: {
        field: params.sort,
        order: params.order,
      },
      pagination: {
        page: parseInt(params.page),
        limit: parseInt(params.limit),
      },
    };

    // Perform search
    const results = await searchService.search(searchQuery);

    res.status(200).json(results);
  } catch (error) {
    console.error('Search API Error:', error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors,
      });
    }

    res.status(500).json({
      error: 'Internal server error',
      message:
        process.env.NODE_ENV === 'development' ? (error as Error).message : 'Something went wrong',
    });
  }
}
