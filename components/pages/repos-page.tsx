'use client';
import React from 'react';
import { useCategoryContext } from '@/contexts/category-context';
import useSWR from 'swr';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Github, Star, GitFork, ExternalLink, Flame, Search, Filter } from 'lucide-react';
import { Pagination } from '@/components/pagination';
import { Loader, ErrorMessage, Skeleton } from '@/components/shared-ui';

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

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function ReposPage() {
  const { selectedCategory } = useCategoryContext();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = React.useState<string>(searchParams?.get('search') || '');
  const [currentPage, setCurrentPage] = React.useState<number>(
    parseInt(searchParams?.get('page') || '1'),
  );
  const pageSize = 24;

  // Sync state to URL
  React.useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (selectedCategory) params.set('category', selectedCategory);
    if (currentPage > 1) params.set('page', String(currentPage));
    router.replace(`?${params.toString()}`);
  }, [search, selectedCategory, currentPage, router]);

  // Fetch paginated repos
  const { data, error, isLoading, mutate } = useSWR(
    `/api/repos?page=${currentPage}&limit=${pageSize}${search ? `&search=${encodeURIComponent(search)}` : ''}${selectedCategory ? `&category=${encodeURIComponent(selectedCategory)}` : ''}`,
    fetcher,
    { refreshInterval: 300000 },
  );

  const repos = data?.items || [];
  const totalCount = data?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

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
    <div className="space-y-8 w-full">
      {/* Page Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-white">🔥 Trending Repositories</h1>
            <p className="text-gray-400">
              Discover the hottest AI projects on GitHub • {totalCount} repositories found
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button className="border-gray-600 text-gray-300 bg-transparent hover:bg-gray-800">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="flex space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search repositories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-cyan-500"
            />
          </div>
        </div>
      </div>

      {/* Repositories Grid */}
      <div className="space-y-6">
        {isLoading && <Skeleton count={8} />}
        {error && (
          <ErrorMessage
            error={error.message || 'Failed to load repositories'}
            onRetry={() => mutate()}
          />
        )}
        {!isLoading &&
          !error &&
          repos.map((repo: any) => (
            <Card
              key={repo.id}
              className="bg-gray-800 border-gray-700 hover:border-cyan-500/50 transition-colors"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3 flex-1">
                    <Github className="w-6 h-6 text-cyan-400 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <h3 className="text-xl font-semibold text-white flex items-center space-x-2 mb-1">
                        <span className="truncate">{repo.full_name}</span>
                        {repo.isHot && <Flame className="w-5 h-5 text-orange-400 flex-shrink-0" />}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        Updated {new Date(repo.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="text-gray-400 hover:text-white flex-shrink-0"
                    onClick={() => window.open(repo.html_url, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>

                <p className="text-gray-300 mb-4 leading-relaxed">
                  {repo.description || 'No description available'}
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {repo.categories?.map((category: string, idx: number) => (
                    <Badge
                      key={category}
                      className={`text-xs ${
                        category.toLowerCase().includes('ai') ||
                        category.toLowerCase().includes('artificial')
                          ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400'
                          : category.toLowerCase().includes('machine') ||
                              category.toLowerCase().includes('ml')
                            ? 'bg-purple-500/20 border-purple-500 text-purple-400'
                            : category.toLowerCase().includes('deep') ||
                                category.toLowerCase().includes('neural')
                              ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                              : category.toLowerCase().includes('nlp') ||
                                  category.toLowerCase().includes('language')
                                ? 'bg-green-500/20 border-green-500 text-green-400'
                                : idx % 4 === 0
                                  ? 'bg-orange-500/20 border-orange-500 text-orange-400'
                                  : idx % 4 === 1
                                    ? 'bg-pink-500/20 border-pink-500 text-pink-400'
                                    : idx % 4 === 2
                                      ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400'
                                      : 'bg-red-500/20 border-red-500 text-red-400'
                      } hover:brightness-110`}
                    >
                      {category}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6 text-sm text-gray-400">
                    <span className="flex items-center space-x-1">
                      <Star className="w-4 h-4" />
                      <span>
                        {repo.stargazers_count?.toLocaleString?.() ??
                          repo.stars?.toLocaleString?.() ??
                          0}
                      </span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <GitFork className="w-4 h-4" />
                      <span>
                        {repo.forks_count?.toLocaleString?.() ??
                          repo.forks?.toLocaleString?.() ??
                          0}
                      </span>
                    </span>
                    {repo.language && (
                      <span className="flex items-center space-x-1">
                        <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                        <span>{repo.language}</span>
                      </span>
                    )}
                  </div>
                  <Badge
                    className={`text-xs ${
                      repo.license?.name === 'MIT License'
                        ? 'bg-green-500/20 border-green-500 text-green-400'
                        : repo.license?.name === 'Apache License 2.0'
                          ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                          : repo.license?.name === 'GNU General Public License v3.0'
                            ? 'bg-purple-500/20 border-purple-500 text-purple-400'
                            : repo.license?.name === 'BSD 3-Clause "New" or "Revised" License'
                              ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400'
                              : repo.license?.name
                                ? 'bg-orange-500/20 border-orange-500 text-orange-400'
                                : 'bg-red-500/20 border-red-500 text-red-400'
                    }`}
                  >
                    {repo.license?.name || 'No License'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        {!isLoading && !error && repos.length === 0 && (
          <div className="text-center py-16">
            <Github className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-400 mb-2">No repositories found</h3>
            <p className="text-gray-500">Try adjusting your search terms</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        totalCount={totalCount}
        pageSize={pageSize}
      />
    </div>
  );
}
