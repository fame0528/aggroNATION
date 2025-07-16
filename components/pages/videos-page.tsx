'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Pagination } from '@/components/pagination';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Play,
  ExternalLink,
  Search,
  Filter,
  Clock,
  Eye,
  Calendar,
  Youtube,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { AI_YOUTUBE_CHANNELS } from '@/lib/api/youtube-rss';
import type { RSSYouTubeVideo } from '@/lib/api/youtube-rss';
import { useCategoryContext } from '@/contexts/category-context';

// ECHO_BETA: All logic and JSX must be inside a function component
export function VideosPage() {
  // Map sidebar categories to video tags/keywords
  const CATEGORY_MAP: Record<string, string[]> = {
    'Generative AI': [
      'generative',
      'text-generation',
      'diffusion',
      'gpt',
      'stable diffusion',
      'sdxl',
      'llm',
    ],
    'Computer Vision': ['vision', 'image', 'detection', 'yolo', 'cv'],
    'NLP & LLMs': ['nlp', 'llm', 'language', 'bert', 'gpt', 'text'],
    'Ethics & Safety': ['ethics', 'safety', 'alignment', 'responsible', 'bias'],
    MLOps: ['mlops', 'deployment', 'pipeline', 'ops', 'monitoring'],
  };

  // Pagination state
  const PAGE_SIZE = 48;
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedChannel, setSelectedChannel] = useState<string>('all');
  const [modalVideo, setModalVideo] = useState<RSSYouTubeVideo | null>(null);
  const [page, setPage] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return parseInt(params.get('page') || '1');
    }
    return 1;
  });

  // Sync page state to URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (page > 1) {
      params.set('page', String(page));
    } else {
      params.delete('page');
    }
    window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
  }, [page]);

  // Fetch paginated videos
  const [videos, setVideos] = useState<RSSYouTubeVideo[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const { selectedCategory } = useCategoryContext();
  const observer = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const fetchVideos = useCallback(async (pageNum: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/youtube?page=${pageNum}&limit=${PAGE_SIZE}`);
      const data = await res.json();
      if (data && Array.isArray(data.videos)) {
        setVideos(data.videos);
        setTotalCount(data.totalCount || data.pagination?.total || 0);
        const calculatedTotalPages = Math.ceil((data.totalCount || 0) / PAGE_SIZE);
        setTotalPages(calculatedTotalPages || 1);
      } else {
        setVideos([]);
        setTotalCount(0);
        setTotalPages(1);
      }
    } catch (err) {
      setError('Failed to load videos');
      setVideos([]);
      setTotalCount(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVideos(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // Filtering (search, channel, category)
  const filteredVideos = videos.filter((video: RSSYouTubeVideo) => {
    const matchesSearch =
      video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      video.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      video.channelTitle.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesChannel = selectedChannel === 'all' || video.channelId === selectedChannel;

    // Smart Category global filter
    let matchesSmartCategory = true;
    if (selectedCategory && selectedCategory in CATEGORY_MAP) {
      // No tags from RSS, so skip smart category filtering
      matchesSmartCategory = true;
    }
    return matchesSearch && matchesChannel && matchesSmartCategory;
  });

  // No categories from RSS, so this is a placeholder if needed
  const allCategories: string[] = [];

  // Show initial loading spinner only if no videos loaded yet
  if (loading && videos.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-red-400" />
          <span className="ml-2 text-gray-400">Loading AI videos...</span>
        </div>
      </div>
    );
  }

  if (error && videos.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center text-red-400 p-8">
          <AlertCircle className="w-8 h-8 mx-auto mb-2" />
          <p>{error}</p>
          <Button onClick={() => fetchVideos(page)} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 w-full flex-1 min-h-screen">
      {/* Page Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-white">🎥 AI Video Hub</h1>
            <p className="text-gray-400">
              Latest AI videos from top creators • {filteredVideos.length} videos found
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button className="border-gray-600 text-gray-300 bg-transparent hover:bg-gray-800">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search videos..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-red-500"
            />
          </div>

          <select
            value={selectedChannel}
            onChange={(e) => setSelectedChannel(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:border-red-500 focus:outline-none"
          >
            <option value="all">All Channels</option>
            {AI_YOUTUBE_CHANNELS.map((channel) => (
              <option key={channel.id} value={channel.id}>
                {channel.name}
              </option>
            ))}
          </select>

          {/* Category filter select removed: now controlled globally by sidebar */}
        </div>
      </div>

      {/* Videos Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredVideos.map((video: RSSYouTubeVideo) => (
          <Card
            key={video.id}
            className="bg-gray-800 border-gray-700 hover:border-red-500/50 transition-all duration-200 group overflow-hidden"
          >
            <CardContent className="p-0">
              {/* Thumbnail */}
              <div className="relative aspect-video bg-gray-900 overflow-hidden">
                <img
                  src={video.thumbnail || '/placeholder.svg?height=180&width=320'}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                  <Button
                    // variant="ghost"
                    size="lg"
                    className="text-white hover:text-red-400 hover:bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => setModalVideo(video)}
                  >
                    <Play className="w-8 h-8 fill-current" />
                  </Button>
                </div>
                <div className="absolute top-2 right-2">
                  <Badge className="bg-red-500/20 border-red-500 text-red-400 border-none text-xs">
                    <span className="flex items-center">
                      <Youtube className="w-3 h-3 mr-1" />
                      Video
                    </span>
                  </Badge>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-white text-sm line-clamp-2 leading-tight">
                    {video.title}
                  </h3>
                  <Button
                    // variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-white flex-shrink-0 p-1"
                    onClick={() => setModalVideo(video)}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>

                <p className="text-gray-400 text-xs line-clamp-2 leading-relaxed">
                  {video.description || 'No description available.'}
                </p>

                {/* Channel and Date */}
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-red-400 truncate">{video.channelTitle}</span>
                  <span className="flex items-center space-x-1 text-gray-500 flex-shrink-0">
                    <Calendar className="w-3 h-3" />
                    <span>
                      {video.publishedAt
                        ? new Date(video.publishedAt).toLocaleDateString()
                        : 'Unknown date'}
                    </span>
                  </span>
                </div>

                {/* No categories from RSS, but you can add logic here if needed */}

                {/* No duration/viewCount from RSS */}
              </div>
            </CardContent>
          </Card>
        ))}
        {/* Infinite scroll loader sentinel */}
        <div ref={loadMoreRef} />
        {/* Video Modal */}
        <Dialog open={!!modalVideo} onOpenChange={(open) => !open && setModalVideo(null)}>
          <DialogContent className="max-w-2xl w-full">
            <DialogHeader>
              <DialogTitle>{modalVideo?.title}</DialogTitle>
            </DialogHeader>
            {modalVideo && (
              <div className="aspect-video w-full mb-4">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${modalVideo.id}`}
                  title={modalVideo.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full rounded-lg"
                ></iframe>
              </div>
            )}
            <div className="text-gray-300 text-sm">
              {modalVideo?.description || 'No description available.'}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Empty State */}
      {filteredVideos.length === 0 && !loading && (
        <div className="text-center py-16">
          <Youtube className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-400 mb-2">No videos found</h3>
          <p className="text-gray-500">Try adjusting your search terms or filters</p>
        </div>
      )}

      {/* Infinite scroll loader */}
      {loading && videos.length > 0 && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-red-400" />
          <span className="ml-2 text-gray-400">Loading more videos...</span>
        </div>
      )}

      {/* Channel Info */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-6">
          <h3 className="text-white font-semibold mb-6">Featured AI Channels</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {AI_YOUTUBE_CHANNELS.slice(0, 6).map((channel) => (
              <div
                key={channel.id}
                className="flex items-center space-x-3 p-4 bg-gray-750 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Youtube className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-white text-sm truncate">{channel.name}</div>
                  {/* No channel description from RSS config */}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-gray-400 text-xs">
            Showing {videos.length} of {totalCount || videos.length} videos
          </div>
          {totalPages > 1 && (
            <div className="mt-4 flex justify-center">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
                totalCount={totalCount}
                pageSize={PAGE_SIZE}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
