'use client';

import * as React from 'react';

/**
 * ------------------------------
 *  Types
 * ------------------------------
 */

export type PageType = 'overview' | 'repos' | 'models' | 'news' | 'videos';

interface DashboardContextValue {
  currentPage: PageType;
  setCurrentPage: (page: PageType) => void;
}

/**
 * ------------------------------
 *  Context
 * ------------------------------
 */

const DashboardContext = React.createContext<DashboardContextValue | null>(null);

/**
 * ------------------------------
 *  Hook
 * ------------------------------
 */

export function useDashboardContext(): DashboardContextValue {
  const ctx = React.useContext(DashboardContext);
  if (!ctx) {
    throw new Error('useDashboardContext must be used within <DashboardProvider>');
  }
  return ctx;
}

/**
 * ------------------------------
 *  Provider
 * ------------------------------
 */

export function DashboardProvider({
  defaultPage = 'overview',
  children,
}: {
  defaultPage?: PageType;
  children: React.ReactNode;
}) {
  const [currentPage, setCurrentPage] = React.useState<PageType>(defaultPage);

  /**
   * Memoise the context object so child re-renders are minimal.
   */
  const value = React.useMemo(() => ({ currentPage, setCurrentPage }), [currentPage]);

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}
