import React from 'react';
import { useCategoryContext } from '@/contexts/category-context';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Newspaper, ExternalLink, Clock, TrendingUp, Search, Filter } from 'lucide-react';
import { formatCompactDate } from '@/lib/utils/date-format';
import useSWR from 'swr';
import { useRouter, useSearchParams } from 'next/navigation';
import { Pagination } from '@/components/pagination';
import { Loader, ErrorMessage, Skeleton } from '@/components/shared-ui';

// Map sidebar categories to news tags/keywords
const CATEGORY_MAP: Record<string, string[]> = {
  'Generative AI': [
    'generative',
    'text-generation',
    'diffusion',
    'gpt',
    'stable diffusion',
    'sdxl',
    'llm',
    'ai',
  ],
  'Computer Vision': ['vision', 'image', 'detection', 'yolo', 'cv'],
  'NLP & LLMs': ['nlp', 'llm', 'language', 'bert', 'gpt', 'text'],
  'Ethics & Safety': ['ethics', 'safety', 'alignment', 'responsible', 'bias'],
  MLOps: ['mlops', 'deployment', 'pipeline', 'ops', 'monitoring'],
};

// ...removed allNews, will use real API only...

// Fetcher for SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Content-based color function for consistent but varied colors
const getContentBasedColor = (content: string): string => {
  const hash = content.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);

  const colorIndex = Math.abs(hash) % 8;
  const colors = [
    'bg-cyan-500/20 border-cyan-500/30 text-cyan-400',
    'bg-purple-500/20 border-purple-500/30 text-purple-400',
    'bg-green-500/20 border-green-500/30 text-green-400',
    'bg-orange-500/20 border-orange-500/30 text-orange-400',
    'bg-pink-500/20 border-pink-500/30 text-pink-400',
    'bg-yellow-500/20 border-yellow-500/30 text-yellow-400',
    'bg-blue-500/20 border-blue-500/30 text-blue-400',
    'bg-red-500/20 border-red-500/30 text-red-400',
  ];

  return colors[colorIndex];
};

export function NewsPage() {
  const { selectedCategory } = useCategoryContext();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = React.useState<string>(searchParams?.get('search') || '');
  const [currentPage, setCurrentPage] = React.useState<number>(
    parseInt(searchParams?.get('page') || '1'),
  );
  const articlesPerPage = 20;

  // Sync state to URL
  React.useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (selectedCategory) params.set('category', selectedCategory);
    if (currentPage > 1) params.set('page', String(currentPage));
    router.replace(`?${params.toString()}`);
  }, [search, selectedCategory, currentPage, router]);

  // Fetch paginated news data
  const {
    data: paginatedData,
    error: paginatedError,
    isLoading,
    mutate,
  } = useSWR(
    `/api/rss/articles?page=${currentPage}&limit=${articlesPerPage}${search ? `&search=${encodeURIComponent(search)}` : ''}${selectedCategory && selectedCategory in CATEGORY_MAP ? `&category=${encodeURIComponent(selectedCategory)}` : ''}`,
    fetcher,
    { refreshInterval: 300000 },
  );

  const paginatedNews = paginatedData?.data || [];
  const pagination = paginatedData?.pagination || {};
  const totalCount = pagination.total || 0;
  const totalPages = pagination.totalPages || 1;

  // Reset page when search/category changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedCategory]);

  // Pagination handler
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col flex-1 min-h-screen w-full bg-gray-900">
      <div className="flex items-center justify-between px-6 pt-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">📰 AI News Updates</h1>
          <p className="text-gray-400">
            Stay updated with the latest AI developments and announcements
          </p>
        </div>
        <div className="flex space-x-2">
          <Button className="border-gray-700 text-gray-400 bg-gray-800 hover:bg-gray-700">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      <div className="flex space-x-4 px-6 pt-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search news..."
            className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-cyan-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-6 px-6 py-8 flex-1">
        {isLoading && <Skeleton count={8} />}
        {paginatedError && (
          <ErrorMessage
            error={paginatedError.message || 'Failed to load news articles'}
            onRetry={() => mutate()}
          />
        )}
        {!isLoading && !paginatedError && paginatedNews.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400">No news articles found.</div>
          </div>
        )}

        {paginatedNews.map((article: any, index: number) => (
          <Card
            key={article.hash || article.title || index}
            className="bg-gray-800 border-gray-700 hover:border-orange-500/50 transition-colors"
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Newspaper className="w-6 h-6 text-orange-400" />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-xl font-semibold text-white">{article.title}</h3>
                      {article.isBreaking && (
                        <Badge className="text-xs bg-red-500/20 text-red-400 border-red-500/30">
                          Breaking
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-400">
                      {article.source} • By {article.author}
                    </p>
                  </div>
                </div>
                <Button asChild size="sm" className="text-gray-400 hover:text-white">
                  <a href={article.sourceUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>
              </div>

              <p className="text-gray-300 mb-4">{article.summary}</p>

              {article.content && (
                <div className="bg-gray-750 p-4 rounded-lg mb-4">
                  <h4 className="text-white font-medium mb-2">Full Article</h4>
                  <p className="text-gray-300 text-sm leading-relaxed line-clamp-6">
                    {article.content}
                  </p>
                </div>
              )}

              <div className="flex flex-wrap gap-2 mb-4">
                {article.category && (
                  <Badge className={`text-xs ${getContentBasedColor(article.category)}`}>
                    {article.category}
                  </Badge>
                )}
                {(article.tags || []).map((tag: string, idx: number) => (
                  <Badge key={tag + idx} className={`text-xs ${getContentBasedColor(tag)}`}>
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center justify-between text-sm text-gray-400">
                <div className="flex items-center space-x-4">
                  {article.readTime && (
                    <span className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{article.readTime} read</span>
                    </span>
                  )}
                  <span>{formatCompactDate(article.publishedAt)}</span>
                </div>
                <TrendingUp className="w-4 h-4 text-orange-400" />
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Pagination Controls */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          totalCount={totalCount}
          pageSize={articlesPerPage}
        />
      </div>
    </div>
  );
}
