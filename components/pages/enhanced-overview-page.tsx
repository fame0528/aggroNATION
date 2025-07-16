'use client';

import { useDataContext } from '@/contexts/data-context';
import { useUserContext } from '@/contexts/user-context';
import { RealTimeDashboard } from '@/components/enhanced/real-time-dashboard';
import { SmartCategories } from '@/components/enhanced/smart-categories';
import { RankingSystem } from '@/components/enhanced/ranking-system';
import { ExpandableCard } from '@/components/enhanced/expandable-card';
import { PulsePalsMascot } from '@/components/pulse-pals-mascot';

interface EnhancedOverviewPageProps {
  lastUpdate: Date;
  hasNewUpdates: boolean;
}

export function EnhancedOverviewPage({ lastUpdate, hasNewUpdates }: EnhancedOverviewPageProps) {
  const dataContext = useDataContext();
  const userContext = useUserContext();

  // Safe access to context data with fallbacks
  const repos = Array.isArray(dataContext?.repos) ? dataContext.repos : [];
  const models = Array.isArray(dataContext?.models) ? dataContext.models : [];
  const news = Array.isArray(dataContext?.news) ? dataContext.news : [];
  const loading = dataContext?.loading || {};
  const preferences = userContext?.preferences || {};

  const isAnyLoading = Object.values(loading).some(Boolean);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">AI Pulse Dashboard 🚀</h1>
          <p className="text-gray-400">
            Comprehensive AI intelligence platform • Last updated: {lastUpdate.toLocaleTimeString()}
          </p>
        </div>
        <PulsePalsMascot isLoading={hasNewUpdates || isAnyLoading} />
      </div>

      <RealTimeDashboard />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <RankingSystem type="repos" items={repos.slice(0, 10)} title="Top Repositories" />
          <RankingSystem type="models" items={models.slice(0, 10)} title="Top AI Models" />
        </div>

        <div className="space-y-6">
          <SmartCategories />
          <RankingSystem type="news" items={news.slice(0, 5)} title="Top News" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white">🔥 Trending Repositories</h2>
          {repos.slice(0, 3).map((repo) => {
            if (!repo || !repo.id) return null;

            return (
              <ExpandableCard
                key={repo.id}
                id={repo.id.toString()}
                type="repos"
                title={repo.full_name || repo.name || 'Unknown Repository'}
                // description removed
                url={repo.html_url}
                badges={Array.isArray(repo.topics) ? repo.topics : []}
                rating={4.5}
                expandedContent={
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Stars:</span>
                        <span className="text-white ml-2">
                          {(repo.stargazers_count || 0).toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Forks:</span>
                        <span className="text-white ml-2">
                          {(repo.forks_count || 0).toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Language:</span>
                        <span className="text-white ml-2">{repo.language || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">License:</span>
                        <span className="text-white ml-2">{repo.license?.name || 'N/A'}</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-white font-medium mb-2">Use Cases:</h4>
                      <div className="flex flex-wrap gap-2">
                        {(repo.use_cases || ['General AI']).map(
                          (useCase: string, index: number) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded text-xs"
                            >
                              {useCase}
                            </span>
                          ),
                        )}
                      </div>
                    </div>
                  </div>
                }
              />
            );
          })}
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white">🆕 Latest AI Models</h2>
          {models.slice(0, 3).map((model) => {
            if (!model || !model.id) return null;

            return (
              <ExpandableCard
                key={model.id}
                id={model.id}
                type="models"
                title={model.id || 'Unknown Model'}
                // description removed
                badges={Array.isArray(model.tags) ? model.tags : []}
                rating={4.3}
                expandedContent={
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Downloads:</span>
                        <span className="text-white ml-2">
                          {(model.downloads || 0).toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Likes:</span>
                        <span className="text-white ml-2">
                          {(model.likes || 0).toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Pipeline:</span>
                        <span className="text-white ml-2">{model.pipeline_tag || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Library:</span>
                        <span className="text-white ml-2">{model.library_name || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                }
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
