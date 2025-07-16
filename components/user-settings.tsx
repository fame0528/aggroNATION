'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  SettingsIcon,
  BellIcon,
  PaletteIcon,
  ShieldIcon,
  DatabaseIcon,
  RssIcon,
  UserIcon,
  MailIcon,
  SmartphoneIcon,
  SaveIcon,
  CheckIcon,
} from 'lucide-react';

interface UserPreferences {
  notifications: {
    email: boolean;
    push: boolean;
    newArticles: boolean;
    weeklyDigest: boolean;
    feedErrors: boolean;
  };
  display: {
    theme: 'light' | 'dark' | 'system';
    articlesPerPage: number;
    showImages: boolean;
    compactView: boolean;
    autoRefresh: boolean;
  };
  content: {
    categories: string[];
    languages: string[];
    excludeKeywords: string[];
    minReadTime: number;
    maxReadTime: number;
  };
  privacy: {
    analytics: boolean;
    publicProfile: boolean;
    shareReadingActivity: boolean;
  };
}

const defaultPreferences: UserPreferences = {
  notifications: {
    email: true,
    push: false,
    newArticles: false,
    weeklyDigest: true,
    feedErrors: true,
  },
  display: {
    theme: 'system',
    articlesPerPage: 20,
    showImages: true,
    compactView: false,
    autoRefresh: true,
  },
  content: {
    categories: [],
    languages: ['en'],
    excludeKeywords: [],
    minReadTime: 0,
    maxReadTime: 60,
  },
  privacy: {
    analytics: true,
    publicProfile: false,
    shareReadingActivity: false,
  },
};

export default function UserSettings({ userId = 'default' }: { userId?: string }) {
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  useEffect(() => {
    loadPreferences();
  }, [userId]);

  const loadPreferences = async () => {
    try {
      // Load user preferences (mock for now)
      setPreferences(defaultPreferences);
      setEmail('user@example.com');
      setName('John Doe');
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    setSaving(true);
    try {
      // Save preferences to API
      console.log('Saving preferences:', preferences);

      // Mock successful save
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Error saving preferences:', error);
    } finally {
      setSaving(false);
    }
  };

  const updatePreferences = (section: keyof UserPreferences, key: string, value: any) => {
    setPreferences((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
  };

  const toggleArrayItem = (section: keyof UserPreferences, key: string, item: string) => {
    setPreferences((prev) => {
      const currentArray = (prev[section] as any)[key] as string[];
      const newArray = currentArray.includes(item)
        ? currentArray.filter((i) => i !== item)
        : [...currentArray, item];

      return {
        ...prev,
        [section]: {
          ...prev[section],
          [key]: newArray,
        },
      };
    });
  };

  const availableCategories = [
    'Machine Learning',
    'AI Research',
    'Computer Vision',
    'Natural Language Processing',
    'Robotics',
    'Data Science',
    'Deep Learning',
    'Neural Networks',
    'AGI',
    'Ethics',
  ];

  const availableLanguages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ru', name: 'Russian' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'zh', name: 'Chinese' },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <SettingsIcon className="w-6 h-6" />
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SettingsIcon className="w-6 h-6" />
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>
        <Button onClick={savePreferences} disabled={saving} className="flex items-center gap-2">
          {saved ? (
            <>
              <CheckIcon className="w-4 h-4" />
              Saved!
            </>
          ) : (
            <>
              <SaveIcon className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="display">Display</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="w-5 h-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Display Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your display name"
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                />
              </div>
              <div className="pt-4">
                <Button variant="outline">Change Password</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BellIcon className="w-5 h-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <MailIcon className="w-4 h-4" />
                  Email Notifications
                </h3>
                <div className="space-y-3 ml-6">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email-notifications">Enable email notifications</Label>
                    <Switch
                      id="email-notifications"
                      checked={preferences.notifications.email}
                      onCheckedChange={(checked) =>
                        updatePreferences('notifications', 'email', checked)
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="new-articles">New articles from subscribed feeds</Label>
                    <Switch
                      id="new-articles"
                      checked={preferences.notifications.newArticles}
                      onCheckedChange={(checked) =>
                        updatePreferences('notifications', 'newArticles', checked)
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="weekly-digest">Weekly digest</Label>
                    <Switch
                      id="weekly-digest"
                      checked={preferences.notifications.weeklyDigest}
                      onCheckedChange={(checked) =>
                        updatePreferences('notifications', 'weeklyDigest', checked)
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="feed-errors">Feed errors and issues</Label>
                    <Switch
                      id="feed-errors"
                      checked={preferences.notifications.feedErrors}
                      onCheckedChange={(checked) =>
                        updatePreferences('notifications', 'feedErrors', checked)
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <SmartphoneIcon className="w-4 h-4" />
                  Push Notifications
                </h3>
                <div className="space-y-3 ml-6">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="push-notifications">Enable push notifications</Label>
                    <Switch
                      id="push-notifications"
                      checked={preferences.notifications.push}
                      onCheckedChange={(checked) =>
                        updatePreferences('notifications', 'push', checked)
                      }
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="display">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PaletteIcon className="w-5 h-5" />
                Display Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="theme">Theme</Label>
                <Select
                  value={preferences.display.theme}
                  onValueChange={(value) => updatePreferences('display', 'theme', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="articles-per-page">Articles per page</Label>
                <Select
                  value={preferences.display.articlesPerPage.toString()}
                  onValueChange={(value) =>
                    updatePreferences('display', 'articlesPerPage', parseInt(value))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-images">Show article images</Label>
                  <Switch
                    id="show-images"
                    checked={preferences.display.showImages}
                    onCheckedChange={(checked) =>
                      updatePreferences('display', 'showImages', checked)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="compact-view">Compact view</Label>
                  <Switch
                    id="compact-view"
                    checked={preferences.display.compactView}
                    onCheckedChange={(checked) =>
                      updatePreferences('display', 'compactView', checked)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-refresh">Auto-refresh feeds</Label>
                  <Switch
                    id="auto-refresh"
                    checked={preferences.display.autoRefresh}
                    onCheckedChange={(checked) =>
                      updatePreferences('display', 'autoRefresh', checked)
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RssIcon className="w-5 h-5" />
                Content Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-base font-semibold">Preferred Categories</Label>
                <p className="text-sm text-gray-500 mb-3">Select categories you're interested in</p>
                <div className="flex flex-wrap gap-2">
                  {availableCategories.map((category) => (
                    <Badge
                      key={category}
                      variant={
                        preferences.content.categories.includes(category) ? 'default' : 'outline'
                      }
                      className="cursor-pointer"
                      onClick={() => toggleArrayItem('content', 'categories', category)}
                    >
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-base font-semibold">Languages</Label>
                <p className="text-sm text-gray-500 mb-3">Select preferred content languages</p>
                <div className="flex flex-wrap gap-2">
                  {availableLanguages.map((lang) => (
                    <Badge
                      key={lang.code}
                      variant={
                        preferences.content.languages.includes(lang.code) ? 'default' : 'outline'
                      }
                      className="cursor-pointer"
                      onClick={() => toggleArrayItem('content', 'languages', lang.code)}
                    >
                      {lang.name}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="min-read-time">Minimum read time (minutes)</Label>
                  <Input
                    id="min-read-time"
                    type="number"
                    value={preferences.content.minReadTime}
                    onChange={(e) =>
                      updatePreferences('content', 'minReadTime', parseInt(e.target.value) || 0)
                    }
                    min="0"
                  />
                </div>
                <div>
                  <Label htmlFor="max-read-time">Maximum read time (minutes)</Label>
                  <Input
                    id="max-read-time"
                    type="number"
                    value={preferences.content.maxReadTime}
                    onChange={(e) =>
                      updatePreferences('content', 'maxReadTime', parseInt(e.target.value) || 60)
                    }
                    min="0"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldIcon className="w-5 h-5" />
                Privacy Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="analytics">Allow analytics</Label>
                    <p className="text-sm text-gray-500">
                      Help us improve the service with anonymous usage data
                    </p>
                  </div>
                  <Switch
                    id="analytics"
                    checked={preferences.privacy.analytics}
                    onCheckedChange={(checked) =>
                      updatePreferences('privacy', 'analytics', checked)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="public-profile">Public profile</Label>
                    <p className="text-sm text-gray-500">
                      Make your profile visible to other users
                    </p>
                  </div>
                  <Switch
                    id="public-profile"
                    checked={preferences.privacy.publicProfile}
                    onCheckedChange={(checked) =>
                      updatePreferences('privacy', 'publicProfile', checked)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="share-activity">Share reading activity</Label>
                    <p className="text-sm text-gray-500">Allow others to see what you're reading</p>
                  </div>
                  <Switch
                    id="share-activity"
                    checked={preferences.privacy.shareReadingActivity}
                    onCheckedChange={(checked) =>
                      updatePreferences('privacy', 'shareReadingActivity', checked)
                    }
                  />
                </div>
              </div>

              <div className="pt-4 border-t">
                <h3 className="font-semibold text-red-600 mb-2">Danger Zone</h3>
                <div className="space-y-2">
                  <Button variant="outline" className="text-red-600 border-red-600 hover:bg-red-50">
                    Export Data
                  </Button>
                  <Button variant="outline" className="text-red-600 border-red-600 hover:bg-red-50">
                    Delete Account
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
