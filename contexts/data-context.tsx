'use client';

import type React from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import useSWR from 'swr';

interface DataContextType {
  repos: any[];
  models: any[];
  news: any[];
  videos: any[];
  loading: {
    repos: boolean;
    models: boolean;
    news: boolean;
    videos: boolean;
  };
  error: {
    repos: string | null;
    models: string | null;
    news: string | null;
    videos: string | null;
  };
  lastUpdate: Date | null;
  refreshData: (category?: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | null>(null);

export function useDataContext() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useDataContext must be used within a DataProvider');
  }
  return context;
}

interface DataProviderProps {
  children: React.ReactNode;
}

// Fetchers for SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function DataProvider({ children }: DataProviderProps) {
  // Use SWR for data fetching
  const {
    data: articlesData,
    error: articlesError,
    mutate: mutateArticles,
  } = useSWR(
    '/api/rss/articles?limit=100',
    fetcher,
    { refreshInterval: 300000 }, // 5 minutes
  );

  const {
    data: videosData,
    error: videosError,
    mutate: mutateVideos,
  } = useSWR(
    '/api/youtube?limit=50',
    fetcher,
    { refreshInterval: 300000 }, // 5 minutes
  );

  const {
    data: modelsData,
    error: modelsError,
    mutate: mutateModels,
  } = useSWR(
    '/api/models',
    fetcher,
    { refreshInterval: 600000 }, // 10 minutes
  );

  const {
    data: reposData,
    error: reposError,
    mutate: mutateRepos,
  } = useSWR(
    '/api/repos',
    fetcher,
    { refreshInterval: 600000 }, // 10 minutes
  );

  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Transform data
  const news = articlesData?.data || [];
  const videos = videosData?.videos || [];
  const models = modelsData?.items || [];
  const repos = reposData?.repos || [];

  // Loading states
  const loading = {
    repos: !reposData && !reposError,
    models: !modelsData && !modelsError,
    news: !articlesData && !articlesError,
    videos: !videosData && !videosError,
  };

  // Error states
  const error = {
    repos: reposError ? 'Failed to load repositories' : null,
    models: modelsError ? 'Failed to load models' : null,
    news: articlesError ? 'Failed to load news' : null,
    videos: videosError ? 'Failed to load videos' : null,
  };

  // Update last update timestamp when data changes
  useEffect(() => {
    if (articlesData || videosData || modelsData || reposData) {
      setLastUpdate(new Date());
    }
  }, [articlesData, videosData, modelsData, reposData]);

  const refreshData = async (category?: string) => {
    try {
      if (!category || category === 'news') {
        await mutateArticles();
      }
      if (!category || category === 'videos') {
        await mutateVideos();
      }
      if (!category || category === 'models') {
        await mutateModels();
      }
      if (!category || category === 'repos') {
        await mutateRepos();
      }

      // Also trigger RSS refresh if needed
      if (category === 'news') {
        await fetch('/api/rss/refresh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'news',
            force: true,
          }),
        });
      }

      setLastUpdate(new Date());
    } catch (err) {
      console.error('Error refreshing data:', err);
    }
  };

  const value = {
    repos,
    models,
    news,
    videos,
    loading,
    error,
    lastUpdate,
    refreshData,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}
