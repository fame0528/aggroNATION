'use client';

import { SidebarInset } from '@/components/ui/sidebar';
import { DashboardHeader } from '@/components/dashboard-header';
import { OverviewPage } from '@/components/pages/overview-page';
import { ReposPage } from '@/components/pages/repos-page';
import { ModelsPage } from '@/components/pages/models-page';
// Removed all references to PapersPage
import { NewsPage } from '@/components/pages/news-page';
import { VideosPage } from '@/components/pages/videos-page';
import { LiveUpdateBanner } from '@/components/live-update-banner';
import { useDashboardContext } from '@/contexts/dashboard-context';

interface DashboardContentProps {
  lastUpdate?: Date | null;
  hasNewUpdates: boolean;
}

export function DashboardContent({ lastUpdate, hasNewUpdates }: DashboardContentProps) {
  const { currentPage, setCurrentPage } = useDashboardContext();

  const page = {
    overview: <OverviewPage lastUpdate={lastUpdate} hasNewUpdates={hasNewUpdates} />,
    repos: <ReposPage />,
    models: <ModelsPage />,
    news: <NewsPage />,
    videos: <VideosPage />,
  }[currentPage];

  return (
    <SidebarInset className="flex-1 flex flex-col min-h-screen w-full">
      <DashboardHeader currentPage={currentPage} onPageChange={setCurrentPage} />
      {hasNewUpdates && <LiveUpdateBanner onDismiss={() => null} />}
      <main className="flex-1 overflow-hidden w-full">
        <div className="w-full h-full">{page}</div>
      </main>
    </SidebarInset>
  );
}
