import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchTrendingRepos, GitHubRepo } from '@/lib/api/github';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GitHubRepo[] | { error: string }>,
) {
  try {
    const { timeframe = 'weekly', limit = 10 } = req.query;
    const repos = await fetchTrendingRepos(
      timeframe as 'daily' | 'weekly' | 'monthly',
      Number(limit),
    );
    res.status(200).json(repos);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
}
