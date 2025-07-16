'use client';

import type React from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { EnhancedDataFetcher } from '@/lib/api/enhanced-data-fetcher';

interface EnhancedDataContextType {
  // Data states with much larger datasets
  repos: any[];
  models: any[];
  news: any[];
  companies: any[];
  tools: any[];

  // Loading states
  loading: {
    repos: boolean;
    models: boolean;
    news: boolean;
    companies: boolean;
    tools: boolean;
  };

  // Error states
  errors: {
    repos: string | null;
    models: string | null;
    news: string | null;
    companies: string | null;
    tools: string | null;
  };

  // Refresh functions
  refreshRepos: () => Promise<void>;
  refreshModels: () => Promise<void>;
  refreshNews: () => Promise<void>;
  refreshAll: () => Promise<void>;

  // Search and filter
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategories: string[];
  setSelectedCategories: (categories: string[]) => void;

  // Pagination
  currentPage: {
    repos: number;
    models: number;
    news: number;
  };
  setCurrentPage: (type: string, page: number) => void;
  itemsPerPage: number;
  setItemsPerPage: (count: number) => void;

  // Stats
  stats: {
    totalRepos: number;
    totalModels: number;
    totalNews: number;
    lastUpdate: Date;
  };
}

const EnhancedDataContext = createContext<EnhancedDataContextType | null>(null);

export function useDataContext() {
  const context = useContext(EnhancedDataContext);
  if (!context) {
    throw new Error('useDataContext must be used within EnhancedDataProvider');
  }
  return context;
}

export function EnhancedDataProvider({ children }: { children: React.ReactNode }) {
  const dataFetcher = EnhancedDataFetcher.getInstance();

  // Data states - much larger datasets
  const [repos, setRepos] = useState<any[]>([]);
  const [models, setModels] = useState<any[]>([]);
  const [news, setNews] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [tools, setTools] = useState<any[]>([]);

  // Loading states
  const [loading, setLoading] = useState({
    repos: true,
    models: true,
    news: true,
    companies: true,
    tools: true,
  });

  // Error states
  const [errors, setErrors] = useState({
    repos: null as string | null,
    models: null as string | null,
    news: null as string | null,
    companies: null as string | null,
    tools: null as string | null,
  });

  // Search and filter
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Pagination
  const [currentPage, setCurrentPageState] = useState({
    repos: 1,
    models: 1,
    news: 1,
  });
  const [itemsPerPage, setItemsPerPage] = useState(50);

  // Stats
  const [stats, setStats] = useState({
    totalRepos: 0,
    totalModels: 0,
    totalNews: 0,
    lastUpdate: new Date(),
  });

  const setCurrentPage = (type: string, page: number) => {
    setCurrentPageState((prev) => ({ ...prev, [type]: page }));
  };

  // Refresh functions with larger data limits
  const refreshRepos = useCallback(async () => {
    setLoading((prev) => ({ ...prev, repos: true }));
    setErrors((prev) => ({ ...prev, repos: null }));

    try {
      const data = await dataFetcher.fetchTrendingRepos(200); // Fetch 200 repos
      setRepos(data);
      setStats((prev) => ({ ...prev, totalRepos: data.length, lastUpdate: new Date() }));
    } catch (error) {
      setErrors((prev) => ({ ...prev, repos: 'Failed to fetch repositories' }));
      console.error('Error fetching repos:', error);
    } finally {
      setLoading((prev) => ({ ...prev, repos: false }));
    }
  }, [dataFetcher]);

  const refreshModels = useCallback(async () => {
    setLoading((prev) => ({ ...prev, models: true }));
    setErrors((prev) => ({ ...prev, models: null }));

    try {
      const data = await dataFetcher.fetchLatestModels(300); // Fetch 300 models
      setModels(data);
      setStats((prev) => ({ ...prev, totalModels: data.length, lastUpdate: new Date() }));
    } catch (error) {
      setErrors((prev) => ({ ...prev, models: 'Failed to fetch models' }));
      console.error('Error fetching models:', error);
    } finally {
      setLoading((prev) => ({ ...prev, models: false }));
    }
  }, [dataFetcher]);

  const refreshNews = useCallback(async () => {
    setLoading((prev) => ({ ...prev, news: true }));
    setErrors((prev) => ({ ...prev, news: null }));

    try {
      const data = await dataFetcher.fetchAINews(500); // Fetch 500 news articles
      setNews(data);
      setStats((prev) => ({ ...prev, totalNews: data.length, lastUpdate: new Date() }));
    } catch (error) {
      setErrors((prev) => ({ ...prev, news: 'Failed to fetch news' }));
      console.error('Error fetching news:', error);
    } finally {
      setLoading((prev) => ({ ...prev, news: false }));
    }
  }, [dataFetcher]);

  const refreshCompanies = useCallback(async () => {
    setLoading((prev) => ({ ...prev, companies: true }));
    setErrors((prev) => ({ ...prev, companies: null }));
    try {
      // Fetch live companies data from API (no static/fallback)
      const data = await import('@/lib/api/companies').then((m) => m.fetchAICompanies());
      setCompanies(Array.isArray(data) ? data : []);
    } catch (error) {
      setErrors((prev) => ({ ...prev, companies: 'Failed to fetch companies' }));
      console.error('Error fetching companies:', error);
    } finally {
      setLoading((prev) => ({ ...prev, companies: false }));
    }
  }, []);

  const refreshTools = useCallback(async () => {
    setLoading((prev) => ({ ...prev, tools: true }));
    setErrors((prev) => ({ ...prev, tools: null }));
    try {
      // Fetch live tools data from API (no static/fallback)
      const data = await import('@/lib/api/tools').then((m) => m.fetchAITools());
      setTools(Array.isArray(data) ? data : []);
    } catch (error) {
      setErrors((prev) => ({ ...prev, tools: 'Failed to fetch tools' }));
      console.error('Error fetching tools:', error);
    } finally {
      setLoading((prev) => ({ ...prev, tools: false }));
    }
  }, []);

  const refreshAll = useCallback(async () => {
    await Promise.all([
      refreshRepos(),
      refreshModels(),
      refreshNews(),
      refreshCompanies(),
      refreshTools(),
    ]);
  }, [refreshRepos, refreshModels, refreshNews, refreshCompanies, refreshTools]);

  // Initial data load
  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // Auto-refresh every 30 minutes
  useEffect(() => {
    const interval = setInterval(refreshAll, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [refreshAll]);

  const value: EnhancedDataContextType = {
    repos,
    models,
    news,
    companies,
    tools,
    loading,
    errors,
    refreshRepos,
    refreshModels,
    refreshNews,
    refreshAll,
    searchTerm,
    setSearchTerm,
    selectedCategories,
    setSelectedCategories,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    stats,
  };

  return <EnhancedDataContext.Provider value={value}>{children}</EnhancedDataContext.Provider>;
}
