import type { Metadata } from 'next';
import { Card, CardContent } from '@/components/ui/card';
import { SettingsForm } from '@/components/settings-form';

export const metadata: Metadata = {
  title: 'Settings | aggroNATION Dashboard',
  description: 'Manage your aggroNATION dashboard preferences and account settings.',
};

/**
 * Settings page for user dashboard preferences and account settings.
 * Fixed routing issue - moved from app/settings.tsx to app/settings/page.tsx
 */
export default function SettingsPage(): React.ReactElement {
  return (
    <div className="flex flex-col flex-1 min-h-screen w-full bg-gray-900 p-6">
      <div className="w-full max-w-2xl mx-auto py-12">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-8">
            <h1 className="text-2xl font-bold text-white mb-4">Settings</h1>
            <p className="text-gray-400 mb-8">
              Manage your dashboard preferences and account settings below.
            </p>
            <SettingsForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
