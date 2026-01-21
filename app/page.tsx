/**
 * Homepage - AI Content Aggregator Dashboard
 * 
 * Main landing page displaying curated AI content from multiple sources
 * Dashboard layout with preview sections for each content type
 * 
 * @page
 * @created 2026-01-20
 * @updated 2026-01-20 - Converted to fetch from database instead of mock data
 */

import { HeroSection } from "@/components/home/HeroSection";
import { DashboardSection } from "@/components/home/DashboardSection";
import { SourceType } from "@/types/content";

/**
 * Fetch content from API
 * Server-side data fetching with Next.js 15
 */
async function fetchContentByType(sourceType: SourceType, limit: number = 3) {
  try {
    // Construct API URL - use localhost for server-side calls
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const url = `${baseUrl}/api/content?sourceType=${sourceType}&limit=${limit}`;
    
    const response = await fetch(url, {
      // Disable caching for development, add revalidation for production
      cache: 'no-store',
      // next: { revalidate: 60 }, // Revalidate every 60 seconds in production
    });

    if (!response.ok) {
      console.error(`Failed to fetch ${sourceType} content:`, response.status);
      return [];
    }

    const data = await response.json();
    return data.content || [];
  } catch (error) {
    console.error(`Error fetching ${sourceType} content:`, error);
    return [];
  }
}

export default async function Home() {
  // Fetch top items for each content type in parallel
  const [topYoutubeItems, topRssItems, topRedditItems, topXItems] = await Promise.all([
    fetchContentByType('youtube', 8),
    fetchContentByType('rss', 8),
    fetchContentByType('reddit', 8),
    fetchContentByType('x', 8),
  ]);

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <HeroSection />

      {/* Dashboard Sections - YouTube first, then others */}
      <DashboardSection
        title="YouTube Videos"
        slug="youtube"
        items={topYoutubeItems}
        icon="▶️"
      />

      <DashboardSection
        title="RSS Feeds"
        slug="rss"
        items={topRssItems}
        icon="📰"
      />

      <DashboardSection
        title="Reddit Posts"
        slug="reddit"
        items={topRedditItems}
        icon="🔴"
      />

      <DashboardSection
        title="X Posts"
        slug="x"
        items={topXItems}
        icon="✕"
      />
    </div>
  );
}

