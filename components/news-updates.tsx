// === news-updates.tsx ===
// Created: 2025-07-16
// Purpose: ECHO-compliant component for displaying AI news updates with diagnostics, type safety, and robust error handling
// Key Exports:
//   - NewsUpdates
// Interactions:
//   - Used by: Dashboard overview, news pages
// Notes:
//   - Expects news data from DataContext; validates and guards all props

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Newspaper, ExternalLink, Clock, TrendingUp } from 'lucide-react';
import { useDataContext } from '@/contexts/data-context';
import { formatCompactDate } from '@/lib/utils/date-format';
import type { RSSArticle } from '@/lib/types/rss';

/**
 * Type guard for RSSArticle
 */
function isRSSArticle(obj: any): obj is RSSArticle {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.title === 'string' &&
    typeof obj.source === 'string' &&
    typeof obj.summary === 'string' &&
    typeof obj.publishedAt !== 'undefined'
  );
}

/**
 * NewsUpdates component displays a list of AI news articles with robust diagnostics and error handling.
 * @returns {React.ReactElement}
 * @example
 * <NewsUpdates />
 */
export function NewsUpdates(): React.ReactElement {
  const { news, loading, error } = useDataContext();
  // Defensive: Only use valid articles, limit to 24
  const validNews: RSSArticle[] = Array.isArray(news) ? news.filter(isRSSArticle).slice(0, 24) : [];

  // Diagnostics
  if (!Array.isArray(news)) {
    // eslint-disable-next-line no-console
    console.warn('NewsUpdates: news is not an array', news);
  }
  if (news && Array.isArray(news) && news.length > 0 && validNews.length === 0) {
    // eslint-disable-next-line no-console
    console.warn('NewsUpdates: All news items failed type guard', news);
  }

  return (
    <Card className="bg-gray-800 border-gray-700 h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="flex items-center space-x-2 text-white">
          <Newspaper className="w-5 h-5 text-orange-400" />
          <span>📰 AI News Updates</span>
          <Badge
            variant="secondary"
            className="bg-orange-500/20 text-orange-400 border-orange-500/30"
          >
            Fresh
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <div className="space-y-3 h-full overflow-y-auto pr-2">
          {loading.news && <div className="text-gray-400">Loading news...</div>}
          {error.news && <div className="text-red-400">Failed to load news.</div>}
          {validNews.length === 0 && !loading.news && !error.news && (
            <div className="text-gray-400">No news found. (Check API and data mapping.)</div>
          )}
          {validNews.map((article) => (
            <div
              key={String(article._id ?? article.hash)}
              className="p-3 bg-gray-750 rounded-lg border border-gray-600 hover:border-orange-500/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-semibold text-white text-sm line-clamp-2">
                      {article.title}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-400">{article.source}</p>
                </div>
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white shrink-0"
                >
                  <a href={article.sourceUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>
              </div>

              <p className="text-gray-300 text-sm mb-2 line-clamp-2">{article.summary}</p>

              <div className="flex flex-wrap gap-2 mb-2">
                {article.author && (
                  <Badge variant="outline" className="text-xs border-blue-500 text-blue-400">
                    {article.author}
                  </Badge>
                )}
                {article.category && (
                  <Badge variant="outline" className="text-xs border-green-500 text-green-400">
                    {article.category}
                  </Badge>
                )}
                {Array.isArray(article.tags) &&
                  article.tags.slice(0, 2).map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="text-xs border-purple-500 text-purple-400"
                    >
                      {tag}
                    </Badge>
                  ))}
              </div>

              <div className="flex items-center justify-between text-sm text-gray-400">
                <div className="flex items-center space-x-4">
                  <span className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{formatCompactDate(article.publishedAt)}</span>
                  </span>
                  {article.readTime && <span className="text-xs">📖 {article.readTime}</span>}
                </div>
                <div className="flex items-center space-x-2">
                  {article.isBreaking && (
                    <Badge variant="destructive" className="text-xs animate-pulse">
                      BREAKING
                    </Badge>
                  )}
                  <TrendingUp className="w-4 h-4 text-orange-400" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * OVERVIEW
 *
 * This component displays a list of AI news articles, using robust type guards and diagnostics to ensure only valid data is rendered.
 * It handles loading, error, and empty states gracefully, and is fully ECHO-compliant with extensive documentation and modularity.
 *
 * Edge Cases:
 * - If news is not an array, a warning is logged and no articles are shown.
 * - If all news items fail the type guard, a warning is logged and the empty state is shown.
 * - If loading or error, appropriate messages are displayed.
 *
 * Usage Example:
 * <NewsUpdates />
 *
 * Future Improvements:
 * - Add pagination or infinite scroll for large news sets.
 * - Allow filtering by category or source.
 */

/*
 * === news-updates.tsx ===
 * Updated: 2025-07-16
 * Summary: ECHO-compliant AI news updates component with diagnostics, type safety, and robust error handling.
 * Key Components:
 *   - NewsUpdates: Main news display component
 * Dependencies:
 *   - Requires: DataContext, Card, Badge, Button, Lucide icons, date-format utils
 * Version History:
 *   v1.0 - Initial release
 *   v1.1 - ECHO-compliant refactor, diagnostics, type guards, usage example
 * Notes:
 *   - Always validate and guard dynamic data before rendering
 */
