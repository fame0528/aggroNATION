export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
  author?: string;
  urlToImage?: string;
}

import Parser from 'rss-parser';

export async function fetchAINews(limit = 50): Promise<NewsArticle[]> {
  const parser = new Parser();
  const feeds = [
    'https://www.wired.com/feed/tag/ai/latest/rss',
    'https://knowtechie.com/category/ai/feed/',
    'https://dev.to/feed',
    'https://huggingface.co/blog/feed.xml',
    'https://hackernoon.com/tagged/ai/feed',
  ];
  try {
    const allItems: NewsArticle[] = [];
    for (const feedUrl of feeds) {
      try {
        const feed = await parser.parseURL(feedUrl);
        for (const item of feed.items || []) {
          allItems.push({
            id:
              item.guid ||
              item.id ||
              item.link ||
              item.title ||
              Math.random().toString(36).slice(2),
            title: item.title || 'Untitled',
            description:
              item.contentSnippet || item.summary || item.content || item.description || '',
            url: item.link || '',
            source: feed.title || '',
            publishedAt: item.isoDate || item.pubDate || new Date().toISOString(),
            author: item.creator || item.author || '',
            urlToImage: (item.enclosure && item.enclosure.url) || '',
          });
        }
      } catch (err) {
        // Ignore individual feed errors
        console.error(`Failed to fetch or parse feed: ${feedUrl}`, err);
      }
    }
    // Sort by published date, descending
    allItems.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    return allItems.slice(0, limit);
  } catch (error) {
    console.error('Error fetching AI news:', error);
    return [];
  }
}
