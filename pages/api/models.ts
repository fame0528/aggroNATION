import { NextApiRequest, NextApiResponse } from 'next';
import NodeCache from 'node-cache';
// import rateLimit from 'express-rate-limit';
import { fetchTrendingModels } from '@/lib/api/huggingface';

const cache = new NodeCache({ stdTTL: 300, checkperiod: 120 });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'GET') {
      res.setHeader('Allow', ['GET']);
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { page = '1', limit = '24', search = '', category = '' } = req.query;
    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.max(1, Math.min(parseInt(limit as string) || 24, 100));
    const cacheKey = `models:all`;
    let allModels = cache.get(cacheKey) as any[] | undefined;
    if (!allModels) {
      allModels = await fetchTrendingModels(200); // Fetch a large batch for caching
      cache.set(cacheKey, allModels);
    }

    // Filter by search and category
    let filtered = allModels;
    if (search) {
      const q = (search as string).toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.modelId?.toLowerCase().includes(q) ||
          m.pipeline_tag?.toLowerCase().includes(q) ||
          (m.tags || []).join(' ').toLowerCase().includes(q),
      );
    }
    if (category) {
      const cat = (category as string).toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.pipeline_tag?.toLowerCase().includes(cat) ||
          (m.tags || []).join(' ').toLowerCase().includes(cat),
      );
    }

    const totalCount = filtered.length;
    const start = (pageNum - 1) * limitNum;
    const end = start + limitNum;
    const items = filtered.slice(start, end);

    res.status(200).json({
      items,
      totalCount,
      page: pageNum,
      limit: limitNum,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Models API Error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message:
        process.env.NODE_ENV === 'development' ? (error as Error).message : 'Something went wrong',
    });
  }
}
