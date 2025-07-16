'use client';

import type React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { RealTimeDataService } from '@/lib/services/real-time-data-service';

interface RealTimeDataContextType {
  repositories: any[];
  models: any[];
  news: any[];
  companies: any[];
  tools: any[];
  loading: boolean;
  error: string | null;
  lastUpdate: Date | null;
  refresh: (category?: string) => Promise<void>;
  dataSourceStatus: Record<string, any>;
}

const RealTimeDataContext = createContext<RealTimeDataContextType | null>(null);

export function useRealTimeDataContext() {
  const context = useContext(RealTimeDataContext);
  if (!context) {
    throw new Error('useRealTimeDataContext must be used within a RealTimeDataProvider');
  }
  return context;
}

interface RealTimeDataProviderProps {
  children: React.ReactNode;
}

export function RealTimeDataProvider({ children }: RealTimeDataProviderProps) {
  const [repositories, setRepositories] = useState<any[]>([]);
  const [models, setModels] = useState<any[]>([]);
  const [news, setNews] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [tools, setTools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [dataSourceStatus, setDataSourceStatus] = useState<Record<string, any>>({});

  const dataService = RealTimeDataService.getInstance();

  const refresh = async (category?: string) => {
    setLoading(true);
    setError(null);

    try {
      if (category) {
        await dataService.forceRefresh(category as any);
      } else {
        await dataService.forceRefresh();
      }

      // Update all data
      setRepositories(dataService.getCachedData('repositories'));
      setModels(dataService.getCachedData('models'));
      setNews(dataService.getCachedData('news'));
      setCompanies(dataService.getCachedData('companies'));
      // setTools(dataService.getCachedData("tools"))
      // 'tools' is not a valid Category, so skip this call or handle tools separately if needed.
      setDataSourceStatus(dataService.getDataSourceStatus());
      setLastUpdate(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh data');
      console.error('Error refreshing data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Set up subscriptions for all categories
    const unsubscribers = [
      dataService.subscribe('repositories', (data) => {
        setRepositories(Array.isArray(data) ? data : []);
        setLastUpdate(new Date());
      }),
      dataService.subscribe('models', (data) => {
        setModels(Array.isArray(data) ? data : []);
        setLastUpdate(new Date());
      }),
      dataService.subscribe('news', (data) => {
        setNews(Array.isArray(data) ? data : []);
        setLastUpdate(new Date());
      }),
      dataService.subscribe('companies', (data) => {
        setCompanies(Array.isArray(data) ? data : []);
        setLastUpdate(new Date());
      }),
      // dataService.subscribe("tools", (data) => {
      //   setTools(Array.isArray(data) ? data : [])
      // })
      // 'tools' is not a valid Category, so skip this subscription or handle tools separately if needed.
    ];

    // Initial data load
    refresh();

    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  }, []);

  const value: RealTimeDataContextType = {
    repositories,
    models,
    news,
    companies,
    tools,
    loading,
    error,
    lastUpdate,
    refresh,
    dataSourceStatus,
  };

  return <RealTimeDataContext.Provider value={value}>{children}</RealTimeDataContext.Provider>;
}
