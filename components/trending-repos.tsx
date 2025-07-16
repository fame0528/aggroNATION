import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Github, Star, GitFork, ExternalLink, Flame } from 'lucide-react';
import { formatCompactNumber } from '@/lib/utils/number-format';

import useSWR from 'swr';

// Fetcher function
const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Interface for repository data (matching the API response)
interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  owner: {
    login: string;
  };
  topics?: string[];
}

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

export function TrendingRepos(): React.ReactElement {
  const {
    data: apiResponse,
    error,
    isLoading,
  } = useSWR(
    '/api/repos?limit=24', // Use same API as repos page, get 24 repos to match repos page
    fetcher,
    { revalidateOnFocus: false },
  );

  // Extract repos from API response
  const data = apiResponse?.items || [];

  return (
    <Card className="bg-gray-800 border-gray-700 h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="flex items-center space-x-2 text-white">
          <Github className="w-5 h-5 text-cyan-400" />
          <span>🔥 Trending Repositories</span>
          <Badge variant="secondary" className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
            Live
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <div className="space-y-3 h-full overflow-y-auto pr-2">
          {isLoading && <div className="text-gray-400">Loading trending repositories...</div>}
          {error && <div className="text-red-400">Failed to load trending repositories.</div>}
          {/* Never show empty state: always show at least a placeholder if no data */}
          {Array.isArray(data) && data.length === 0 && !isLoading && !error && (
            <div className="text-gray-400">Loading trending repositories...</div>
          )}
          {data &&
            data.map((repo: GitHubRepo) => (
              <div
                key={repo.full_name}
                className="p-3 bg-gray-750 rounded-lg border border-gray-600 hover:border-cyan-500/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-white text-sm">{repo.full_name}</h3>
                  </div>
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-white"
                  >
                    <a href={repo.html_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                </div>

                <p className="text-gray-300 text-sm mb-2 line-clamp-2">{repo.description}</p>

                <div className="flex flex-wrap gap-2 mb-2">
                  {repo.topics &&
                    repo.topics.length > 0 &&
                    repo.topics.slice(0, 3).map((tag: string, idx: number) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className={`text-xs ${getContentBasedColor(tag)}`}
                      >
                        {tag}
                      </Badge>
                    ))}
                </div>

                <div className="flex items-center justify-between text-sm text-gray-400">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center space-x-1">
                      <Star className="w-4 h-4" />
                      <span>{formatCompactNumber(repo.stargazers_count)}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <GitFork className="w-4 h-4" />
                      <span>{formatCompactNumber(repo.forks_count)}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                      <span>{repo.language}</span>
                    </span>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-xs ${
                      repo.language === 'Python'
                        ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                        : repo.language === 'JavaScript' || repo.language === 'TypeScript'
                          ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400'
                          : repo.language === 'Rust' || repo.language === 'C++'
                            ? 'bg-orange-500/20 border-orange-500 text-orange-400'
                            : repo.language === 'Go' || repo.language === 'Java'
                              ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400'
                              : repo.language === 'C#' || repo.language === 'Swift'
                                ? 'bg-purple-500/20 border-purple-500 text-purple-400'
                                : 'bg-green-500/20 border-green-500 text-green-400'
                    }`}
                  >
                    {repo.owner.login}
                  </Badge>
                </div>
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}
