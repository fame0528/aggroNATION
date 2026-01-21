/**
 * Article Card Component
 * 
 * Displays individual article with metadata, source, and engagement metrics
 * Optimized for scanning and quick access
 * 
 * @module components/home/ArticleCard
 * @created 2026-01-20
 */

'use client';

import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Link } from "@heroui/link";
import { Article } from "@/types/article";
import { getRelativeTime } from "@/lib/mockData";

interface ArticleCardProps {
  article: Article;
}

/**
 * Get color for source type badge
 */
const getSourceColor = (type: string): "primary" | "secondary" | "success" | "warning" | "danger" => {
  switch (type) {
    case 'rss': return 'primary';
    case 'reddit': return 'danger';
    case 'youtube': return 'secondary';
    case 'x': return 'default' as any;
    default: return 'default' as any;
  }
};

/**
 * Get icon for source type
 */
const getSourceIcon = (type: string): string => {
  switch (type) {
    case 'rss': return '📰';
    case 'reddit': return '🔴';
    case 'youtube': return '▶️';
    case 'x': return '❌';
    default: return '🌐';
  }
};

export const ArticleCard = ({ article }: ArticleCardProps) => {
  const relativeTime = getRelativeTime(article.publishedAt);
  const ratingPercent = Math.round(article.metrics.rating * 100);

  return (
    <Card 
      className="w-full hover:scale-[1.02] transition-transform duration-200 cursor-pointer"
      isPressable
      as={Link}
      href={article.url}
      isExternal
    >
      <CardHeader className="flex flex-col items-start gap-2 pb-0">
        {/* Source and Metadata */}
        <div className="flex w-full justify-between items-start">
          <div className="flex gap-2 items-center">
            <Chip 
              size="sm" 
              variant="flat" 
              color={getSourceColor(article.source.type)}
              startContent={<span>{getSourceIcon(article.source.type)}</span>}
            >
              {article.source.name}
            </Chip>
            <span className="text-xs text-default-500">{relativeTime}</span>
          </div>
          
          {/* Rating Badge */}
          <Chip 
            size="sm" 
            variant="dot" 
            color={ratingPercent > 90 ? 'success' : ratingPercent > 75 ? 'warning' : 'default'}
          >
            {ratingPercent}%
          </Chip>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-foreground leading-tight line-clamp-2">
          {article.title}
        </h3>
      </CardHeader>

      <CardBody className="pt-2">
        {/* Excerpt */}
        <p className="text-sm text-default-600 line-clamp-3">
          {article.excerpt}
        </p>

        {/* Tags */}
        <div className="flex gap-1 flex-wrap mt-3">
          {article.tags.slice(0, 4).map((tag) => (
            <Chip key={tag} size="sm" variant="flat" className="text-xs">
              {tag}
            </Chip>
          ))}
        </div>
      </CardBody>

      <CardFooter className="pt-0">
        {/* Engagement Metrics */}
        <div className="flex gap-4 text-xs text-default-500 w-full">
          <span>⬆️ {article.metrics.upvotes.toLocaleString()}</span>
          <span>💬 {article.metrics.comments.toLocaleString()}</span>
          <span>🔗 {article.metrics.shares.toLocaleString()}</span>
        </div>
      </CardFooter>
    </Card>
  );
};
