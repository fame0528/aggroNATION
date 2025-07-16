import type { NextApiRequest, NextApiResponse } from 'next';

// @ts-ignore: rss-parser has no types in v3
import Parser from 'rss-parser';
import type { ArxivPaper } from '@/lib/api/arxiv';

const ARXIV_RSS = 'https://export.arxiv.org/rss/cs.AI';

const parser = new Parser();

/**
 * API route to fetch and parse arXiv RSS feed for AI papers.
 * @param req NextApiRequest
 * @param res NextApiResponse
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ArxivPaper[] | { error: string }>,
) {
  try {
    const feed = await parser.parseURL(ARXIV_RSS);
    const papers: ArxivPaper[] = (feed.items || []).map((item: any) => ({
      id: item.id || item.link || item.title || '',
      title: item.title || '',
      authors: item.creator || item.author || 'Unknown',
      venue: 'arXiv',
      abstract: item.contentSnippet || item.content || '',
      link: item.link || '',
      date: item.isoDate || item.pubDate || '',
      categories: item.categories || [],
    }));
    res.status(200).json(papers);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
}
