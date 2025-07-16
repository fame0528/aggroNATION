/**
 * @fileoverview RSS Articles API endpoint with pagination, filtering, and search
 * @author aggroNATION Development Team
 * @version 1.0.0
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { getModels } from '../../../lib/db/models/rss';
import { RSSArticle } from '../../../lib/types/rss';

/**
 * Default handler for RSS Articles API
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return await handleGET(req, res);
  } else if (req.method === 'POST') {
    return await handlePOST(req, res);
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

/**
 * GET /api/rss/articles
 * Fetch RSS articles with pagination and filtering
 */
async function handleGET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { query } = req;

    // Parse query parameters
    const page = parseInt((query.page as string) || '1');
    const limit = Math.min(parseInt((query.limit as string) || '20'), 200); // Max 200 per page
    const category = (query.category as string) || undefined;
    const source = (query.source as string) || undefined;
    const status = (query.status as string) || 'active';
    const search = (query.search as string) || undefined;

    // Validate parameters
    if (page < 1 || limit < 1) {
      return res.status(400).json({ error: 'Invalid pagination parameters' });
    }

    // Get database models
    const { articles } = await getModels();

    // Fetch articles with filters
    const result = await articles.getArticles({
      page,
      limit,
      category,
      source,
      status,
      search,
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(result.total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    const response = {
      success: true,
      data: result.articles,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
      filters: {
        category,
        source,
        status,
        search,
      },
      timestamp: new Date().toISOString(),
    };

    // Add cache headers for performance
    res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=600'); // 5 min cache, 10 min stale
    res.setHeader('ETag', `"articles-${page}-${limit}-${category || 'all'}-${result.total}"`);

    return res.status(200).json(response);
  } catch (error: any) {
    console.error('RSS Articles API Error:', error);

    return res.status(500).json({
      success: false,
      error: 'Failed to fetch RSS articles',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
}

/**
 * POST /api/rss/articles
 * Create new RSS article (for testing or manual addition)
 */
async function handlePOST(req: NextApiRequest, res: NextApiResponse) {
  try {
    const articleData: Partial<RSSArticle> = req.body;

    // Validate required fields
    if (!articleData.title || !articleData.sourceUrl || !articleData.source) {
      return res.status(400).json({
        error: 'Missing required fields: title, sourceUrl, source',
      });
    }

    // Get database models
    const { articles } = await getModels();

    // Create article with defaults
    const newArticle: Omit<RSSArticle, '_id'> = {
      hash: `manual-${Date.now()}-${Math.random()}`,
      title: articleData.title,
      summary: articleData.summary || '',
      content: articleData.content || '',
      author: articleData.author || 'Manual Entry',
      source: articleData.source,
      sourceUrl: articleData.sourceUrl,
      feedUrl: articleData.feedUrl || '',
      publishedAt: articleData.publishedAt || new Date(),
      fetchedAt: new Date(),
      category: articleData.category || 'General AI',
      tags: articleData.tags || [],
      isBreaking: articleData.isBreaking || false,
      readTime: articleData.readTime || '1 min',
      status: 'active',
      views: 0,
      language: articleData.language || 'en',
      imageUrl: articleData.imageUrl,
    };

    const createdArticle = await articles.create(newArticle);

    if (!createdArticle) {
      return res.status(409).json({
        error: 'Article already exists (duplicate hash)',
      });
    }

    return res.status(201).json({
      success: true,
      data: createdArticle,
      message: 'Article created successfully',
    });
  } catch (error: any) {
    console.error('RSS Articles POST Error:', error);

    return res.status(500).json({
      success: false,
      error: 'Failed to create RSS article',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
}
