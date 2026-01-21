/**
 * Admin Dashboard Layout
 * 
 * Protected layout for admin pages
 * Includes navigation and authentication check
 * 
 * @module app/admin/layout
 * @created 2026-01-20
 */

import { getAdminUser } from '@/lib/auth/admin';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check authentication (login page handles its own layout)
  const user = await getAdminUser();

  // If not authenticated, just show children (login page)
  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Navbar */}
      <nav className="border-b border-divider bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Aggronation Admin
              </h1>
            </div>

            {/* User Info */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-default-600">
                {user.username}
              </span>
              <form action="/api/admin/auth/logout" method="POST">
                <button
                  type="submit"
                  className="text-sm text-danger hover:underline"
                >
                  Logout
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
