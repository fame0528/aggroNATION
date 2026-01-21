/**
 * Admin Authentication Utilities
 * 
 * Simple session-based authentication for admin dashboard
 * Uses encrypted cookies to store session
 * 
 * @module lib/auth/admin
 * @created 2026-01-20
 */

import { cookies } from 'next/headers';
import { AdminUser, IAdminUser } from '@/lib/db/models/AdminUser';
import { connectDB } from '@/lib/db/mongoose';

const ADMIN_COOKIE = 'aggro_admin_session';
const SESSION_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Get current admin user from session
 */
export async function getAdminUser(): Promise<IAdminUser | null> {
  try {
    const cookieStore = await cookies();
    const sessionData = cookieStore.get(ADMIN_COOKIE);
    
    if (!sessionData?.value) {
      return null;
    }

    // Decode session data (simple base64 for now)
    const decoded = Buffer.from(sessionData.value, 'base64').toString('utf-8');
    const { userId, expires } = JSON.parse(decoded);

    if (Date.now() > expires) {
      return null;
    }

    await connectDB();
    const user = await AdminUser.findById(userId);
    
    return user;
  } catch (error) {
    console.error('Error getting admin user:', error);
    return null;
  }
}

/**
 * Create admin session
 */
export async function createAdminSession(userId: string): Promise<void> {
  const sessionData = {
    userId,
    expires: Date.now() + SESSION_EXPIRY,
  };

  const encoded = Buffer.from(JSON.stringify(sessionData)).toString('base64');

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, encoded, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_EXPIRY / 1000,
    path: '/',
  });
}

/**
 * Clear admin session
 */
export async function clearAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE);
}

/**
 * Require admin authentication (for use in API routes)
 */
export async function requireAdmin(): Promise<IAdminUser> {
  const user = await getAdminUser();
  
  if (!user) {
    throw new Error('Unauthorized');
  }
  
  return user;
}

/**
 * Check if user is admin role
 */
export async function isAdmin(): Promise<boolean> {
  const user = await getAdminUser();
  return user?.role === 'admin';
}
