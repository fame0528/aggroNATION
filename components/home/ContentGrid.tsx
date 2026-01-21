/**
 * Content Grid Component
 * 
 * Responsive grid container for displaying content cards
 * Supports all content types: RSS articles, Reddit posts, YouTube videos, X posts
 * Handles layout and spacing
 * 
 * @module components/home/ContentGrid
 * @created 2026-01-20
 */

import { ContentItem } from "@/types/content";
import { ContentCard } from "./ContentCard";

interface ContentGridProps {
  items: ContentItem[];
}

export const ContentGrid = ({ items }: ContentGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full">
      {items.map((item, index) => (
        <div
          key={item._id || item.id || index}
          className="animate-in fade-in slide-in-from-bottom-4"
          style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'backwards' }}
        >
          <ContentCard 
            item={item}
            allItems={items}
            itemIndex={index}
          />
        </div>
      ))}
    </div>
  );
};
