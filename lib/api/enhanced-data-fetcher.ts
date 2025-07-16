// import {
//   COMPREHENSIVE_AI_REPOS,
//   COMPREHENSIVE_AI_MODELS,
//   COMPREHENSIVE_AI_NEWS,
// } from '@/lib/data/comprehensive-datasets';
// All static/fallback data imports removed. Use only live API data.

// Enhanced data fetcher that combines real APIs with comprehensive fallback data
export class EnhancedDataFetcher {
  private static instance: EnhancedDataFetcher;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

  static getInstance(): EnhancedDataFetcher {
    if (!EnhancedDataFetcher.instance) {
      EnhancedDataFetcher.instance = new EnhancedDataFetcher();
    }
    return EnhancedDataFetcher.instance;
  }

  // Helper function to get absolute URL
  private getAbsoluteUrl(path: string): string {
    if (typeof window !== 'undefined') {
      // Client-side: use relative URLs
      return path;
    } else {
      // Server-side: use absolute URLs
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      return `${baseUrl}${path}`;
    }
  }

  private isCacheValid(key: string): boolean {
    const cached = this.cache.get(key);
    return cached ? Date.now() - cached.timestamp < this.CACHE_DURATION : false;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  private getCache(key: string): any {
    return this.cache.get(key)?.data;
  }

  async fetchTrendingRepos(limit = 100): Promise<any[]> {
    return this.fetchFromGitHubAPI(limit);
  }

  async fetchLatestModels(limit = 100): Promise<any[]> {
    return this.fetchFromHuggingFaceAPI(limit);
  }

  async fetchAINews(limit = 100): Promise<any[]> {
    try {
      const res = await fetch(this.getAbsoluteUrl(`/api/news?limit=${limit}`));
      if (!res.ok) throw new Error('Failed to fetch news');
      return await res.json();
    } catch (error) {
      console.error('Error fetching AI news:', error);
      return [];
    }
  }

  private async fetchFromGitHubAPI(limit: number): Promise<any[]> {
    const queries = [
      'topic:artificial-intelligence stars:>100',
      'topic:machine-learning stars:>100',
      'topic:deep-learning stars:>100',
      'topic:llm stars:>50',
      'topic:computer-vision stars:>50',
      'topic:nlp stars:>50',
      'topic:generative-ai stars:>50',
      'topic:transformers stars:>50',
      'topic:pytorch stars:>100',
      'topic:tensorflow stars:>100',
    ];

    const allRepos: any[] = [];

    for (const query of queries) {
      try {
        const response = await fetch(
          `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=20`,
          {
            headers: {
              Accept: 'application/vnd.github.v3+json',
              'User-Agent': 'AI-Pulse-Dashboard',
            },
          },
        );

        if (response.ok) {
          const data = await response.json();
          if (data.items && Array.isArray(data.items)) {
            allRepos.push(...data.items);
          }
        }

        // Rate limiting
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Error fetching GitHub data for query ${query}:`, error);
      }
    }

    // Remove duplicates and add categories
    const uniqueRepos = allRepos
      .filter((repo, index, self) => self.findIndex((r) => r.id === repo.id) === index)
      .map((repo) => ({
        ...repo,
        categories: this.categorizeRepo(repo),
      }))
      .slice(0, limit);

    return uniqueRepos;
  }

  private async fetchFromHuggingFaceAPI(limit: number): Promise<any[]> {
    const pipelines = [
      'text-generation',
      'text-to-image',
      'automatic-speech-recognition',
      'image-classification',
      'text-classification',
      'question-answering',
      'summarization',
      'translation',
      'image-to-text',
      'text-to-speech',
    ];

    const allModels: any[] = [];

    for (const pipeline of pipelines) {
      try {
        const response = await fetch(
          `https://huggingface.co/api/models?pipeline_tag=${pipeline}&sort=downloads&direction=-1&limit=15`,
          {
            headers: {
              Accept: 'application/json',
            },
          },
        );

        if (response.ok) {
          const models = await response.json();
          if (Array.isArray(models)) {
            allModels.push(...models);
          }
        }

        // Rate limiting
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Error fetching HuggingFace data for ${pipeline}:`, error);
      }
    }

    // Remove duplicates and add categories
    const uniqueModels = allModels
      .filter((model, index, self) => self.findIndex((m) => m.id === model.id) === index)
      .map((model) => ({
        ...model,
        categories: this.categorizeModel(model),
      }))
      .slice(0, limit);

    return uniqueModels;
  }

  private async fetchFromNewsAPIs(limit: number): Promise<any[]> {
    const sources = [
      'https://feeds.feedburner.com/oreilly/radar/ai',
      'https://techcrunch.com/category/artificial-intelligence/feed/',
      'https://www.artificialintelligence-news.com/feed/',
      'https://venturebeat.com/ai/feed/',
    ];

    const allArticles: any[] = [];

    for (const source of sources) {
      try {
        const response = await fetch(
          `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(source)}&count=25`,
          {
            headers: {
              Accept: 'application/json',
            },
          },
        );

        if (response.ok) {
          const data = await response.json();
          const articles =
            data.items?.map((item: any) => ({
              id: `news_${Date.now()}_${Math.random()}`,
              title: item.title || 'Untitled',
              description:
                (item.description || '').replace(/<[^>]*>/g, '').substring(0, 300) + '...',
              url: item.link || '#',
              publishedAt: item.pubDate || new Date().toISOString(),
              source: { name: data.feed?.title || 'AI News' },
              author: item.author || 'Unknown',
              category: this.categorizeNews(item),
              tags: this.extractTags((item.title || '') + ' ' + (item.description || '')),
            })) || [];

          allArticles.push(...articles);
        }

        // Rate limiting
        await new Promise((resolve) => setTimeout(resolve, 200));
      } catch (error) {
        console.error(`Error fetching news from ${source}:`, error);
      }
    }

    return allArticles.slice(0, limit);
  }

  private categorizeRepo(repo: any): string[] {
    const description = repo.description?.toLowerCase() || '';
    const topics = repo.topics || [];
    const allText = [...topics, description].join(' ');

    const categories = [];

    if (
      allText.includes('llm') ||
      allText.includes('language model') ||
      allText.includes('gpt') ||
      allText.includes('bert')
    ) {
      categories.push('LLM');
    }
    if (
      allText.includes('computer vision') ||
      allText.includes('cv') ||
      allText.includes('image') ||
      allText.includes('vision')
    ) {
      categories.push('Computer Vision');
    }
    if (
      allText.includes('generative') ||
      allText.includes('diffusion') ||
      allText.includes('gan')
    ) {
      categories.push('Generative AI');
    }
    if (allText.includes('nlp') || allText.includes('natural language')) {
      categories.push('NLP');
    }
    if (allText.includes('speech') || allText.includes('audio') || allText.includes('voice')) {
      categories.push('Speech & Audio');
    }
    if (allText.includes('robotics') || allText.includes('robot')) {
      categories.push('Robotics');
    }

    return categories.length > 0 ? categories : ['General AI'];
  }

  private categorizeModel(model: any): string[] {
    const categories = [];

    switch (model.pipeline_tag) {
      case 'text-generation':
        categories.push('Text Generation', 'LLM');
        break;
      case 'text-to-image':
        categories.push('Image Generation', 'Generative AI');
        break;
      case 'automatic-speech-recognition':
        categories.push('Speech Recognition', 'Audio');
        break;
      case 'image-classification':
        categories.push('Computer Vision', 'Classification');
        break;
      default:
        categories.push('General AI');
    }

    return categories;
  }

  private categorizeNews(article: any): string {
    const title = article.title?.toLowerCase() || '';
    const description = article.description?.toLowerCase() || '';
    const allText = title + ' ' + description;

    if (allText.includes('openai') || allText.includes('gpt') || allText.includes('chatgpt')) {
      return 'Product Launch';
    } else if (
      allText.includes('research') ||
      allText.includes('paper') ||
      allText.includes('study')
    ) {
      return 'Research';
    } else if (
      allText.includes('open source') ||
      allText.includes('github') ||
      allText.includes('release')
    ) {
      return 'Open Source';
    } else if (
      allText.includes('regulation') ||
      allText.includes('policy') ||
      allText.includes('law')
    ) {
      return 'Regulation';
    }

    return 'General';
  }

  private extractTags(text: string): string[] {
    const tags = [];
    const lowerText = text.toLowerCase();

    if (lowerText.includes('openai')) tags.push('OpenAI');
    if (lowerText.includes('google')) tags.push('Google');
    if (lowerText.includes('microsoft')) tags.push('Microsoft');
    if (lowerText.includes('meta')) tags.push('Meta');
    if (lowerText.includes('llm')) tags.push('LLM');
    if (lowerText.includes('ai safety')) tags.push('AI Safety');

    return tags.length > 0 ? tags : ['AI'];
  }
}
