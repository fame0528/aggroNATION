/**
 * @fileoverview Advanced caching service for RSS data
 * @author aggroNATION Development Team
 * @version 1.0.0
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

/**
 * In-memory cache service (can be extended with Redis)
 */
export class CacheService {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private defaultTTL = 300000; // 5 minutes

  /**
   * Set cache entry
   */
  set<T>(key: string, data: T, ttl: number = this.defaultTTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * Get cache entry
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if entry is expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Delete cache entry
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    keys: string[];
    entries: Array<{ key: string; age: number; ttl: number }>;
  } {
    const now = Date.now();
    const entries = Array.from(this.cache.entries()).map(([key, entry]) => ({
      key,
      age: now - entry.timestamp,
      ttl: entry.ttl,
    }));

    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      entries,
    };
  }

  /**
   * Clean expired entries
   */
  cleanup(): number {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    return cleaned;
  }

  /**
   * Get or set cache entry with function
   */
  async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl: number = this.defaultTTL,
  ): Promise<T> {
    const cached = this.get<T>(key);

    if (cached !== null) {
      return cached;
    }

    const data = await fetchFn();
    this.set(key, data, ttl);
    return data;
  }
}

/**
 * Global cache instance
 */
export const cache = new CacheService();

/**
 * Cache key generators
 */
export const cacheKeys = {
  articles: (params?: any) => `articles:${JSON.stringify(params || {})}`,
  videos: (params?: any) => `videos:${JSON.stringify(params || {})}`,
  models: (params?: any) => `models:${JSON.stringify(params || {})}`,
  feeds: (params?: any) => `feeds:${JSON.stringify(params || {})}`,
  health: () => 'health:status',
  stats: () => 'stats:dashboard',
};

/**
 * Cache TTL constants (in milliseconds)
 */
export const cacheTTL = {
  short: 60000, // 1 minute
  medium: 300000, // 5 minutes
  long: 900000, // 15 minutes
  extraLong: 3600000, // 1 hour
};

/**
 * Start cache cleanup interval
 */
let cleanupInterval: NodeJS.Timeout | null = null;

export function startCacheCleanup(intervalMs: number = 600000): void {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
  }

  cleanupInterval = setInterval(() => {
    const cleaned = cache.cleanup();
    console.log(`Cache cleanup: removed ${cleaned} expired entries`);
  }, intervalMs);
}

/**
 * Stop cache cleanup
 */
export function stopCacheCleanup(): void {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
  }
}

// Start cleanup by default
if (typeof process !== 'undefined' && process.env.NODE_ENV === 'production') {
  startCacheCleanup();
}
