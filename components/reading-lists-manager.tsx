'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  ListIcon,
  PlusIcon,
  TrashIcon,
  EditIcon,
  BookOpenIcon,
  GlobeIcon,
  LockIcon,
  CalendarIcon,
  FileTextIcon,
} from 'lucide-react';

interface ReadingList {
  _id: string;
  name: string;
  description?: string;
  articles: string[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface ReadingListsManagerProps {
  userId?: string;
}

export default function ReadingListsManager({ userId = 'default' }: ReadingListsManagerProps) {
  const [readingLists, setReadingLists] = useState<ReadingList[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingList, setEditingList] = useState<ReadingList | null>(null);
  const [newListName, setNewListName] = useState('');
  const [newListDescription, setNewListDescription] = useState('');
  const [newListIsPublic, setNewListIsPublic] = useState(false);

  useEffect(() => {
    fetchReadingLists();
  }, [userId]);

  const fetchReadingLists = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/user-content?type=reading-lists&userId=${userId}`);
      const data = await response.json();
      setReadingLists(data.readingLists);
    } catch (error) {
      console.error('Error fetching reading lists:', error);
    } finally {
      setLoading(false);
    }
  };

  const createReadingList = async () => {
    if (!newListName.trim()) return;

    try {
      const response = await fetch(`/api/user-content?type=reading-lists&userId=${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newListName,
          description: newListDescription,
          isPublic: newListIsPublic,
        }),
      });

      if (response.ok) {
        const { readingList } = await response.json();
        setReadingLists((prev) => [readingList, ...prev]);
        setNewListName('');
        setNewListDescription('');
        setNewListIsPublic(false);
        setShowCreateDialog(false);
      }
    } catch (error) {
      console.error('Error creating reading list:', error);
    }
  };

  const updateReadingList = async () => {
    if (!editingList || !newListName.trim()) return;

    try {
      const response = await fetch(
        `/api/user-content?type=reading-lists&id=${editingList._id}&userId=${userId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: newListName,
            description: newListDescription,
            isPublic: newListIsPublic,
          }),
        },
      );

      if (response.ok) {
        const { readingList } = await response.json();
        setReadingLists((prev) =>
          prev.map((list) => (list._id === editingList._id ? readingList : list)),
        );
        setEditingList(null);
        setNewListName('');
        setNewListDescription('');
        setNewListIsPublic(false);
        setShowEditDialog(false);
      }
    } catch (error) {
      console.error('Error updating reading list:', error);
    }
  };

  const deleteReadingList = async (listId: string) => {
    if (!confirm('Are you sure you want to delete this reading list?')) return;

    try {
      const response = await fetch(
        `/api/user-content?type=reading-lists&id=${listId}&userId=${userId}`,
        {
          method: 'DELETE',
        },
      );

      if (response.ok) {
        setReadingLists((prev) => prev.filter((list) => list._id !== listId));
      }
    } catch (error) {
      console.error('Error deleting reading list:', error);
    }
  };

  const openEditDialog = (list: ReadingList) => {
    setEditingList(list);
    setNewListName(list.name);
    setNewListDescription(list.description || '');
    setNewListIsPublic(list.isPublic);
    setShowEditDialog(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ListIcon className="w-5 h-5" />
          <h2 className="text-2xl font-bold">Reading Lists</h2>
          <Badge className="bg-cyan-500/20 border-cyan-500 text-cyan-400">
            {readingLists.length}
          </Badge>
        </div>

        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="w-4 h-4 mr-2" />
              New List
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Reading List</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <Input
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  placeholder="My Reading List"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Textarea
                  value={newListDescription}
                  onChange={(e) => setNewListDescription(e.target.value)}
                  placeholder="Description of this reading list..."
                  rows={3}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Switch checked={newListIsPublic} onCheckedChange={setNewListIsPublic} />
                  <label className="text-sm font-medium">Make public</label>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  {newListIsPublic ? (
                    <>
                      <GlobeIcon className="w-4 h-4" />
                      Public
                    </>
                  ) : (
                    <>
                      <LockIcon className="w-4 h-4" />
                      Private
                    </>
                  )}
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={createReadingList} className="flex-1">
                  Create List
                </Button>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-16 bg-gray-200 rounded mb-4"></div>
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
          {readingLists.map((list) => (
            <Card key={list._id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg line-clamp-2 flex-1">{list.name}</CardTitle>
                  <div className="flex gap-1 ml-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(list)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <EditIcon className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteReadingList(list._id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="w-4 h-4" />
                    {new Date(list.createdAt).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <FileTextIcon className="w-4 h-4" />
                    {list.articles.length} articles
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {list.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">{list.description}</p>
                )}

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {list.isPublic ? (
                      <>
                        <GlobeIcon className="w-4 h-4 text-green-500" />
                        <Badge className="bg-green-500/20 border-green-500 text-green-400">
                          Public
                        </Badge>
                      </>
                    ) : (
                      <>
                        <LockIcon className="w-4 h-4 text-gray-500" />
                        <Badge className="bg-orange-500/20 border-orange-500 text-orange-400">
                          Private
                        </Badge>
                      </>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    Updated {new Date(list.updatedAt).toLocaleDateString()}
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => console.log('View reading list:', list._id)}
                >
                  <BookOpenIcon className="w-4 h-4 mr-2" />
                  View Articles
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {readingLists.length === 0 && !loading && (
        <div className="text-center py-12">
          <ListIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No reading lists yet</h3>
          <p className="text-gray-500 mb-4">
            Create your first reading list to organize your articles
          </p>
          <Button onClick={() => setShowCreateDialog(true)}>
            <PlusIcon className="w-4 h-4 mr-2" />
            Create Your First List
          </Button>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Reading List</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Name</label>
              <Input
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                placeholder="My Reading List"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <Textarea
                value={newListDescription}
                onChange={(e) => setNewListDescription(e.target.value)}
                placeholder="Description of this reading list..."
                rows={3}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch checked={newListIsPublic} onCheckedChange={setNewListIsPublic} />
                <label className="text-sm font-medium">Make public</label>
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                {newListIsPublic ? (
                  <>
                    <GlobeIcon className="w-4 h-4" />
                    Public
                  </>
                ) : (
                  <>
                    <LockIcon className="w-4 h-4" />
                    Private
                  </>
                )}
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={updateReadingList} className="flex-1">
                Update List
              </Button>
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
