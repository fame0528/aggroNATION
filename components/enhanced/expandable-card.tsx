'use client';

import React, { useState, ReactElement } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, ExternalLink, Star, Heart, Share2 } from 'lucide-react';
import { useUserContext } from '@/contexts/user-context';

interface ExpandableCardProps {
  title: string;
  // description: string; // Removed as per new requirements
  expandedContent: React.ReactNode;
  badges?: string[];
  rating?: number;
  id: string;
  type: 'repos' | 'models' | 'news';
  url?: string;
  metadata?: Record<string, unknown>;
}

export function ExpandableCard({
  title,
  // description, // Removed as per new requirements
  expandedContent,
  badges = [],
  rating,
  id,
  type,
  url,
  metadata,
}: ExpandableCardProps): ReactElement {
  const [isExpanded, setIsExpanded] = useState(false);
  const userContext = useUserContext();

  // Safe access to user context with fallbacks
  const isFavorite = userContext?.isFavorite ? userContext.isFavorite(type, id) : false;
  const addToFavorites: (type: string, id: string) => void =
    userContext?.addToFavorites || (() => {});
  const removeFromFavorites: (type: string, id: string) => void =
    userContext?.removeFromFavorites || (() => {});
  const rateItem: (id: string, rating: number) => void = userContext?.rateItem || (() => {});
  const ratings: Record<string, number> = userContext?.ratings || {};

  const handleFavorite = (): void => {
    if (isFavorite) {
      removeFromFavorites(type, id);
    } else {
      addToFavorites(type, id);
    }
  };

  const handleRate = (newRating: number): void => {
    rateItem(id, newRating);
  };

  const currentRating: number = ratings[id] || rating || 0;

  return (
    <Card className="bg-gray-800 border-gray-700 hover:border-cyan-500/50 transition-all duration-300">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-white text-lg mb-2">{title || 'Untitled'}</CardTitle>
            {/* Description removed as per requirements */}
          </div>
          <div className="flex items-center space-x-2 ml-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleFavorite}
              className={`${isFavorite ? 'text-red-400 hover:text-red-300' : 'text-gray-400 hover:text-white'}`}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
            </Button>
            {url && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(url, '_blank')}
                className="text-gray-400 hover:text-white"
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            )}
            {/* Make share button less visually prominent */}
            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-400">
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {Array.isArray(badges) && badges.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {badges.map((badge, index) => (
              <Badge
                key={index}
                variant="outline"
                className={`text-xs ${
                  index % 6 === 0
                    ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400'
                    : index % 6 === 1
                      ? 'bg-purple-500/20 border-purple-500 text-purple-400'
                      : index % 6 === 2
                        ? 'bg-green-500/20 border-green-500 text-green-400'
                        : index % 6 === 3
                          ? 'bg-orange-500/20 border-orange-500 text-orange-400'
                          : index % 6 === 4
                            ? 'bg-pink-500/20 border-pink-500 text-pink-400'
                            : 'bg-yellow-500/20 border-yellow-500 text-yellow-400'
                }`}
              >
                {badge}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => handleRate(star)}
                className={`${
                  star <= currentRating ? 'text-yellow-400' : 'text-gray-600'
                } hover:text-yellow-300 transition-colors`}
              >
                <Star className="w-4 h-4 fill-current" />
              </button>
            ))}
            <span className="text-sm text-gray-400">({currentRating.toFixed(1)})</span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-cyan-400 hover:text-cyan-300"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-4 h-4 mr-1" />
                Collapse
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 mr-1" />
                Expand
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="border-t border-gray-700 pt-4">{expandedContent}</CardContent>
      )}
    </Card>
  );
}
