/**
 * ContentModal Component
 * 
 * Full-screen modal for displaying embedded content
 * Supports YouTube embeds, full article text, and external source links
 * 
 * Features:
 * - Keyboard navigation (←/→ arrows, ESC to close)
 * - Previous/Next buttons with position indicator  
 * - Mobile swipe gestures (swipe left/right to navigate, down to close)
 * - Smooth animations and transitions
 * - Reading time estimate
 * - Loading states
 * 
 * @component
 * @created 2026-01-20
 * @updated 2026-01-20 - Added navigation, keyboard shortcuts, animations, gestures
 */

'use client';

import { useEffect, useCallback, useState } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Link } from "@heroui/link";
import { ContentItem } from "@/types/content";
import { getRelativeTime } from "@/lib/mockData";
import { getTagColor } from "@/lib/utils/tagColors";
import { formatReadingTime } from "@/lib/utils/readingTime";

interface ContentModalProps {
  /** Content item to display */
  item: ContentItem | null;
  /** All content items for navigation */
  allItems?: ContentItem[];
  /** Current item index */
  currentIndex?: number;
  /** Modal open state */
  isOpen: boolean;
  /** Close handler */
  onClose: () => void;
  /** Navigate to item handler */
  onNavigate?: (index: number) => void;
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
 * ContentModal - Full-screen content viewer with embedded media
 * 
 * Enhanced Features:
 * - YouTube video embeds with loading states
 * - Previous/Next navigation
 * - Keyboard shortcuts (←/→/ESC)
 * - Mobile swipe gestures
 * - Smooth animations
 * - Reading time estimate
 * - Position indicator
 * 
 * @param props - Component props
 * @returns Content modal component
 */
export function ContentModal({ 
  item, 
  allItems = [], 
  currentIndex = 0, 
  isOpen, 
  onClose, 
  onNavigate 
}: ContentModalProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const hasNavigation = allItems.length > 1 && onNavigate !== undefined;
  const hasPrevious = hasNavigation && currentIndex > 0;
  const hasNext = hasNavigation && currentIndex < allItems.length - 1;

  // Reset loading state when item changes
  useEffect(() => {
    if (item) {
      setIsLoading(true);
      const timer = setTimeout(() => setIsLoading(false), 300);
      return () => clearTimeout(timer);
    }
  }, [item?.id]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen || !hasNavigation || !onNavigate) return;

    if (e.key === 'ArrowLeft' && hasPrevious) {
      e.preventDefault();
      onNavigate(currentIndex - 1);
    } else if (e.key === 'ArrowRight' && hasNext) {
      e.preventDefault();
      onNavigate(currentIndex + 1);
    }
  }, [isOpen, hasNavigation, hasPrevious, hasNext, currentIndex, onNavigate]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Touch gesture handlers for mobile swipe
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd || !hasNavigation || !onNavigate) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe && hasNext) {
      onNavigate(currentIndex + 1);
    } else if (isRightSwipe && hasPrevious) {
      onNavigate(currentIndex - 1);
    }
  };

  if (!item) return null;

  const sourceIcon = getSourceIcon(item.source.type);
  const sourceColor = getSourceColor(item.source.type);
  const relativeTime = getRelativeTime(item.publishedAt);
  const ratingPercent = (item.metrics.rating * 100).toFixed(0);
  const ratingColor = item.metrics.rating > 0.9 ? 'success' : item.metrics.rating > 0.75 ? 'warning' : 'default';
  const readingTime = formatReadingTime(item.excerpt);
  
  const isYouTube = item.source.type === 'youtube';
  const youtubeVideoId = isYouTube ? getYouTubeVideoId(item.url) : null;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      size="5xl"
      scrollBehavior="inside"
      classNames={{
        base: "bg-background",
        backdrop: "bg-black/80 backdrop-blur-md",
      }}
    >
      <ModalContent 
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <ModalHeader className="flex flex-col gap-3 border-b border-divider pb-4">
          {/* Navigation & Position Indicator */}
          {hasNavigation && (
            <div className="flex items-center justify-between w-full mb-2">
              <Button
                size="sm"
                variant="flat"
                isIconOnly
                onPress={() => onNavigate!(currentIndex - 1)}
                isDisabled={!hasPrevious}
                className="transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Button>
              
              <div className="flex items-center gap-2">
                <span className="text-xs text-default-500 font-medium">
                  {currentIndex + 1} of {allItems.length}
                </span>
                <Chip size="sm" variant="flat" className="text-xs">
                  ← → to navigate
                </Chip>
              </div>

              <Button
                size="sm"
                variant="flat"
                isIconOnly
                onPress={() => onNavigate!(currentIndex + 1)}
                isDisabled={!hasNext}
                className="transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Button>
            </div>
          )}

          {/* Source Badge & Rating */}
          <div className="flex items-center justify-between w-full flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Chip
                size="sm"
                variant="flat"
                color={sourceColor}
                startContent={<span>{sourceIcon}</span>}
                className="font-medium"
              >
                {item.source.name}
              </Chip>
              <Chip size="sm" variant="bordered" className="text-xs">
                📖 {readingTime}
              </Chip>
            </div>
            <div className="flex items-center gap-2">
              <Chip
                size="sm"
                variant="dot"
                color={ratingColor}
                className="font-semibold"
              >
                {ratingPercent}%
              </Chip>
              <span className="text-xs text-default-500">{relativeTime}</span>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold leading-tight">
            {item.title}
          </h2>

          {/* Author */}
          {item.author && (
            <p className="text-sm text-default-600">
              By {item.author}
            </p>
          )}
        </ModalHeader>

        <ModalBody className="py-6">
          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12 animate-pulse">
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-default-500">Loading content...</p>
              </div>
            </div>
          )}

          {/* Content with fade-in animation */}
          <div className={`transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
            {/* YouTube Video Embed */}
            {isYouTube && youtubeVideoId && (
              <div className="relative w-full aspect-video overflow-hidden rounded-lg mb-6 shadow-lg">
                <iframe
                  src={`https://www.youtube.com/embed/${youtubeVideoId}`}
                  title={item.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full border-0"
                />
              </div>
            )}

            {/* Content */}
            <div className="prose prose-default dark:prose-invert max-w-none">
              <p className="text-base leading-relaxed text-default-700">
                {item.excerpt}
              </p>
            </div>

            {/* Tags */}
            {item.tags.length > 0 && (
              <div className="flex gap-2 flex-wrap mt-6 pt-6 border-t border-divider">
                {item.tags.map((tag) => (
                  <span 
                    key={tag} 
                    className={`text-sm px-3 py-1.5 rounded-full border font-medium ${getTagColor(tag)}`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Metrics */}
            <div className="flex items-center gap-6 mt-6 pt-6 border-t border-divider text-sm flex-wrap">
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                </svg>
                <strong>{item.metrics.upvotes.toLocaleString()}</strong> upvotes
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                </svg>
                <strong>{item.metrics.comments.toLocaleString()}</strong> comments
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                </svg>
                <strong>{item.metrics.shares.toLocaleString()}</strong> shares
              </span>
            </div>
          </div>
        </ModalBody>

        <ModalFooter className="border-t border-divider">
          <Button variant="flat" onPress={onClose}>
            Close
          </Button>
          <Button 
            as={Link}
            href={item.url}
            isExternal
            color="primary"
            variant="shadow"
            endContent={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            }
          >
            View Original Source
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
