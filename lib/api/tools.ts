'use client';

export interface AITool {
  id: string;
  name: string;
  description: string;
  category: string;
  website: string;
  pricing: string;
  rating: number;
  users: string;
  logo: string;
  features: string[];
}

export async function fetchAITools(): Promise<AITool[]> {
  // This function must be implemented to fetch real, live data from an API or RSS feed.
  // All static/mock/demo data has been removed.
  // TODO: Implement live data fetching logic here.
  return [];
}
