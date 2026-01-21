/**
 * X (Twitter) Page
 * 
 * Dedicated page for X/Twitter content with filtering and sorting
 * 
 * @page
 * @created 2026-01-20
 */

import { FilterBar } from "@/components/home/FilterBar";
import { ContentGrid } from "@/components/home/ContentGrid";
import { mockContent } from "@/lib/mockData";

export default function XPage() {
  // Filter content for X sources only
  const xContent = mockContent.filter(item => item.source.type === 'x');

  return (
    <div className="flex flex-col w-full">
      {/* Page Header */}
      <section className="w-full px-4 md:px-8 lg:px-12 py-8 border-b border-divider bg-gradient-to-r from-default/10 to-primary/10">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl">✕</span>
          <h1 className="text-3xl md:text-4xl font-bold">X Posts</h1>
        </div>
        <p className="text-lg text-default-600 mt-2">
          Latest AI announcements and updates from X (Twitter)
        </p>
      </section>

      {/* Content Area with Filters */}
      <section className="flex flex-col gap-6 w-full px-4 md:px-8 lg:px-12 py-8">
        <FilterBar />
        <ContentGrid items={xContent} />
      </section>
    </div>
  );
}
