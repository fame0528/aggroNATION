import { NextApiRequest, NextApiResponse } from 'next';
import NodeCache from 'node-cache';

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string;
  stargazers_count: number;
  forks_count: number;
  language: string;
  html_url: string;
  updated_at: string;
}

const cache = new NodeCache({ stdTTL: 300, checkperiod: 120 });

async function fetchTrendingRepos(limit: number = 100): Promise<GitHubRepo[]> {
  try {
    const apiKey = process.env.GITHUB_API_KEY;
    const url = `https://api.github.com/search/repositories?q=topic:machine-learning+topic:artificial-intelligence+topic:deep-learning&sort=stars&order=desc&per_page=${Math.min(limit, 100)}`;
    const headers: HeadersInit = {
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'aggroNATION-Dashboard',
    };
    if (apiKey) {
      headers.Authorization = `Bearer ${apiKey}`;
    }
    const response = await fetch(url, { headers });
    if (!response.ok) {
      console.error(`GitHub API error: ${response.status} ${response.statusText}`);
      return [];
    }
    const data = await response.json();
    if (!data.items || !Array.isArray(data.items)) {
      console.warn('GitHub API returned unexpected data structure');
      return [];
    }
    return data.items.slice(0, limit);
  } catch (error) {
    console.error('Error fetching trending repos:', error);
    return [];
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'GET') {
      res.setHeader('Allow', ['GET']);
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { page = '1', limit = '24', search = '', category = '' } = req.query;
    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.max(1, Math.min(parseInt(limit as string) || 24, 100));
    const cacheKey = `repos:all`;
    let allRepos = cache.get(cacheKey) as any[] | undefined;
    if (!allRepos) {
      allRepos = await fetchTrendingRepos(100); // Fetch a large batch for caching
      cache.set(cacheKey, allRepos);
    }

    // Filter by search and category
    let filtered = allRepos;
    if (search) {
      const q = (search as string).toLowerCase();
      filtered = filtered.filter(
        (r) => r.full_name?.toLowerCase().includes(q) || r.description?.toLowerCase().includes(q),
      );
    }
    if (category) {
      const cat = (category as string).toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.full_name?.toLowerCase().includes(cat) || r.description?.toLowerCase().includes(cat),
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
    console.error('Repos API Error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message:
        process.env.NODE_ENV === 'development' ? (error as Error).message : 'Something went wrong',
    });
  }
}
