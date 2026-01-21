/**
 * Admin Dashboard Home
 * 
 * Overview of sources and recent activity
 * 
 * @module app/admin/page
 * @created 2026-01-20
 */

import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardBody } from '@heroui/card';
import { Button } from '@heroui/button';
import { getAdminUser } from '@/lib/auth/admin';

export default async function AdminDashboard() {
  const user = await getAdminUser();
  
  if (!user) {
    redirect('/admin/login');
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-default-600 mt-1">
            Manage your content sources and aggregation
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardBody className="text-center p-6">
            <div className="text-3xl font-bold text-primary">0</div>
            <div className="text-sm text-default-600 mt-1">Active Sources</div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="text-center p-6">
            <div className="text-3xl font-bold text-secondary">0</div>
            <div className="text-sm text-default-600 mt-1">Total Content</div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="text-center p-6">
            <div className="text-3xl font-bold text-success">0</div>
            <div className="text-sm text-default-600 mt-1">Fetched Today</div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="text-center p-6">
            <div className="text-3xl font-bold text-warning">0</div>
            <div className="text-sm text-default-600 mt-1">Errors</div>
          </CardBody>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Quick Actions</h2>
        </CardHeader>
        <CardBody className="gap-3">
          <Link href="/admin/sources">
            <Button color="primary" className="w-full sm:w-auto">
              📡 Manage Sources
            </Button>
          </Link>
          <Button color="secondary" className="w-full sm:w-auto" isDisabled>
            📊 View Analytics (Coming Soon)
          </Button>
          <Button color="default" className="w-full sm:w-auto" isDisabled>
            ⚙️ Settings (Coming Soon)
          </Button>
        </CardBody>
      </Card>

      {/* Getting Started */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">🚀 Getting Started</h2>
        </CardHeader>
        <CardBody className="gap-3">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-bold flex-shrink-0 mt-0.5">
              1
            </div>
            <div>
              <h3 className="font-semibold">Add Your First Source</h3>
              <p className="text-sm text-default-600">
                Go to Sources and add a YouTube channel, RSS feed, Reddit sub, or X account
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-bold flex-shrink-0 mt-0.5">
              2
            </div>
            <div>
              <h3 className="font-semibold">Configure Fetch Settings</h3>
              <p className="text-sm text-default-600">
                Set how often content should be fetched and other preferences
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-bold flex-shrink-0 mt-0.5">
              3
            </div>
            <div>
              <h3 className="font-semibold">Monitor & Optimize</h3>
              <p className="text-sm text-default-600">
                Track fetch success, manage errors, and fine-tune your sources
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
