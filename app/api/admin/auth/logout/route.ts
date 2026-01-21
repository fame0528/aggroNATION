/**
 * Admin Logout API Route
 * 
 * POST /api/admin/auth/logout
 * Clears admin session
 * 
 * @module app/api/admin/auth/logout
 * @created 2026-01-20
 */

import { NextResponse } from 'next/server';
import { clearAdminSession } from '@/lib/auth/admin';

export async function POST() {
  try {
    await clearAdminSession();

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
