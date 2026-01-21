/**
 * Filter Bar Component
 * 
 * Displays filter and sort controls for the article feed
 * UI only in this phase - functionality will be added in later phases
 * 
 * @module components/home/FilterBar
 * @created 2026-01-20
 */

'use client';

import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Select, SelectItem } from "@heroui/select";

export const FilterBar = () => {
  const sortOptions = [
    { key: 'rating', label: 'Top Rated' },
    { key: 'recent', label: 'Most Recent' },
    { key: 'trending', label: 'Trending' },
  ];

  const sourceTypes = [
    { key: 'all', label: 'All Sources', icon: '🌐' },
    { key: 'rss', label: 'RSS', icon: '📰' },
    { key: 'reddit', label: 'Reddit', icon: '🔴' },
    { key: 'youtube', label: 'YouTube', icon: '▶️' },
    { key: 'x', label: 'X', icon: '❌' },
  ];

  return (
    <div className="w-full border-b border-divider pb-4 mb-6">
      {/* Source Type Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        {sourceTypes.map((source) => (
          <Chip
            key={source.key}
            variant="flat"
            className="cursor-pointer hover:bg-default-200 transition-colors"
          >
            <span className="mr-1">{source.icon}</span>
            {source.label}
          </Chip>
        ))}
      </div>

      {/* Sort Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          <Chip size="sm" variant="dot" color="success">
            Live Feed
          </Chip>
          <Chip size="sm" variant="flat">
            342 articles today
          </Chip>
        </div>
        
        <Select
          label="Sort by"
          placeholder="Select sort order"
          className="max-w-xs"
          size="sm"
          defaultSelectedKeys={['rating']}
        >
          {sortOptions.map((option) => (
            <SelectItem key={option.key}>
              {option.label}
            </SelectItem>
          ))}
        </Select>
      </div>
    </div>
  );
};
