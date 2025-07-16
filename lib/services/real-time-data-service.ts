'use client';

/**
 * Real-time data aggregation & caching service
 * --------------------------------------------
 * 1.  Collects data from a handful of API sources
 * 2.  Caches results in-memory with TTL
 * 3.  Exposes a small public API consumed by hooks / contexts
 */

// No direct imports - we'll use API endpoints instead

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type Category = 'repositories' | 'models' | 'news' | 'companies';

interface DataSource {
  id: string;
  category: Category;
  name: string;
  refreshInterval: number; // ms
  maxErrors: number;
  fetch: () => Promise<any[]>;
  lastFetch?: number; // epoch-ms
  errorCount: number;
}

interface CacheEntry {
  data: any[];
  timestamp: number; // epoch-ms
  ttl: number; // ms
}

/* -------------------------------------------------------------------------- */
/* Class                                                                       */
/* -------------------------------------------------------------------------- */

export class RealTimeDataService {
  /* --------------- singleton --------------- */
  private static instance: RealTimeDataService;
  public static getInstance() {
    if (!RealTimeDataService.instance) {
      RealTimeDataService.instance = new RealTimeDataService();
    }
    return RealTimeDataService.instance;
  }

  /* --------------- constructor ------------- */
  private constructor() {
    this.initSources();
    this.schedulePolling();
  }

  /* --------------- private state ---------- */
  private sources = new Map<string, DataSource>();
  private cache = new Map<string, CacheEntry>();
  /**   per-source subscribers (not per category)   */
  private subscribers = new Map<string, Set<(d: any[]) => void>>();

  /* ------------------------------------------------------------------------ */
  /* Source definitions                                                       */
  /* ------------------------------------------------------------------------ */
  private initSources() {
    const FIFTEEN_MIN = 15 * 60 * 1000;
    const TWENTY_MIN = 20 * 60 * 1000;
    const TEN_MIN = 10 * 60 * 1000;
    const THIRTY_MIN = 30 * 60 * 1000;
    const ONE_HOUR = 60 * 60 * 1000;

    const def = (cfg: Omit<DataSource, 'errorCount'>): DataSource => ({
      ...cfg,
      errorCount: 0,
    });

    // Helper function to get absolute URL
    const getAbsoluteUrl = (path: string) => {
      if (typeof window !== 'undefined') {
        // Client-side: use relative URLs
        return path;
      } else {
        // Server-side: use absolute URLs
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        return `${baseUrl}${path}`;
      }
    };

    [
      def({
        id: 'github-trending',
        category: 'repositories',
        name: 'GitHub Trending',
        refreshInterval: FIFTEEN_MIN,
        maxErrors: 3,
        fetch: async () => {
          const res = await fetch(getAbsoluteUrl('/api/repos?limit=100'));
          if (!res.ok) throw new Error('Failed to fetch repos');
          const data = await res.json();
          return data.repos || [];
        },
      }),
      def({
        id: 'huggingface-models',
        category: 'models',
        name: 'HF Models',
        refreshInterval: TWENTY_MIN,
        maxErrors: 3,
        fetch: async () => {
          const res = await fetch(getAbsoluteUrl('/api/models?limit=100'));
          if (!res.ok) throw new Error('Failed to fetch models');
          const data = await res.json();
          return data.models || [];
        },
      }),
      def({
        id: 'ai-news',
        category: 'news',
        name: 'AI News',
        refreshInterval: TEN_MIN,
        maxErrors: 5,
        fetch: async () => {
          const res = await fetch(getAbsoluteUrl('/api/news?limit=50'));
          if (!res.ok) throw new Error('Failed to fetch news');
          return res.json();
        },
      }),
      def({
        id: 'ai-companies',
        category: 'companies',
        name: 'AI Companies',
        refreshInterval: ONE_HOUR,
        maxErrors: 3,
        fetch: async () => {
          // Return empty array for now since we don't have a companies API
          return [];
        },
      }),
      // def({
      //   id: "ai-tools",
      //   category: "tools",
      //   name: "AI Tools",
      //   refreshInterval: THIRTY_MIN,
      //   maxErrors: 3,
      //   fetch: () => fetchAITools(),
      // }),
    ].forEach((src) => this.sources.set(src.id, src));
  }

  /* ------------------------------------------------------------------------ */
  /* Polling                                                                  */
  /* ------------------------------------------------------------------------ */
  private schedulePolling() {
    this.sources.forEach((source) => {
      // stagger first run
      setTimeout(() => this.pollSource(source.id), Math.random() * 4000);

      setInterval(() => {
        this.pollSource(source.id);
      }, source.refreshInterval);
    });
  }

  private async pollSource(sourceId: string) {
    const src = this.sources.get(sourceId);
    if (!src) return;

    // basic rate-limit guard
    if (src.lastFetch && Date.now() - src.lastFetch < 5_000) return;

    try {
      const data = await src.fetch();
      src.lastFetch = Date.now();
      src.errorCount = 0;

      // cache
      this.cache.set(sourceId, {
        data: Array.isArray(data) ? data : [],
        timestamp: Date.now(),
        ttl: src.refreshInterval,
      });

      // notify
      this.emit(sourceId, Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(`Error fetching ${src.name}:`, err);
      src.errorCount += 1;

      // Set empty data on error to prevent null access
      this.cache.set(sourceId, {
        data: [],
        timestamp: Date.now(),
        ttl: src.refreshInterval,
      });

      this.emit(sourceId, []);
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Public helpers consumed by hooks / UI                                    */
  /* ------------------------------------------------------------------------ */

  /** Return a **deduplicated** merged array for the category */
  public getCachedData(category: Category): any[] {
    const arrays: any[][] = [];
    this.sources.forEach((src) => {
      if (src.category === category) {
        const cached = this.cache.get(src.id);
        if (cached && Array.isArray(cached.data) && Date.now() - cached.timestamp < cached.ttl) {
          arrays.push(cached.data);
        }
      }
    });
    // flatten + naive dedupe by JSON-stringify id if present
    const merged = arrays.flat();
    const seen = new Set<string>();
    return merged.filter((item: any) => {
      if (!item) return false;
      const key = item?.id ? String(item.id) : JSON.stringify(item);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  /**
   * Force refresh for a whole category (or every source if no category supplied).
   * Returns a promise that resolves when all fetches settle.
   */
  public async forceRefresh(category?: Category) {
    const ids = category
      ? Array.from(this.sources.values())
          .filter((s) => s.category === category)
          .map((s) => s.id)
      : Array.from(this.sources.keys());

    await Promise.allSettled(ids.map((id) => this.pollSource(id)));
  }

  /** Returns a lightweight status object per source */
  public getDataSourceStatus() {
    const status: Record<string, any> = {};
    this.sources.forEach((src) => {
      const cached = this.cache.get(src.id);
      status[src.id] = {
        name: src.name,
        category: src.category,
        lastFetch: src.lastFetch ?? null,
        cachedItems: cached?.data?.length ?? 0,
        isStale: cached ? Date.now() - cached.timestamp > cached.ttl : true,
        errorCount: src.errorCount,
      };
    });
    return status;
  }

  /**
   * Subscribe to live updates for a **category**.
   * The callback is invoked immediately with the latest cache snapshot,
   * then every time *any* underlying source in that category updates.
   * Returns an unsubscribe function.
   */
  public subscribe(category: Category, cb: (data: any[]) => void) {
    // create a wrapper that filters by category
    const wrappers: Array<() => void> = [];

    this.sources.forEach((src) => {
      if (src.category !== category) return;

      if (!this.subscribers.has(src.id)) {
        this.subscribers.set(src.id, new Set());
      }
      const set = this.subscribers.get(src.id)!;

      // Create a category-aware callback
      const categoryCallback = () => {
        cb(this.getCachedData(category));
      };

      set.add(categoryCallback);
      wrappers.push(() => set.delete(categoryCallback));
    });

    // emit immediately with cache snapshot
    cb(this.getCachedData(category));

    // return unsubscribe
    return () => wrappers.forEach((unsub) => unsub());
  }

  /* ------------------------------------------------------------------------ */
  /* Internal emitter                                                         */
  /* ------------------------------------------------------------------------ */
  private emit(sourceId: string, data: any[]) {
    const set = this.subscribers.get(sourceId);
    if (!set) return;
    set.forEach((fn) => fn(data));
  }
}
