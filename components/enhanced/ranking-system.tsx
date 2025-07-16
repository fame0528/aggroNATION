'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, TrendingUp, Award, Users, MessageCircle } from 'lucide-react';
import { useUserContext } from '@/contexts/user-context';

/**
 * Props for RankingSystem component.
 */
export interface RankingItem {
  id: string;
  name?: string;
  full_name?: string;
  title?: string;
  description?: string;
  summary?: string;
  stargazers_count?: number;
  downloads?: number;
  citations?: number;
  social_mentions?: number;
  updated_at?: string;
  last_modified?: string;
  published?: string;
  publishedAt?: string;
  forks_count?: number;
  likes?: number;
  watchers_count?: number;
}

interface RankingSystemProps {
  type: 'repos' | 'models' | 'news';
  items: RankingItem[];
  title: string;
}

/**
 * Renders a ranking system for repos, models, or news.
 */
import type { ReactElement } from 'react';

export function RankingSystem({ type, items, title }: RankingSystemProps): ReactElement {
  const [sortBy, setSortBy] = useState<'rating' | 'popularity' | 'recent' | 'community'>('rating');
  const userContext = useUserContext();

  // Safe access to user context with fallbacks
  const ratings: Record<string, number> = userContext?.ratings || {};
  const rateItem: (id: string, rating: number) => void = userContext?.rateItem || (() => {});

  function calculateScore(item: RankingItem): number {
    if (!item) return 0;
    const userRating = ratings[item.id] || 0;
    const popularity =
      item.stargazers_count || item.downloads || item.citations || item.social_mentions || 0;
    const recencySource =
      item.updated_at || item.last_modified || item.published || item.publishedAt;
    const recency = recencySource ? new Date(recencySource).getTime() : 0;
    const communityScore = (item.forks_count || item.likes || 0) + (item.watchers_count || 0);
    switch (sortBy) {
      case 'rating':
        return userRating * 1000 + popularity * 0.1;
      case 'popularity':
        return popularity;
      case 'recent':
        return recency;
      case 'community':
        return communityScore;
      default:
        return userRating * 1000 + popularity * 0.1;
    }
  }

  const sortedItems: RankingItem[] = Array.isArray(items)
    ? [...items]
        .filter((item) => item && item.id)
        .sort((a, b) => calculateScore(b) - calculateScore(a))
        .slice(0, 20)
    : [];

  function getRankIcon(index: number): string {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `#${index + 1}`;
  }

  function getRankColor(index: number): string {
    if (index === 0) return 'text-yellow-400';
    if (index === 1) return 'text-gray-300';
    if (index === 2) return 'text-orange-400';
    return 'text-gray-400';
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2 text-white">
            <Award className="w-5 h-5 text-yellow-400" />
            <span>🏆 {title} Rankings</span>
            <Badge
              variant="secondary"
              className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
            >
              Community Driven
            </Badge>
          </CardTitle>

          <div className="flex items-center space-x-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-gray-700 border border-gray-600 rounded px-3 py-1 text-sm text-white"
            >
              <option value="rating">User Rating</option>
              <option value="popularity">Popularity</option>
              <option value="recent">Most Recent</option>
              <option value="community">Community Score</option>
            </select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {sortedItems.map((item, index) => (
          <div
            key={item.id}
            className={`p-4 rounded-lg border transition-all duration-200 ${
              index < 3
                ? 'border-yellow-500/50 bg-yellow-500/5'
                : 'border-gray-600 hover:border-gray-500'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <div className={`text-lg font-bold ${getRankColor(index)} min-w-[3rem]`}>
                  {getRankIcon(index)}
                </div>

                <div className="flex-1">
                  <h3 className="font-semibold text-white mb-1">
                    {item.name || item.full_name || item.title || 'Unknown Item'}
                  </h3>
                  <p className="text-sm text-gray-400 mb-2 line-clamp-2">
                    {item.description || item.summary || 'No description available'}
                  </p>

                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    {item.stargazers_count && (
                      <span className="flex items-center space-x-1">
                        <Star className="w-3 h-3" />
                        <span>{item.stargazers_count.toLocaleString()}</span>
                      </span>
                    )}
                    {item.downloads && (
                      <span className="flex items-center space-x-1">
                        <TrendingUp className="w-3 h-3" />
                        <span>{item.downloads.toLocaleString()}</span>
                      </span>
                    )}
                    {item.citations && (
                      <span className="flex items-center space-x-1">
                        <MessageCircle className="w-3 h-3" />
                        <span>{item.citations.toLocaleString()}</span>
                      </span>
                    )}
                    {item.social_mentions && (
                      <span className="flex items-center space-x-1">
                        <Users className="w-3 h-3" />
                        <span>{item.social_mentions.toLocaleString()}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 ml-4">
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => rateItem(item.id, star)}
                      className={`${
                        star <= (ratings[item.id] || 0) ? 'text-yellow-400' : 'text-gray-600'
                      } hover:text-yellow-300 transition-colors`}
                    >
                      <Star className="w-3 h-3 fill-current" />
                    </button>
                  ))}
                </div>
                <span className="text-sm text-gray-400">
                  ({(ratings[item.id] || 0).toFixed(1)})
                </span>
              </div>
            </div>

            {index < 3 && (
              <div className="mt-3 pt-3 border-t border-gray-700">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-yellow-400 font-medium">
                    {index === 0
                      ? '🏆 Top Ranked'
                      : index === 1
                        ? '🥈 Runner Up'
                        : '🥉 Third Place'}
                  </span>
                  <span className="text-gray-400">
                    Score: {calculateScore(item).toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}

        {sortedItems.length === 0 && (
          <div className="text-center py-8">
            <Award className="w-8 h-8 text-gray-600 mx-auto mb-2" />
            <p className="text-gray-400">No items available for ranking</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
