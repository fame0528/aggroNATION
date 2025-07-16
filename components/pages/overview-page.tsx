'use client';

import React from 'react';
import { useDataContext } from '@/contexts/data-context';
import { useUserContext } from '@/contexts/user-context';
import { StatsOverview } from '@/components/stats-overview';
import { TrendingRepos } from '@/components/trending-repos';
import { TrendingModels } from '@/components/trending-models';
// import { ResearchPapers } from '@/components/research-papers';
import { NewsUpdates } from '@/components/news-updates';
import { AIVideos } from '@/components/ai-videos';
import { PulsePalsMascot } from '@/components/pulse-pals-mascot';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface OverviewPageProps {
  /** `Date` of the last refresh. Can be `null` or `undefined` if not yet loaded. */
  lastUpdate?: Date | null;
  hasNewUpdates: boolean;
}

export function OverviewPage({ lastUpdate, hasNewUpdates }: OverviewPageProps) {
  const { refreshData, loading } = useDataContext();
  const { preferences } = useUserContext();

  // Gracefully handle cases where `lastUpdate` isn't provided yet
  const lastUpdatedLabel = lastUpdate
    ? `${lastUpdate.getHours().toString().padStart(2, '0')}:${lastUpdate.getMinutes().toString().padStart(2, '0')}`
    : '—'; // em dash for "not available"

  return (
    <div className="h-screen flex flex-col space-y-4 w-full overflow-hidden p-6">
      {/* Page Header */}
      <div className="flex-shrink-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-white">aggroNATION Dashboard 🚀</h1>
          <p className="text-gray-400">
            Comprehensive AI intelligence platform • Last updated: {lastUpdatedLabel}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button
            onClick={() => refreshData()}
            disabled={Object.values(loading).some(Boolean)}
            // variant="outline"
            className="border-cyan-500 text-cyan-400 hover:bg-cyan-500/10 bg-transparent"
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${Object.values(loading).some(Boolean) ? 'animate-spin' : ''}`}
            />
            Refresh All
          </Button>
          <PulsePalsMascot isLoading={hasNewUpdates || Object.values(loading).some(Boolean)} />
        </div>
      </div>

      {/* Stats Overview */}
      <div className="flex-shrink-0">
        <StatsOverview />
      </div>

      {/* Main Content Grid - 2x2 Grid filling remaining space */}
      <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-4 min-h-0">
        <div className="h-full">
          <TrendingRepos />
        </div>
        <div className="h-full">
          <TrendingModels />
        </div>
        <div className="h-full">
          <NewsUpdates />
        </div>
        <div className="h-full">
          <AIVideos limit={24} />
        </div>
      </div>
    </div>
  );
}
