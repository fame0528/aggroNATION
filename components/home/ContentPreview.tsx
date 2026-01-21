/**
 * ContentPreview Component
 * 
 * Premium preview card with enhanced visual design
 * Features polished layout, hover effects, and visual hierarchy
 * Opens content in modal instead of external redirect
 * 
 * @component
 * @created 2026-01-20
 * @updated 2026-01-20 - Enhanced to AAA quality with premium design
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

interface ContentPreviewProps {
  /** Content item to display */
  item: ContentItem;
  /** All items for modal navigation */
  allItems?: ContentItem[];
  /** Index in all items array */
  itemIndex?: number;
}

/**
 * Get icon for source type
 */
function getSourceIcon(type: string): string {
  switch (type) {
    case 'rss': return '📰';
    case 'reddit': return '🔴';
    case 'youtube': return '▶️';
    case 'x': return '✕';
    default: return '📄';
  }
}

/**
 * Get color for source type
 */
function getSourceColor(type: string): "default" | "primary" | "secondary" | "success" | "warning" | "danger" {
  switch (type) {
    case 'rss': return 'primary';
    case 'reddit': return 'danger';
    case 'youtube': return 'secondary';
    case 'x': return 'default';
    default: return 'default';
  }
}

/**
 * Extract YouTube video ID from URL
 * Supports various YouTube URL formats
 */
function getYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
}

/**
 * ContentPreview - Premium preview card with enhanced design
 * 
 * Features:
 * - Polished card design with hover effects
 * - Visual hierarchy with proper spacing
 * - Enhanced metrics display with icons
 * - Smooth hover animation and shadow
 * - Professional typography
 * - Opens content in modal viewer with navigation
 * 
 * @param props - Component props
 * @returns Premium content preview card
 */
export function ContentPreview({ item, allItems, itemIndex }: ContentPreviewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentModalIndex, setCurrentModalIndex] = useState(itemIndex || 0);
  
  const sourceIcon = getSourceIcon(item.source.type);
  const sourceColor = getSourceColor(item.source.type);
  const relativeTime = getRelativeTime(item.publishedAt);
  const ratingPercent = (item.metrics.rating * 100).toFixed(0);
  const ratingColor = item.metrics.rating > 0.9 ? 'success' : item.metrics.rating > 0.75 ? 'warning' : 'default';
  
  // Get YouTube video ID if this is a YouTube item
  const isYouTube = item.source.type === 'youtube';
  const youtubeVideoId = isYouTube ? getYouTubeVideoId(item.url) : null;

  const handleNavigate = (index: number) => {
    setCurrentModalIndex(index);
  };

  const displayItems = allItems || [item];
  const displayIndex = allItems ? currentModalIndex : 0;
  const displayItem = displayItems[displayIndex] || item;

  return (
    <>
      <Card
        isPressable
        onPress={() => {
          setCurrentModalIndex(itemIndex || 0);
          setIsModalOpen(true);
        }}
        className="group hover:scale-[1.02] hover:shadow-xl transition-all duration-300 bg-background/80 backdrop-blur-sm border border-divider/50 hover:border-primary/50"
      >
      {/* YouTube Video Embed - Only for YouTube content */}
      {isYouTube && youtubeVideoId && (
        <div className="relative w-full aspect-video overflow-hidden rounded-t-lg">
          <iframe
            src={`https://www.youtube.com/embed/${youtubeVideoId}`}
            title={item.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full border-0"
          />
        </div>
      )}

      <CardHeader className="flex flex-col items-start gap-3 pb-3">
        {/* Source Badge & Rating */}
        <div className="flex items-center justify-between w-full">
          <Chip
            size="sm"
            variant="flat"
            color={sourceColor}
            startContent={<span>{sourceIcon}</span>}
            className="font-medium"
          >
            {item.source.name}
          </Chip>
          <Chip
            size="sm"
            variant="dot"
            color={ratingColor}
            className="font-semibold"
          >
            {ratingPercent}%
          </Chip>
        </div>

        {/* Title - Enhanced typography */}
        <h3 className="text-base font-bold line-clamp-2 leading-snug group-hover:text-primary transition-colors">
          {item.title}
        </h3>
      </CardHeader>

      <CardBody className="py-0">
        {/* Excerpt - Improved readability */}
        <p className="text-sm text-default-600 line-clamp-3 leading-relaxed">
          {item.excerpt}
        </p>
      </CardBody>

      <CardFooter className="pt-4 flex flex-col gap-3">
        {/* Metrics Row */}
        <div className="flex items-center justify-between w-full text-xs text-default-600">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 font-medium">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
              </svg>
              {item.metrics.upvotes.toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
              </svg>
              {item.metrics.comments}
            </span>
          </div>
          <span className="flex items-center gap-1 text-default-500">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {relativeTime}
          </span>
        </div>

        {/* Tags - Top 2 with dynamic colors */}
        {item.tags.length > 0 && (
          <div className="flex gap-1.5 flex-wrap">
            {item.tags.slice(0, 2).map((tag) => (
              <span 
                key={tag} 
                className={`text-xs px-2 py-0.5 rounded-full border font-medium ${getTagColor(tag)}`}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
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
}
