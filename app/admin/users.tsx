import clientPromise from '@/lib/db/mongodb';
import React from 'react';
import AdminNav from './nav';

/**
 * User type for admin users page.
 */
export type User = {
  _id: string;
  name: string;
  email: string;
  createdAt?: string;
};

/**
 * Admin users page. Lists all users in the database.
 */
export default async function AdminUsersPage(): Promise<React.ReactElement> {
  let users: User[] = [];
  let error: string | null = null;
  try {
    const client = await clientPromise;
    const db = client.db();
    users = (await db.collection('users').find({}).toArray()).map(
      (user: Record<string, unknown>) => ({
        _id: typeof user._id === 'object' && user._id ? String(user._id) : '',
        name: typeof user.name === 'string' ? user.name : '',
        email: typeof user.email === 'string' ? user.email : '',
        createdAt: typeof user.createdAt === 'string' ? user.createdAt : '',
      }),
    );
  } catch (err) {
    error = (err as Error).message || 'Failed to fetch users';
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-6">All Users</h1>
      <AdminNav />
      {error && <p className="text-red-400">{error}</p>}
      <table className="w-full bg-gray-800 rounded shadow-md">
        <thead>
          <tr>
            <th className="p-3 text-left">Name</th>
            <th className="p-3 text-left">Email</th>
            <th className="p-3 text-left">Created</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id} className="border-b border-gray-700">
              <td className="p-3">{user.name}</td>
              <td className="p-3">{user.email}</td>
              <td className="p-3">
                {user.createdAt ? new Date(user.createdAt).toLocaleString() : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
