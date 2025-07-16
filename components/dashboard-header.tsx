import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Bell, Share2, Settings } from 'lucide-react';
import type { PageType } from '@/contexts/dashboard-context';

interface Props {
  currentPage: PageType;
  onPageChange: (p: PageType) => void;
}

const pageNames = {
  overview: 'Overview',
  repos: 'Trending Repositories',
  models: 'AI Models',
  news: 'AI News',
  videos: 'AI Videos',
};

import { toast } from '@/hooks/use-toast';
import { useState } from 'react';

// No notifications unless connected to a real API.
const mockNotifications: any[] = [];

export function DashboardHeader({ currentPage, onPageChange }: Props) {
  // Search handler (searches all sources)
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const input = form.elements.namedItem('aggro-search') as HTMLInputElement;
    const query = input.value.trim();
    if (query) {
      window.location.href = `/search?q=${encodeURIComponent(query)}`;
    }
  };

  // Share functionality
  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: document.title,
          url: window.location.href,
        })
        .then(() => toast({ title: 'Link shared!' }))
        .catch(() => toast({ title: 'Share cancelled.' }));
    } else {
      try {
        if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
          navigator.clipboard
            .writeText(window.location.href)
            .then(() => toast({ title: 'Link copied to clipboard!' }))
            .catch(() => toast({ title: 'Failed to copy link.' }));
        } else {
          // Fallback for unsupported browsers
          const textArea = document.createElement('textarea');
          textArea.value = window.location.href;
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          try {
            document.execCommand('copy');
            toast({ title: 'Link copied to clipboard!' });
          } catch (err) {
            toast({ title: 'Copy to clipboard is not supported in this browser' });
          }
          document.body.removeChild(textArea);
        }
      } catch (err) {
        toast({ title: 'Copy to clipboard is not supported in this browser' });
      }
    }
  };

  // Notification dropdown state
  const [showNotifications, setShowNotifications] = useState(false);
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-800 bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-gray-900/60">
      <div className="w-full px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <SidebarTrigger className="text-gray-400 hover:text-white" />
            <div>
              <h1 className="text-xl font-bold text-white">{pageNames[currentPage]}</h1>
              <p className="text-sm text-gray-400">aggroNATION Dashboard</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <form className="relative hidden md:block" onSubmit={handleSearch}>
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                name="aggro-search"
                placeholder="Search all sources..."
                className="pl-10 w-80 bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-cyan-500"
              />
            </form>

            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white hidden sm:flex"
              onClick={handleShare}
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>

            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white relative"
                onClick={() => setShowNotifications((v) => !v)}
                aria-label="Show notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-cyan-500 rounded-full"></span>
              </Button>
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-gray-800 border border-gray-700 rounded-md shadow-lg z-50">
                  <div className="p-4 border-b border-gray-700 font-semibold text-white">
                    Notifications
                  </div>
                  <ul className="max-h-64 overflow-y-auto divide-y divide-gray-700">
                    {mockNotifications.length === 0 ? (
                      <li className="p-4 text-gray-400">No notifications</li>
                    ) : (
                      mockNotifications.map((n) => (
                        <li key={n.id} className="p-4 hover:bg-gray-700 cursor-pointer">
                          <div className="font-medium text-cyan-400">{n.title}</div>
                          <div className="text-gray-300 text-sm">{n.description}</div>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
              onClick={() => (window.location.href = '/settings')}
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
