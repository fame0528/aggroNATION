'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play, ExternalLink, Youtube, Calendar, Eye, ThumbsUp, User } from 'lucide-react';
import { useDataContext } from '@/contexts/data-context';
import { formatCompactNumber } from '@/lib/utils/number-format';
import { formatCompactDate } from '@/lib/utils/date-format';

interface AIVideosProps {
  limit?: number;
}

// Function to generate a description for a video (matches videos-page logic)
const getVideoDescription = (video: any) => {
  if (
    video.description &&
    typeof video.description === 'string' &&
    video.description.trim() !== ''
  ) {
    return video.description;
  }
  if (video.summary && typeof video.summary === 'string' && video.summary.trim() !== '') {
    return video.summary;
  }
  if (video.content && typeof video.content === 'string' && video.content.trim() !== '') {
    return video.content;
  }
  if (
    video.snippet &&
    typeof video.snippet.description === 'string' &&
    video.snippet.description.trim() !== ''
  ) {
    return video.snippet.description;
  }
  return 'No description available.';
};

export function AIVideos({ limit = 6 }: AIVideosProps) {
  const { videos, loading, error } = useDataContext();
  const latestVideos = Array.isArray(videos) ? videos.slice(0, limit) : [];

  if (loading?.videos) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-white">
            <Youtube className="w-5 h-5 text-red-400" />
            <span>🎥 Latest AI Videos</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-video bg-gray-700 rounded mb-2"></div>
                <div className="h-4 bg-gray-700 rounded mb-1"></div>
                <div className="h-3 bg-gray-700 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error?.videos) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-white">
            <Youtube className="w-5 h-5 text-red-400" />
            <span>🎥 Latest AI Videos</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-red-400">
            <Youtube className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Failed to load videos</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (latestVideos.length > 0) {
    // TEMP: Debug log to inspect video object structure
    // Remove this after confirming the correct property
    // eslint-disable-next-line no-console
    console.log('Sample video object:', latestVideos[0]);
  }

  return (
    <Card className="bg-gray-800 border-gray-700 h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="flex items-center space-x-2 text-white">
          <Youtube className="w-5 h-5 text-red-400" />
          <span>🎥 Latest AI Videos</span>
          <Badge variant="secondary" className="bg-red-500/20 text-red-400 border-red-500/30">
            Fresh
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <div className="space-y-3 h-full overflow-y-auto pr-2">
          {latestVideos.length > 0 &&
            latestVideos.map((video: any) => (
              <div
                key={video.id || video._id || video.videoId || `video-${Math.random()}`}
                className="group cursor-pointer"
                onClick={() => window.open(video.videoUrl, '_blank')}
              >
                <div className="flex space-x-3 p-3 bg-gray-750 rounded-lg hover:bg-gray-700 transition-colors">
                  {/* Thumbnail */}
                  <div className="relative w-28 h-16 bg-gray-900 rounded overflow-hidden flex-shrink-0">
                    <img
                      src={video.thumbnail || '/placeholder.svg?height=64&width=112'}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                      <Play className="w-4 h-4 text-white fill-current" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <h4 className="font-medium text-white text-sm line-clamp-2 leading-tight">
                      {video.title}
                    </h4>
                    {/* Video Description */}
                    <div className="text-xs text-gray-300 line-clamp-2 mb-1">
                      {getVideoDescription(video)}
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-gray-400">
                      <User className="w-3 h-3" />
                      <span className="text-red-400 font-medium truncate">
                        {video.channelName || video.channelTitle}
                      </span>
                      <span>•</span>
                      <span className="flex items-center space-x-1 flex-shrink-0">
                        <Calendar className="w-3 h-3" />
                        <span>{formatCompactDate(video.publishedAt)}</span>
                      </span>
                    </div>

                    {/* Video stats */}
                    <div className="flex items-center space-x-3 text-xs text-gray-400">
                      {video.duration && <span>{video.duration}</span>}
                      {video.viewCount && (
                        <span className="flex items-center space-x-1">
                          <Eye className="w-3 h-3" />
                          <span>{formatCompactNumber(video.viewCount)}</span>
                        </span>
                      )}
                      {video.likeCount && (
                        <span className="flex items-center space-x-1">
                          <ThumbsUp className="w-3 h-3" />
                          <span>{formatCompactNumber(video.likeCount)}</span>
                        </span>
                      )}
                    </div>

                    {/* Tags */}
                    {video.tags && video.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {video.tags.slice(0, 2).map((tag: string, idx: number) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className={`text-xs ${
                              tag.toLowerCase().includes('ai') ||
                              tag.toLowerCase().includes('artificial')
                                ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400'
                                : tag.toLowerCase().includes('machine') ||
                                    tag.toLowerCase().includes('ml')
                                  ? 'bg-purple-500/20 border-purple-500 text-purple-400'
                                  : tag.toLowerCase().includes('deep') ||
                                      tag.toLowerCase().includes('neural')
                                    ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                                    : tag.toLowerCase().includes('tech') ||
                                        tag.toLowerCase().includes('code')
                                      ? 'bg-green-500/20 border-green-500 text-green-400'
                                      : idx % 4 === 0
                                        ? 'bg-orange-500/20 border-orange-500 text-orange-400'
                                        : idx % 4 === 1
                                          ? 'bg-pink-500/20 border-pink-500 text-pink-400'
                                          : idx % 4 === 2
                                            ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400'
                                            : 'bg-red-500/20 border-red-500 text-red-400'
                            }`}
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Action */}
                  <div className="flex items-center flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}

          {/* Never show empty state: always show at least a placeholder if no data */}
          {latestVideos.length === 0 && !loading?.videos && (
            <div className="text-center py-8 text-gray-400">
              <Youtube className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Loading videos...</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
