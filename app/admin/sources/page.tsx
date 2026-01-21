/**
 * Admin Sources Management Page
 * 
 * List, add, edit, and delete content sources
 * 
 * @module app/admin/sources
 * @created 2026-01-20
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody } from '@heroui/card';
import { Button } from '@heroui/button';
import { Chip } from '@heroui/chip';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@heroui/modal';
import { Input } from '@heroui/input';
import { Select, SelectItem } from '@heroui/select';
import { Switch } from '@heroui/switch';

interface Source {
  _id: string;
  type: 'rss' | 'reddit' | 'youtube' | 'x';
  name: string;
  url: string;
  enabled: boolean;
  config: {
    fetchInterval: number;
    priority: 'low' | 'medium' | 'high';
    maxItems: number;
    tags: string[];
  };
  metadata: {
    lastFetched: string | null;
    totalFetched: number;
    consecutiveErrors: number;
  };
}

export default function SourcesPage() {
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSource, setEditingSource] = useState<Source | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [newSource, setNewSource] = useState({
    type: 'youtube' as const,
    name: '',
    url: '',
    enabled: true,
    fetchInterval: 60,
    priority: 'medium' as const,
    maxItems: 50,
  });

  // Fetch sources on load
  useEffect(() => {
    fetchSources();
  }, []);

  const fetchSources = async () => {
    try {
      const response = await fetch('/api/admin/sources');
      const data = await response.json();
      setSources(data.sources || []);
    } catch (error) {
      console.error('Error fetching sources:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSource = async () => {
    setError('');
    setSaving(true);

    try {
      console.log('Adding source:', newSource);
      
      const response = await fetch('/api/admin/sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: newSource.type,
          name: newSource.name,
          url: newSource.url,
          enabled: newSource.enabled,
          config: {
            fetchInterval: newSource.fetchInterval,
            priority: newSource.priority,
            maxItems: newSource.maxItems,
            tags: [],
          },
        }),
      });

      const data = await response.json();
      console.log('Response:', response.status, data);

      if (!response.ok) {
        setError(data.error || 'Failed to add source');
        setSaving(false);
        return;
      }

      // Success!
      setIsAddModalOpen(false);
      fetchSources();
      
      // Reset form
      setNewSource({
        type: 'youtube',
        name: '',
        url: '',
        enabled: true,
        fetchInterval: 60,
        priority: 'medium',
        maxItems: 50,
      });
    } catch (error) {
      console.error('Error adding source:', error);
      setError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleEnabled = async (id: string, enabled: boolean) => {
    try {
      await fetch(`/api/admin/sources/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled }),
      });
      fetchSources();
    } catch (error) {
      console.error('Error toggling source:', error);
    }
  };

  const handleEdit = (source: Source) => {
    setEditingSource(source);
    setIsEditModalOpen(true);
  };

  const handleUpdateSource = async () => {
    if (!editingSource) return;
    
    setError('');
    setSaving(true);

    try {
      const response = await fetch(`/api/admin/sources/${editingSource._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editingSource.name,
          url: editingSource.url,
          enabled: editingSource.enabled,
          config: {
            fetchInterval: editingSource.config.fetchInterval,
            priority: editingSource.config.priority,
            maxItems: editingSource.config.maxItems,
            tags: editingSource.config.tags,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to update source');
        setSaving(false);
        return;
      }

      // Success!
      setIsEditModalOpen(false);
      setEditingSource(null);
      fetchSources();
    } catch (error) {
      console.error('Error updating source:', error);
      setError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this source and all its content?')) return;

    try {
      await fetch(`/api/admin/sources/${id}`, {
        method: 'DELETE',
      });
      fetchSources();
    } catch (error) {
      console.error('Error deleting source:', error);
    }
  };

  const handleFetchNow = async (id: string, name: string) => {
    if (!confirm(`Fetch content from "${name}" now?`)) return;

    try {
      const response = await fetch(`/api/admin/sources/${id}/fetch`, {
        method: 'POST',
      });
      const data = await response.json();
      
      if (response.ok) {
        alert(`✅ ${data.message}`);
        fetchSources(); // Refresh to show updated metadata
      } else {
        alert(`❌ Error: ${data.error}\n${data.details || ''}`);
      }
    } catch (error) {
      console.error('Error fetching:', error);
      alert('❌ Network error. Please try again.');
    }
  };

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'youtube': return '▶️';
      case 'reddit': return '🔴';
      case 'rss': return '📰';
      case 'x': return '❌';
      default: return '🌐';
    }
  };

  const getSourceColor = (type: string) => {
    switch (type) {
      case 'youtube': return 'secondary';
      case 'reddit': return 'danger';
      case 'rss': return 'primary';
      case 'x': return 'default';
      default: return 'default';
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading sources...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Content Sources</h1>
          <p className="text-default-600 mt-1">
            Manage where your content comes from
          </p>
        </div>
        <Button
          color="primary"
          onPress={() => setIsAddModalOpen(true)}
        >
          ➕ Add Source
        </Button>
      </div>

      {/* Sources List */}
      {sources.length === 0 ? (
        <Card>
          <CardBody className="text-center py-12">
            <div className="text-4xl mb-4">📡</div>
            <h3 className="text-xl font-semibold mb-2">No sources yet</h3>
            <p className="text-default-600 mb-4">
              Add your first content source to get started
            </p>
            <Button color="primary" onPress={() => setIsAddModalOpen(true)}>
              Add First Source
            </Button>
          </CardBody>
        </Card>
      ) : (
        <div className="grid gap-4">
          {sources.map((source) => (
            <Card key={source._id}>
              <CardBody className="flex flex-row items-center gap-4">
                {/* Source Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Chip
                      size="sm"
                      variant="flat"
                      color={getSourceColor(source.type) as any}
                      startContent={<span>{getSourceIcon(source.type)}</span>}
                    >
                      {source.type.toUpperCase()}
                    </Chip>
                    <h3 className="font-semibold">{source.name}</h3>
                  </div>
                  <p className="text-sm text-default-600 truncate">
                    {source.url}
                  </p>
                  <div className="flex gap-4 mt-2 text-xs text-default-500">
                    <span>📊 {source.metadata.totalFetched} items fetched</span>
                    <span>⏱️ Every {source.config.fetchInterval}min</span>
                    <span>🎯 Priority: {source.config.priority}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <Button
                    size="sm"
                    color="primary"
                    variant="flat"
                    onPress={() => handleFetchNow(source._id, source.name)}
                  >
                    🔄 Fetch Now
                  </Button>
                  <Button
                    size="sm"
                    color="default"
                    variant="flat"
                    onPress={() => handleEdit(source)}
                  >
                    ✏️ Edit
                  </Button>
                  <Switch
                    isSelected={source.enabled}
                    onValueChange={(enabled) => handleToggleEnabled(source._id, enabled)}
                    size="sm"
                  >
                    {source.enabled ? 'Enabled' : 'Disabled'}
                  </Switch>
                  <Button
                    size="sm"
                    color="danger"
                    variant="flat"
                    onPress={() => handleDelete(source._id)}
                  >
                    🗑️
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* Add Source Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        size="2xl"
      >
        <ModalContent>
          <ModalHeader>Add New Source</ModalHeader>
          <ModalBody className="gap-4">
            {error && (
              <div className="p-3 bg-danger/10 border border-danger/20 rounded-lg text-danger text-sm">
                {error}
              </div>
            )}

            <Select
              label="Source Type"
              selectedKeys={[newSource.type]}
              onSelectionChange={(keys) => {
                const type = Array.from(keys)[0] as any;
                setNewSource({ ...newSource, type });
              }}
            >
              <SelectItem key="youtube" startContent="▶️">YouTube Channel</SelectItem>
              <SelectItem key="reddit" startContent="🔴">Reddit</SelectItem>
              <SelectItem key="rss" startContent="📰">RSS Feed</SelectItem>
              <SelectItem key="x" startContent="❌">X/Twitter</SelectItem>
            </Select>

            <Input
              label="Display Name"
              placeholder="e.g., AI Explained"
              value={newSource.name}
              onValueChange={(value) => setNewSource({ ...newSource, name: value })}
              isRequired
            />

            <Input
              label="URL"
              placeholder={
                newSource.type === 'youtube' ? 'https://www.youtube.com/@channel' :
                newSource.type === 'reddit' ? 'https://www.reddit.com/r/subreddit' :
                newSource.type === 'rss' ? 'https://example.com/feed.xml' :
                'https://x.com/username'
              }
              value={newSource.url}
              onValueChange={(value) => setNewSource({ ...newSource, url: value })}
              isRequired
            />

            <div className="grid grid-cols-3 gap-3">
              <Input
                type="number"
                label="Fetch Interval (min)"
                value={String(newSource.fetchInterval)}
                onValueChange={(value) => setNewSource({ ...newSource, fetchInterval: Number(value) })}
                min={5}
              />

              <Select
                label="Priority"
                selectedKeys={[newSource.priority]}
                onSelectionChange={(keys) => {
                  const priority = Array.from(keys)[0] as any;
                  setNewSource({ ...newSource, priority });
                }}
              >
                <SelectItem key="low">Low</SelectItem>
                <SelectItem key="medium">Medium</SelectItem>
                <SelectItem key="high">High</SelectItem>
              </Select>

              <Input
                type="number"
                label="Max Items"
                value={String(newSource.maxItems)}
                onValueChange={(value) => setNewSource({ ...newSource, maxItems: Number(value) })}
                min={1}
                max={200}
              />
            </div>

            <Switch
              isSelected={newSource.enabled}
              onValueChange={(enabled) => setNewSource({ ...newSource, enabled })}
            >
              Enable immediately
            </Switch>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="light"
              onPress={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              color="primary"
              onPress={handleAddSource}
              isLoading={saving}
              isDisabled={!newSource.name || !newSource.url || saving}
            >
              Add Source
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Source Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingSource(null);
          setError('');
        }}
        size="2xl"
      >
        <ModalContent>
          <ModalHeader>Edit Source</ModalHeader>
          <ModalBody className="gap-4">
            {error && (
              <div className="p-3 bg-danger/10 border border-danger/20 rounded-lg text-danger text-sm">
                {error}
              </div>
            )}

            {editingSource && (
              <>
                <Select
                  label="Source Type"
                  selectedKeys={[editingSource.type]}
                  isDisabled
                  description="Source type cannot be changed after creation"
                >
                  <SelectItem key="youtube" startContent="▶️">YouTube Channel</SelectItem>
                  <SelectItem key="reddit" startContent="🔴">Reddit</SelectItem>
                  <SelectItem key="rss" startContent="📰">RSS Feed</SelectItem>
                  <SelectItem key="x" startContent="❌">X/Twitter</SelectItem>
                </Select>

                <Input
                  label="Display Name"
                  placeholder="e.g., AI Explained"
                  value={editingSource.name}
                  onValueChange={(value) => setEditingSource({ ...editingSource, name: value })}
                  isRequired
                />

                <Input
                  label="URL"
                  placeholder={
                    editingSource.type === 'youtube' ? 'https://www.youtube.com/@channel' :
                    editingSource.type === 'reddit' ? 'https://www.reddit.com/r/subreddit' :
                    editingSource.type === 'rss' ? 'https://example.com/feed.xml' :
                    'https://x.com/username'
                  }
                  value={editingSource.url}
                  onValueChange={(value) => setEditingSource({ ...editingSource, url: value })}
                  isRequired
                />

                <div className="grid grid-cols-3 gap-3">
                  <Input
                    type="number"
                    label="Fetch Interval (min)"
                    value={String(editingSource.config.fetchInterval)}
                    onValueChange={(value) => setEditingSource({
                      ...editingSource,
                      config: { ...editingSource.config, fetchInterval: Number(value) }
                    })}
                    min={5}
                  />

                  <Select
                    label="Priority"
                    selectedKeys={[editingSource.config.priority]}
                    onSelectionChange={(keys) => {
                      const priority = Array.from(keys)[0] as any;
                      setEditingSource({
                        ...editingSource,
                        config: { ...editingSource.config, priority }
                      });
                    }}
                  >
                    <SelectItem key="low">Low</SelectItem>
                    <SelectItem key="medium">Medium</SelectItem>
                    <SelectItem key="high">High</SelectItem>
                  </Select>

                  <Input
                    type="number"
                    label="Max Items"
                    value={String(editingSource.config.maxItems)}
                    onValueChange={(value) => setEditingSource({
                      ...editingSource,
                      config: { ...editingSource.config, maxItems: Number(value) }
                    })}
                    min={1}
                    max={200}
                  />
                </div>

                <Switch
                  isSelected={editingSource.enabled}
                  onValueChange={(enabled) => setEditingSource({ ...editingSource, enabled })}
                >
                  Enabled
                </Switch>
              </>
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              variant="light"
              onPress={() => {
                setIsEditModalOpen(false);
                setEditingSource(null);
                setError('');
              }}
            >
              Cancel
            </Button>
            <Button
              color="primary"
              onPress={handleUpdateSource}
              isLoading={saving}
              isDisabled={!editingSource || !editingSource.name || !editingSource.url || saving}
            >
              Update Source
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
