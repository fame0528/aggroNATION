/**
 * RSS Feed Page
 * 
 * Dedicated page for RSS feed content with filtering and sorting
 * 
 * @page
 * @created 2026-01-20
 */

import { FilterBar } from "@/components/home/FilterBar";
import { ContentGrid } from "@/components/home/ContentGrid";
import { mockContent } from "@/lib/mockData";

export default function RssPage() {
  // Filter content for RSS sources only
  const rssContent = mockContent.filter(item => item.source.type === 'rss');

  return (
    <div className="flex flex-col w-full">
      {/* Page Header */}
      <section className="w-full px-4 md:px-8 lg:px-12 py-8 border-b border-divider bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl">📰</span>
          <h1 className="text-3xl md:text-4xl font-bold">RSS Feeds</h1>
        </div>
        <p className="text-lg text-default-600 mt-2">
          Curated AI content from RSS feeds and blogs
        </p>
      </section>

      {/* Content Area with Filters */}
      <section className="flex flex-col gap-6 w-full px-4 md:px-8 lg:px-12 py-8">
        <FilterBar />
        <ContentGrid items={rssContent} />
      </section>
    </div>
  );
}
