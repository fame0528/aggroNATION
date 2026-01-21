/**
 * Admin Session Check API Route
 * 
 * GET /api/admin/auth/me
 * Returns current admin user if authenticated
 * 
 * @module app/api/admin/auth/me
 * @created 2026-01-20
 */

import { NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/auth/admin';

export async function GET() {
  try {
    const user = await getAdminUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        lastLogin: user.lastLogin,
      },
    });
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
