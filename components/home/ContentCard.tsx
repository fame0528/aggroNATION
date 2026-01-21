/**
 * Content Card Component
 * 
 * Displays individual content item (from any source) with metadata and engagement metrics
 * Supports RSS articles, Reddit posts, YouTube videos, X posts
 * Opens content in modal viewer instead of external redirect
 * 
 * @module components/home/ContentCard
 * @created 2026-01-20
 * @updated 2026-01-20 - Changed to modal view instead of external links
 */

'use client';

import { useState } from "react";
import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { ContentItem } from "@/types/content";
import { getRelativeTime } from "@/lib/mockData";
import { getTagColor } from "@/lib/utils/tagColors";
import { ContentModal } from "./ContentModal";

interface ContentCardProps {
  item: ContentItem;
  /** All items for modal navigation */
  allItems?: ContentItem[];
  /** Index in all items array */
  itemIndex?: number;
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

export const ContentCard = ({ item, allItems, itemIndex }: ContentCardProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentModalIndex, setCurrentModalIndex] = useState(itemIndex || 0);
  
  const relativeTime = getRelativeTime(item.publishedAt);
  const ratingPercent = Math.round(item.metrics.rating * 100);

  const handleNavigate = (index: number) => {
    setCurrentModalIndex(index);
  };

  const displayItems = allItems || [item];
  const displayIndex = allItems ? currentModalIndex : 0;
  const displayItem = displayItems[displayIndex] || item;

  return (
    <>
      <Card 
        className="w-full hover:scale-[1.02] hover:shadow-xl transition-all duration-300 cursor-pointer border border-divider/50 hover:border-primary/50 bg-background/80 backdrop-blur-sm"
        isPressable
        onPress={() => {
          setCurrentModalIndex(itemIndex || 0);
          setIsModalOpen(true);
        }}
      >
      <CardHeader className="flex flex-col items-start gap-2 pb-0">
        {/* Source and Metadata */}
        <div className="flex w-full justify-between items-start">
          <div className="flex gap-2 items-center">
            <Chip 
              size="sm" 
              variant="flat" 
              color={getSourceColor(item.source.type)}
              startContent={<span>{getSourceIcon(item.source.type)}</span>}
            >
              {item.source.name}
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
          {item.title}
        </h3>
      </CardHeader>

      {/* YouTube Video Embed */}
      {item.source.type === 'youtube' && item.url && (
        <div className="w-full aspect-video px-3 pb-3">
          <iframe
            src={item.url}
            className="w-full h-full rounded-lg"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}

      <CardBody className="pt-2">
        {/* Excerpt/Description */}
        <p className="text-sm text-default-600 line-clamp-3">
          {item.excerpt}
        </p>

        {/* Tags with dynamic colors */}
        <div className="flex gap-1 flex-wrap mt-3">
          {item.tags.slice(0, 4).map((tag) => (
            <span 
              key={tag} 
              className={`text-xs px-2 py-1 rounded-full border font-medium ${getTagColor(tag)}`}
            >
              {tag}
            </span>
          ))}
        </div>
      </CardBody>

      <CardFooter className="pt-0">
        {/* Engagement Metrics */}
        <div className="flex gap-4 text-xs text-default-500 w-full">
          <span>⬆️ {item.metrics.upvotes.toLocaleString()}</span>
          <span>💬 {item.metrics.comments.toLocaleString()}</span>
          <span>🔗 {item.metrics.shares.toLocaleString()}</span>
        </div>
      </CardFooter>
    </Card>

    {/* Content Modal */}
    <ContentModal 
      item={displayItem}
      allItems={displayItems}
      currentIndex={displayIndex}
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      onNavigate={handleNavigate}
    />
  </>
  );
};
