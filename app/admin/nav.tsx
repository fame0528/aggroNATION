import Link from 'next/link';
import React from 'react';

/**
 * Navigation component for admin dashboard.
 */
export default function AdminNav(): React.ReactElement {
  return (
    <nav className="mb-8 flex gap-6">
      <Link href="/admin" className="text-cyan-400 hover:underline">
        Dashboard
      </Link>
      <Link href="/admin/users" className="text-cyan-400 hover:underline">
        Users
      </Link>
      <Link href="/admin/analytics" className="text-cyan-400 hover:underline">
        Analytics
      </Link>
    </nav>
  );
}
