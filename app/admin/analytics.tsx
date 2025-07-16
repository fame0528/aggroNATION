import clientPromise from '@/lib/db/mongodb';
import React from 'react';
import AdminNav from './nav';

/**
 * Analytics page for admin dashboard. Shows user count and recent users.
 */

/**
 * User type for admin analytics.
 */
export type User = {
  _id: string;
  name: string;
  email: string;
  createdAt?: string;
};

/**
 * Analytics page for admin dashboard. Shows user count and recent users.
 */
export default async function AdminAnalyticsPage(): Promise<React.ReactElement> {
  let userCount = 0;
  let recentUsers: User[] = [];
  let error: string | null = null;
  try {
    const client = await clientPromise;
    const db = client.db();
    userCount = await db.collection('users').countDocuments();
    recentUsers = (
      await db.collection('users').find({}).sort({ createdAt: -1 }).limit(5).toArray()
    ).map((user: Record<string, unknown>) => ({
      _id: typeof user._id === 'object' && user._id ? String(user._id) : '',
      name: typeof user.name === 'string' ? user.name : '',
      email: typeof user.email === 'string' ? user.email : '',
      createdAt: typeof user.createdAt === 'string' ? user.createdAt : '',
    }));
  } catch (err) {
    error = (err as Error).message || 'Failed to fetch analytics';
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-6">Admin Analytics</h1>
      <AdminNav />
      {error && <p className="text-red-400">{error}</p>}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">User Count</h2>
        <div className="text-4xl font-bold">{userCount}</div>
      </div>
      <div>
        <h2 className="text-xl font-semibold mb-2">Most Recent Users</h2>
        <ul className="space-y-2">
          {recentUsers.map((user) => (
            <li key={user._id} className="flex justify-between border-b border-gray-700 py-2">
              <span>
                {user.name} ({user.email})
              </span>
              <span className="font-mono text-xs">
                {user.createdAt ? new Date(user.createdAt).toLocaleString() : '-'}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
