import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchYouTubeVideosRSSPaginated } from '@/lib/api/youtube-rss';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ videos: any[]; totalCount: number } | { error: string }>,
) {
  try {
    const page = parseInt((req.query.page as string) || '1', 10);
    const limit = parseInt((req.query.limit as string) || '24', 10);
    const { videos, total } = await fetchYouTubeVideosRSSPaginated({ page, limit });
    res.status(200).json({ videos, totalCount: total });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
}
