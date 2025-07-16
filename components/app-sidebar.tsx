'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import {
  Activity,
  Github,
  Brain,
  FileText,
  Newspaper,
  Settings,
  Heart,
  Zap,
  TrendingUp,
  Star,
  Youtube,
  User,
  LogOut,
  LogIn,
  Cpu,
  Calendar,
} from 'lucide-react';
import { useCategoryContext } from '@/contexts/category-context';
import { useDashboardContext } from '@/contexts/dashboard-context';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface AppSidebarProps {
  currentPage?: string;
  onPageChange?: (page: string) => void;
}

const navigationItems = [
  {
    title: 'Overview',
    page: 'overview',
    icon: Activity,
    badge: 'Live',
  },
  {
    title: 'Repos',
    page: 'repos',
    icon: Star,
    badge: '🔥',
  },
  {
    title: 'Models',
    page: 'models',
    icon: Cpu,
    badge: 'New',
  },
  {
    title: 'News',
    page: 'news',
    icon: Newspaper,
    badge: 'Fresh',
  },
  {
    title: 'Videos',
    page: 'videos',
    icon: Youtube,
    badge: '🎥',
  },
];

export function AppSidebar(props: AppSidebarProps) {
  const { currentPage, setCurrentPage } = useDashboardContext();
  const { selectedCategory, setSelectedCategory } = useCategoryContext();
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };
  return (
    <Sidebar className="border-r border-gray-800">
      <SidebarHeader className="p-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-white">aggroNATION</h2>
            <p className="text-xs text-gray-400">v2.0.1</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-400 uppercase text-xs font-semibold">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    className={`text-gray-300 hover:text-white hover:bg-gray-800 cursor-pointer ${
                      currentPage === item.page ? 'bg-gray-800 text-white' : ''
                    }`}
                    onClick={() => setCurrentPage(item.page as any)}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center space-x-3">
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
                      </div>
                      <span className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded-full">
                        {item.badge}
                      </span>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="bg-gray-800" />

        {/* Removed Smart Categories section */}
      </SidebarContent>

      <SidebarFooter className="p-4">
        {isAuthenticated ? (
          <>
            <div className="flex items-center space-x-3 mb-4 p-3 bg-gray-800/50 rounded-lg">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-cyan-500 text-white">
                  {user?.firstName?.[0] || user?.username?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">
                  {user?.firstName && user?.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : user?.username || 'User'}
                </div>
                <div className="text-xs text-gray-500 truncate">{user?.email}</div>
              </div>
            </div>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  className="text-gray-300 hover:text-white hover:bg-gray-800"
                  onClick={() => router.push('/profile')}
                >
                  <User className="w-4 h-4" />
                  <span>Profile</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  className="text-gray-300 hover:text-white hover:bg-gray-800"
                  onClick={() => router.push('/settings')}
                >
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  className="text-gray-300 hover:text-white hover:bg-gray-800"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </>
        ) : (
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                className="text-gray-300 hover:text-white hover:bg-gray-800"
                onClick={() => router.push('/login')}
              >
                <LogIn className="w-4 h-4" />
                <span>Login</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
        <div className="mt-4 text-xs text-gray-500 text-center">
          Made with ❤️ for curious makers
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
