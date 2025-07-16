'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Github,
  Star,
  GitFork,
  ExternalLink,
  Flame,
  Search,
  Filter,
  TrendingUp,
  Calendar,
  Code,
  Eye,
  AlertCircle,
} from 'lucide-react';
import { useRealTimeDataContext } from '@/contexts/real-time-data-context';
import { DataStatusIndicator } from '@/components/real-time/data-status-indicator';

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

export function EnhancedReposPage() {
  const context = useRealTimeDataContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'stars' | 'updated' | 'trending' | 'health'>('trending');
  const [showFilters, setShowFilters] = useState(false);

  // Safe access to context data with fallbacks
  const repositories = Array.isArray(context?.repositories) ? context.repositories : [];
  const loading = !!context?.loading;
  const error = context?.error || null;

  const filteredAndSortedRepos = useMemo(() => {
    if (!Array.isArray(repositories)) return [];

    const filtered = repositories.filter((repo) => {
      if (!repo) return false;

      const matchesSearch =
        repo.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        repo.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (Array.isArray(repo.topics) &&
          repo.topics.some((topic: string) =>
            topic?.toLowerCase().includes(searchTerm.toLowerCase()),
          ));

      const matchesCategories =
        selectedCategories.length === 0 ||
        (Array.isArray(repo.categories) &&
          selectedCategories.some((cat) => repo.categories.includes(cat)));

      return matchesSearch && matchesCategories;
    });

    // Sort repositories
    filtered.sort((a, b) => {
      if (!a || !b) return 0;

      switch (sortBy) {
        case 'stars':
          return (b.stargazers_count || 0) - (a.stargazers_count || 0);
        case 'updated':
          return new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime();
        case 'trending':
          return (b.trending_score || 0) - (a.trending_score || 0);
        case 'health':
          return (b.health_score || 0) - (a.health_score || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [repositories, searchTerm, selectedCategories, sortBy]);

  const availableCategories = useMemo(() => {
    if (!Array.isArray(repositories)) return [];

    const categories = new Set<string>();
    repositories.forEach((repo) => {
      if (repo && Array.isArray(repo.categories)) {
        repo.categories.forEach((cat: string) => {
          if (cat) categories.add(cat);
        });
      }
    });
    return Array.from(categories).sort();
  }, [repositories]);

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    );
  };

  if (loading && repositories.length === 0) {
    return (
      <div className="space-y-6">
        <DataStatusIndicator />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <TrendingUp className="w-8 h-8 animate-pulse text-cyan-400 mx-auto mb-2" />
            <p className="text-gray-400">Loading trending repositories...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && repositories.length === 0) {
    return (
      <div className="space-y-6">
        <DataStatusIndicator />
        <div className="text-center text-red-400 p-8">
          <AlertCircle className="w-8 h-8 mx-auto mb-2" />
          <p>{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Data Status */}
      <DataStatusIndicator />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">🔥 Trending AI Repositories</h1>
          <p className="text-gray-400">
            Discover the hottest AI projects on GitHub • {filteredAndSortedRepos.length}{' '}
            repositories found
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="border-gray-600 text-gray-300 bg-transparent"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {/* Search and Sort */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search repositories, topics, descriptions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-cyan-500"
          />
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
        >
          <option value="trending">Trending Score</option>
          <option value="stars">Most Stars</option>
          <option value="updated">Recently Updated</option>
          <option value="health">Health Score</option>
        </select>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <h3 className="text-white font-medium mb-3">Filter by Categories</h3>
            <div className="flex flex-wrap gap-2">
              {availableCategories.map((category, idx) => (
                <Badge
                  key={category}
                  data-variant={selectedCategories.includes(category) ? 'default' : 'outline'}
                  className={`cursor-pointer transition-colors ${
                    selectedCategories.includes(category)
                      ? 'bg-cyan-500 text-white'
                      : `${getContentBasedColor(category)} hover:opacity-75`
                  }`}
                  onClick={() => toggleCategory(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>
            {selectedCategories.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedCategories([])}
                className="mt-2 text-gray-400 hover:text-white"
              >
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Repository Grid */}
      <div className="grid gap-6">
        {filteredAndSortedRepos.map((repo) => {
          if (!repo || !repo.id) return null;

          return (
            <Card
              key={repo.id}
              className="bg-gray-800 border-gray-700 hover:border-cyan-500/50 transition-colors"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Github className="w-6 h-6 text-cyan-400" />
                    <div>
                      <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
                        <span>{repo.full_name || repo.name || 'Unknown Repository'}</span>
                        {(repo.trending_score || 0) > 1000 && (
                          <Flame className="w-5 h-5 text-orange-400" />
                        )}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        Updated{' '}
                        {repo.updated_at
                          ? new Date(repo.updated_at).toLocaleDateString()
                          : 'Unknown'}{' '}
                        • AI Relevance: {repo.ai_relevance || 0}%
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-white"
                    onClick={() => repo.html_url && window.open(repo.html_url, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>

                <p className="text-gray-300 mb-4">
                  {repo.description || 'No description available'}
                </p>

                {/* Categories and Topics */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {Array.isArray(repo.categories) &&
                    repo.categories.map((category: string) => (
                      <Badge
                        key={category}
                        data-variant="outline"
                        className="text-xs border-cyan-500/50 text-cyan-400 hover:border-cyan-500"
                      >
                        {category}
                      </Badge>
                    ))}
                  {Array.isArray(repo.topics) &&
                    repo.topics.slice(0, 3).map((topic: string) => (
                      <Badge
                        key={topic}
                        data-variant="outline"
                        className="text-xs bg-orange-500/20 border-orange-500 text-orange-400"
                      >
                        {topic}
                      </Badge>
                    ))}
                  {Array.isArray(repo.topics) && repo.topics.length > 3 && (
                    <Badge
                      data-variant="outline"
                      className="text-xs bg-pink-500/20 border-pink-500 text-pink-400"
                    >
                      +{repo.topics.length - 3} more
                    </Badge>
                  )}
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1 text-yellow-400">
                      <Star className="w-4 h-4" />
                      <span className="font-semibold">
                        {(repo.stargazers_count || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400">Stars</div>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1 text-blue-400">
                      <GitFork className="w-4 h-4" />
                      <span className="font-semibold">
                        {(repo.forks_count || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400">Forks</div>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1 text-green-400">
                      <Eye className="w-4 h-4" />
                      <span className="font-semibold">
                        {(repo.watchers_count || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400">Watchers</div>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1 text-purple-400">
                      <TrendingUp className="w-4 h-4" />
                      <span className="font-semibold">{Math.round(repo.trending_score || 0)}</span>
                    </div>
                    <div className="text-xs text-gray-400">Trending</div>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-4 text-gray-400">
                    {repo.language && (
                      <span className="flex items-center space-x-1">
                        <Code className="w-4 h-4" />
                        <span>{repo.language}</span>
                      </span>
                    )}
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Created{' '}
                        {repo.created_at ? new Date(repo.created_at).getFullYear() : 'Unknown'}
                      </span>
                    </span>
                    {repo.health_score && (
                      <span
                        className={`flex items-center space-x-1 ${
                          repo.health_score > 80
                            ? 'text-green-400'
                            : repo.health_score > 60
                              ? 'text-yellow-400'
                              : 'text-red-400'
                        }`}
                      >
                        <span>Health: {repo.health_score}%</span>
                      </span>
                    )}
                  </div>

                  <Badge
                    variant="outline"
                    className="text-xs bg-blue-500/20 border-blue-500 text-blue-400"
                  >
                    {repo.license?.name || 'No License'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredAndSortedRepos.length === 0 && !loading && (
        <div className="text-center py-12">
          <Github className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-400 mb-2">No repositories found</h3>
          <p className="text-gray-500">Try adjusting your search terms or filters</p>
        </div>
      )}

      {/* Load More (if needed) */}
      {filteredAndSortedRepos.length > 0 && (
        <div className="text-center py-6">
          <p className="text-gray-400 text-sm">
            Showing {filteredAndSortedRepos.length} of {repositories.length} repositories
          </p>
        </div>
      )}
    </div>
  );
}
