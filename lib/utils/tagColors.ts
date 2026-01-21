/**
 * Tag Color Utilities
 * 
 * Provides consistent, deterministic color mapping for content tags
 * Same tag always gets the same color for visual consistency
 * 
 * @module lib/utils/tagColors
 * @created 2026-01-20
 */

/**
 * Available tag color palette
 * Carefully selected for visual variety and accessibility
 */
const TAG_COLORS = [
  'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
  'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20',
  'bg-pink-500/10 text-pink-700 dark:text-pink-400 border-pink-500/20',
  'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20',
  'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20',
  'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20',
  'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20',
  'bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-500/20',
  'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/20',
  'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20',
  'bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-500/20',
  'bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-400 border-fuchsia-500/20',
  'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20',
  'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
  'bg-lime-500/10 text-lime-700 dark:text-lime-400 border-lime-500/20',
  'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
] as const;

/**
 * Simple string hash function
 * Generates a consistent number from a string
 * 
 * @param str - String to hash
 * @returns Hash value as positive integer
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Get consistent color class for a tag
 * Same tag name always returns the same color
 * 
 * @param tag - Tag name/text
 * @returns Tailwind CSS class string for the tag color
 * 
 * @example
 * ```tsx
 * const colorClass = getTagColor('Tutorial');
 * // Returns: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20'
 * // Always returns the same color for 'Tutorial'
 * ```
 */
export function getTagColor(tag: string): string {
  const hash = hashString(tag.toLowerCase());
  const colorIndex = hash % TAG_COLORS.length;
  return TAG_COLORS[colorIndex];
}

/**
 * Get multiple tag colors for a list of tags
 * Useful for batch operations
 * 
 * @param tags - Array of tag names
 * @returns Array of color class strings matching the input tags
 * 
 * @example
 * ```tsx
 * const colors = getTagColors(['Tutorial', 'AI', 'Research']);
 * // Returns array of color classes, each tag gets its consistent color
 * ```
 */
export function getTagColors(tags: string[]): string[] {
  return tags.map(tag => getTagColor(tag));
}
