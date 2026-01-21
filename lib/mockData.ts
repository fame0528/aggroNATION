/**
 * Mock Data for Development
 * 
 * Sample content from various sources (RSS, Reddit, YouTube, X) for scaffolding
 * This will be replaced with real data from MongoDB in future phases
 * 
 * @module lib/mockData
 * @created 2026-01-20
 */

import { ContentItem } from '@/types/content';

/**
 * Generate mock content items for development and testing
 * Includes diverse sources: RSS feeds, Reddit posts, YouTube videos, X posts
 * 
 * @returns Array of mock content items with varied sources
 */
export const mockContent: ContentItem[] = [
  {
    id: '1',
    title: 'GPT-5 Rumors: OpenAI Reportedly Training Next-Gen Model',
    excerpt: 'Sources suggest OpenAI has begun training GPT-5 with significantly expanded capabilities, including improved reasoning and multimodal understanding.',
    url: 'https://example.com/gpt5-rumors',
    source: {
      id: 'openai-blog',
      name: 'OpenAI Blog',
      type: 'rss',
      url: 'https://openai.com/blog',
    },
    publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    metrics: {
      upvotes: 1247,
      comments: 342,
      shares: 89,
      rating: 0.95,
    },
    tags: ['GPT', 'OpenAI', 'LLMs', 'Training'],
    author: 'Sam Altman',
  },
  {
    id: '2',
    title: 'Google Gemini 2.0 Beats GPT-4 in Reasoning Benchmarks',
    excerpt: 'New benchmark results show Google\'s Gemini 2.0 outperforming GPT-4 in complex reasoning tasks, sparking debate about evaluation methodologies.',
    url: 'https://example.com/gemini-benchmark',
    source: {
      id: 'r-machinelearning',
      name: 'r/MachineLearning',
      type: 'reddit',
      url: 'https://reddit.com/r/MachineLearning',
    },
    publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    metrics: {
      upvotes: 892,
      comments: 267,
      shares: 45,
      rating: 0.88,
    },
    tags: ['Gemini', 'Google', 'Benchmarks', 'GPT-4'],
    author: 'u/ml_researcher',
  },
  {
    id: '3',
    title: 'Anthropic Claude 3 Opus - Full Review and Capabilities',
    excerpt: 'Deep dive into Claude 3 Opus features, testing its reasoning capabilities, coding performance, and comparing it to GPT-4 and Gemini Pro.',
    url: 'https://youtube.com/watch?v=example',
    source: {
      id: 'ai-explained-yt',
      name: 'AI Explained',
      type: 'youtube',
      url: 'https://youtube.com/@aiexplained',
    },
    publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
    metrics: {
      upvotes: 645,
      comments: 128,
      shares: 72,
      rating: 0.82,
    },
    tags: ['Claude', 'Anthropic', 'Review', 'LLMs'],
    author: 'AI Explained',
  },
  {
    id: '4',
    title: 'Meta Releases Llama 3: 70B Model Now Available',
    excerpt: 'Meta AI announces the release of Llama 3 with 70 billion parameters, claiming significant improvements over Llama 2 in coding and reasoning tasks.',
    url: 'https://x.com/meta/status/example',
    source: {
      id: 'meta-ai-x',
      name: 'Meta AI',
      type: 'x',
      url: 'https://x.com/MetaAI',
    },
    publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    metrics: {
      upvotes: 2341,
      comments: 456,
      shares: 234,
      rating: 0.93,
    },
    tags: ['Llama', 'Meta', 'Open Source', 'Release'],
    author: '@MetaAI',
  },
  {
    id: '5',
    title: 'Mistral AI Secures $600M in Series B Funding',
    excerpt: 'French AI startup Mistral AI raises $600M at $6B valuation, positioning itself as Europe\'s leading open-source AI model provider.',
    url: 'https://example.com/mistral-funding',
    source: {
      id: 'techcrunch-rss',
      name: 'TechCrunch AI',
      type: 'rss',
      url: 'https://techcrunch.com/ai',
    },
    publishedAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(), // 18 hours ago
    metrics: {
      upvotes: 534,
      comments: 89,
      shares: 67,
      rating: 0.79,
    },
    tags: ['Mistral', 'Funding', 'Startup', 'Europe'],
    author: 'Kyle Wiggers',
  },
  {
    id: '6',
    title: 'New Study: AI Models Show Emergent Reasoning Capabilities',
    excerpt: 'Researchers at Stanford discover unexpected emergent behaviors in large language models when trained on specific reasoning datasets.',
    url: 'https://example.com/emergent-reasoning',
    source: {
      id: 'arxiv-rss',
      name: 'arXiv AI',
      type: 'rss',
      url: 'https://arxiv.org/list/cs.AI/recent',
    },
    publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    metrics: {
      upvotes: 423,
      comments: 156,
      shares: 34,
      rating: 0.75,
    },
    tags: ['Research', 'Stanford', 'Reasoning', 'Emergent Behavior'],
    author: 'Various Authors',
  },
  {
    id: '7',
    title: 'OpenAI Announces Custom GPTs Marketplace Launch Date',
    excerpt: 'The GPT Store is officially launching next week, allowing creators to monetize their custom GPT applications.',
    url: 'https://x.com/openai/status/example2',
    source: {
      id: 'openai-x',
      name: 'OpenAI',
      type: 'x',
      url: 'https://x.com/OpenAI',
    },
    publishedAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(), // 1.5 days ago
    metrics: {
      upvotes: 1876,
      comments: 423,
      shares: 187,
      rating: 0.91,
    },
    tags: ['OpenAI', 'GPT Store', 'Marketplace', 'Monetization'],
    author: '@OpenAI',
  },
  {
    id: '8',
    title: 'Understanding Transformer Attention Mechanisms - Visual Guide',
    excerpt: 'A comprehensive visual explanation of how attention mechanisms work in transformer models, with interactive diagrams.',
    url: 'https://youtube.com/watch?v=example2',
    source: {
      id: 'computerphile-yt',
      name: 'Computerphile',
      type: 'youtube',
      url: 'https://youtube.com/@Computerphile',
    },
    publishedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), // 2 days ago
    metrics: {
      upvotes: 756,
      comments: 94,
      shares: 123,
      rating: 0.84,
    },
    tags: ['Transformers', 'Tutorial', 'Attention', 'Education'],
    author: 'Computerphile',
  },
];

/**
 * Get relative time string from timestamp
 * 
 * @param timestamp - ISO 8601 timestamp
 * @returns Human-readable relative time (e.g., "2 hours ago")
 */
export function getRelativeTime(timestamp: string): string {
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  
  return new Date(timestamp).toLocaleDateString();
}
