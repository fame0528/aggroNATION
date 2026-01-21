/**
 * DashboardSection Component
 * 
 * Premium section component with enhanced visual design
 * Features polished header, stats, and content preview grid
 * 
 * @component
 * @created 2026-01-20
 * @updated 2026-01-20 - Enhanced to AAA quality with premium design
 */

import { Link } from "@heroui/link";
import { Button } from "@heroui/button";
import { Card } from "@heroui/card";
import { ContentItem } from "@/types/content";
import { ContentPreview } from "./ContentPreview";

interface DashboardSectionProps {
  /** Section title */
  title: string;
  /** URL slug for the content type page */
  slug: string;
  /** Content items to preview (limited to top 4-5) */
  items: ContentItem[];
  /** Icon component for the section header */
  icon?: React.ReactNode;
}

/**
 * Get gradient classes for section based on slug
 */
function getSectionGradient(slug: string): string {
  switch (slug) {
    case 'rss': return 'from-primary/10 to-primary/5';
    case 'reddit': return 'from-danger/10 to-danger/5';
    case 'youtube': return 'from-secondary/10 to-secondary/5';
    case 'x': return 'from-default/10 to-default/5';
    default: return 'from-primary/10 to-primary/5';
  }
}

/**
 * DashboardSection - Premium dashboard section with enhanced design
 * 
 * Features:
 * - Gradient background with section theming
 * - Enhanced header with stats and action button
 * - Professional grid layout with hover effects
 * - Empty state handling
 * - Responsive design (1-4 columns)
 * 
 * @param props - Component props
 * @returns Premium dashboard section
 */
export function DashboardSection({ title, slug, items, icon }: DashboardSectionProps) {
  const gradientClass = getSectionGradient(slug);
  const totalUpvotes = items.reduce((sum, item) => sum + item.metrics.upvotes, 0);
  const avgRating = items.length > 0 
    ? (items.reduce((sum, item) => sum + item.metrics.rating, 0) / items.length * 100).toFixed(0)
    : 0;

  return (
    <section className={`relative w-full px-4 md:px-8 lg:px-12 py-10 bg-gradient-to-br ${gradientClass}`}>
      {/* Decorative element */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-3xl" />
      
      <div className="relative">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            {icon && (
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-background/50 backdrop-blur-sm border border-divider text-2xl">
                {icon}
              </div>
            )}
            <div>
              <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
              <div className="flex items-center gap-4 mt-1 text-sm text-default-600">
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                  </svg>
                  {items.length} items
                </span>
                {items.length > 0 && (
                  <>
                    <span className="flex items-center gap-1">
                      ⭐ {avgRating}% avg
                    </span>
                    <span className="flex items-center gap-1">
                      ⬆️ {totalUpvotes.toLocaleString()}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          <Button
            as={Link}
            href={`/${slug}`}
            variant="shadow"
            color="primary"
            size="lg"
            endContent={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            }
          >
            View All
          </Button>
        </div>

        {/* Content Preview Grid - Responsive 1-4 columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {items.map((item, index) => (
            <div 
              key={item._id || item.id || index}
              className="animate-in fade-in slide-in-from-bottom-4"
              style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'backwards' }}
            >
              <ContentPreview 
                item={item} 
                allItems={items}
                itemIndex={index}
              />
            </div>
          ))}
        </div>

        {/* Enhanced Empty State */}
        {items.length === 0 && (
          <Card className="py-16 bg-background/50 backdrop-blur-sm">
            <div className="text-center">
              <div className="text-6xl mb-4 opacity-50">{icon}</div>
              <p className="text-lg font-medium text-default-700 mb-2">No content available yet</p>
              <p className="text-sm text-default-500">Check back soon for updates</p>
            </div>
          </Card>
        )}
      </div>
    </section>
  );
}
