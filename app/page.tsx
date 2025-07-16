'use client';

import { useState, useEffect } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { DashboardContent } from '@/components/dashboard-content';
import { UserProvider } from '@/contexts/user-context';
import { DataProvider } from '@/contexts/data-context';
import { DashboardProvider } from '@/contexts/dashboard-context';
import { RealTimeDataProvider } from '@/contexts/real-time-data-context';
import { AuthProvider } from '@/contexts/auth-context';

/**
 * Home page for aggroNATION dashboard.
 */
export default function HomePage(): React.ReactElement {
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [hasNewUpdates, setHasNewUpdates] = useState<boolean>(false);

  useEffect(() => {
    // Simulate periodic updates
    const interval = setInterval(() => {
      setLastUpdate(new Date());
      setHasNewUpdates(true);

      // Reset the new updates flag after a short delay
      setTimeout(() => setHasNewUpdates(false), 3000);
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <AuthProvider>
      <UserProvider>
        <DataProvider>
          <DashboardProvider>
            <RealTimeDataProvider>
              <SidebarProvider>
                <div className="flex min-h-screen bg-gray-900">
                  <AppSidebar />
                  <DashboardContent lastUpdate={lastUpdate} hasNewUpdates={hasNewUpdates} />
                </div>
              </SidebarProvider>
            </RealTimeDataProvider>
          </DashboardProvider>
        </DataProvider>
      </UserProvider>
    </AuthProvider>
  );
}
