'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BookmarkIcon,
  TrashIcon,
  SearchIcon,
  FilterIcon,
  ExternalLinkIcon,
  TagIcon,
  CalendarIcon,
  FolderIcon,
} from 'lucide-react';

interface Bookmark {
  _id: string;
  articleId: string;
  title: string;
  url: string;
  description?: string;
  tags: string[];
  category: string;
  createdAt: Date;
}

interface BookmarksManagerProps {
  userId?: string;
}

export default function BookmarksManager({ userId = 'default' }: BookmarksManagerProps) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [tagFilter, setTagFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    fetchBookmarks();
  }, [userId, page, categoryFilter, tagFilter]);

  useEffect(() => {
    // Extract unique categories and tags
    const uniqueCategories = [...new Set(bookmarks.map((b) => b.category))];
    const uniqueTags = [...new Set(bookmarks.flatMap((b) => b.tags))];
    setCategories(uniqueCategories);
    setTags(uniqueTags);
  }, [bookmarks]);

  const fetchBookmarks = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        userId,
        limit: '20',
        offset: ((page - 1) * 20).toString(),
        ...(categoryFilter !== 'all' && { category: categoryFilter }),
        ...(tagFilter !== 'all' && { tags: tagFilter }),
      });

      const response = await fetch(`/api/user-content?type=bookmarks&${params}`);
      const data = await response.json();

      if (page === 1) {
        setBookmarks(data.bookmarks);
      } else {
        setBookmarks((prev) => [...prev, ...data.bookmarks]);
      }

      setHasMore(data.hasMore);
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteBookmark = async (bookmarkId: string) => {
    try {
      const response = await fetch(`/api/user-content?type=bookmarks&id=${bookmarkId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setBookmarks((prev) => prev.filter((b) => b._id !== bookmarkId));
      }
    } catch (error) {
      console.error('Error deleting bookmark:', error);
    }
  };

  const filteredBookmarks = bookmarks.filter(
    (bookmark) =>
      bookmark.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bookmark.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bookmark.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  const loadMore = () => {
    setPage((prev) => prev + 1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2">
          <BookmarkIcon className="w-5 h-5" />
          <h2 className="text-2xl font-bold">Bookmarks</h2>
          <Badge variant="secondary" className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
            {filteredBookmarks.length}
          </Badge>
        </div>

        <div className="flex gap-2">
          <div className="relative">
            <SearchIcon className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <Input
              placeholder="Search bookmarks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={tagFilter} onValueChange={setTagFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Tag" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tags</SelectItem>
              {tags.map((tag) => (
                <SelectItem key={tag} value={tag}>
                  {tag}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading && page === 1 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-gray-200 rounded mb-4"></div>
                <div className="flex gap-2">
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBookmarks.map((bookmark) => (
            <Card key={bookmark._id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg line-clamp-2 flex-1">{bookmark.title}</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteBookmark(bookmark._id)}
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <CalendarIcon className="w-4 h-4" />
                  {new Date(bookmark.createdAt).toLocaleDateString()}
                </div>
              </CardHeader>
              <CardContent>
                {bookmark.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">{bookmark.description}</p>
                )}

                <div className="flex items-center gap-2 mb-3">
                  <FolderIcon className="w-4 h-4 text-gray-400" />
                  <Badge
                    variant="outline"
                    className={`${
                      bookmark.category === 'AI Research'
                        ? 'border-purple-500 text-purple-400'
                        : bookmark.category === 'Machine Learning'
                          ? 'border-blue-500 text-blue-400'
                          : bookmark.category === 'Development'
                            ? 'border-green-500 text-green-400'
                            : bookmark.category === 'News'
                              ? 'border-orange-500 text-orange-400'
                              : bookmark.category === 'Tools'
                                ? 'border-cyan-500 text-cyan-400'
                                : 'border-pink-500 text-pink-400'
                    }`}
                  >
                    {bookmark.category}
                  </Badge>
                </div>

                {bookmark.tags.length > 0 && (
                  <div className="flex items-center gap-2 mb-4">
                    <TagIcon className="w-4 h-4 text-gray-400" />
                    <div className="flex flex-wrap gap-1">
                      {bookmark.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {bookmark.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{bookmark.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(bookmark.url, '_blank')}
                  className="w-full"
                >
                  <ExternalLinkIcon className="w-4 h-4 mr-2" />
                  Open Article
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredBookmarks.length === 0 && !loading && (
        <div className="text-center py-12">
          <BookmarkIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No bookmarks found</h3>
          <p className="text-gray-500">
            {searchTerm || categoryFilter !== 'all' || tagFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Start bookmarking articles to see them here'}
          </p>
        </div>
      )}

      {hasMore && !loading && filteredBookmarks.length > 0 && (
        <div className="text-center">
          <Button
            onClick={loadMore}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            Load More
          </Button>
        </div>
      )}

      {loading && page > 1 && (
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      )}
    </div>
  );
}
