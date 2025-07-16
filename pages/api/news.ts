import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchAINews, NewsArticle } from '@/lib/api/news';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<NewsArticle[] | { error: string }>,
) {
  try {
    const { limit = 10 } = req.query;
    const news = await fetchAINews(Number(limit));
    res.status(200).json(news);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
}
