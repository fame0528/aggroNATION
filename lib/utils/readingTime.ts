/**
 * Reading Time Utility
 * 
 * Calculate estimated reading time for content
 * Based on average reading speed of 200 words per minute
 * 
 * @module lib/utils/readingTime
 * @created 2026-01-20
 */

/**
 * Calculate reading time from text content
 * 
 * @param text - Content text to analyze
 * @returns Reading time in minutes
 */
export function calculateReadingTime(text: string): number {
  const wordsPerMinute = 200;
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return Math.max(1, minutes); // Minimum 1 minute
}

/**
 * Format reading time for display
 * 
 * @param text - Content text to analyze
 * @returns Formatted string like "5 min read"
 */
export function formatReadingTime(text: string): string {
  const minutes = calculateReadingTime(text);
  return `${minutes} min read`;
}
