import type { NextApiRequest, NextApiResponse } from 'next';

export interface ArxivPaper {
  id: string;
  title: string;
  authors: string;
  venue: string;
  abstract: string;
  link: string;
  date: string;
  categories: string[];
  citations?: number;
}

/**
 * Fetches arXiv papers from the API route.
 * @param url API endpoint
 * @returns Promise<ArxivPaper[]>
 */
export async function fetchArxivPapers(url: string): Promise<ArxivPaper[]> {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch arXiv papers');
  return res.json();
}
