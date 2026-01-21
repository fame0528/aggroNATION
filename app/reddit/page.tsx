/**
 * Reddit Page
 * 
 * Dedicated page for Reddit content with filtering and sorting
 * 
 * @page
 * @created 2026-01-20
 */

import { FilterBar } from "@/components/home/FilterBar";
import { ContentGrid } from "@/components/home/ContentGrid";
import { mockContent } from "@/lib/mockData";

export default function RedditPage() {
  // Filter content for Reddit sources only
  const redditContent = mockContent.filter(item => item.source.type === 'reddit');

  return (
    <div className="flex flex-col w-full">
      {/* Page Header */}
      <section className="w-full px-4 md:px-8 lg:px-12 py-8 border-b border-divider bg-gradient-to-r from-danger/10 to-warning/10">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl">🔴</span>
          <h1 className="text-3xl md:text-4xl font-bold">Reddit Posts</h1>
        </div>
        <p className="text-lg text-default-600 mt-2">
          Top AI discussions and insights from Reddit communities
        </p>
      </section>

      {/* Content Area with Filters */}
      <section className="flex flex-col gap-6 w-full px-4 md:px-8 lg:px-12 py-8">
        <FilterBar />
        <ContentGrid items={redditContent} />
      </section>
    </div>
  );
}
