import clientPromise from '@/lib/db/mongodb';
import React from 'react';
import AdminNav from './nav';

/**
 * Collection metric type for admin dashboard.
 */
export type CollectionMetric = {
  name: string;
  count: number;
};

/**
 * Metrics type for admin dashboard.
 */
export type Metrics = {
  collections: CollectionMetric[];
};

/**
 * Admin dashboard page. Shows database collection metrics.
 */
export default async function AdminPage(): Promise<React.ReactElement> {
  let metrics: Metrics | null = null;
  let error: string | null = null;
  try {
    const client = await clientPromise;
    const db = client.db();
    const collections = await db.listCollections().toArray();
    const stats: CollectionMetric[] = await Promise.all(
      collections.map(async (col: { name: string }) => {
        const count = await db.collection(col.name).countDocuments();
        return { name: col.name, count };
      }),
    );
    metrics = { collections: stats };
  } catch (err) {
    error = (err as Error).message || 'Failed to fetch metrics';
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <AdminNav />
      {error && <p className="text-red-400">{error}</p>}
      {metrics && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Database Collections</h2>
          <ul className="space-y-2">
            {metrics.collections.map((col) => (
              <li key={col.name} className="flex justify-between border-b border-gray-700 py-2">
                <span>{col.name}</span>
                <span className="font-mono">{col.count}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
