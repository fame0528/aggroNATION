/**
 * YouTube Page
 * 
 * Dedicated page for YouTube video content with filtering and sorting
 * 
 * @page
 * @created 2026-01-20
 * @updated 2026-01-20 - Fetch from database instead of mock data
 */

import { FilterBar } from "@/components/home/FilterBar";
import { ContentGrid } from "@/components/home/ContentGrid";

/**
 * Fetch YouTube content from API
 */
async function fetchYouTubeContent(limit: number = 20) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const url = `${baseUrl}/api/content?sourceType=youtube&limit=${limit}`;
    
    const response = await fetch(url, {
      cache: 'no-store',
      // next: { revalidate: 60 }, // Revalidate every 60 seconds
    });

    if (!response.ok) {
      console.error('Failed to fetch YouTube content:', response.status);
      return [];
    }

    const data = await response.json();
    return data.content || [];
  } catch (error) {
    console.error('Error fetching YouTube content:', error);
    return [];
  }
}

export default async function YouTubePage() {
  const youtubeContent = await fetchYouTubeContent(20);

  return (
    <div className="flex flex-col w-full">
      {/* Page Header */}
      <section className="w-full px-4 md:px-8 lg:px-12 py-8 border-b border-divider bg-gradient-to-r from-danger/10 to-primary/10">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl">▶️</span>
          <h1 className="text-3xl md:text-4xl font-bold">YouTube Videos</h1>
        </div>
        <p className="text-lg text-default-600 mt-2">
          In-depth AI video tutorials, reviews, and explanations
        </p>
      </section>

      {/* Content Area with Filters */}
      <section className="flex flex-col gap-6 w-full px-4 md:px-8 lg:px-12 py-8">
        <FilterBar />
        <ContentGrid items={youtubeContent} />
      </section>
    </div>
  );
}
