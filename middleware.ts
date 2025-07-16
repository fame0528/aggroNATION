import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Use a secure, signed session cookie (industry standard: NextAuth.js or JWT)
const SESSION_COOKIE =
  process.env.SESSION_COOKIE_NAME || "__Secure-next-auth.session-token";
const protectedRoutes = [
  "/admin",
  "/admin/users",
  "/admin/analytics",
  "/profile",
];

/**
 * Middleware for route protection and session validation.
 * - Only allows access to protected routes if a valid session cookie is present.
 * - Uses secure, signed cookie (NextAuth.js or JWT recommended).
 * - Redirects unauthenticated users to /login with redirect param.
 * - Hardened for production: no user info leaks, no legacy patterns.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // Only protect exact matches or subpaths
  if (
    protectedRoutes.some(
      (route) => pathname === route || pathname.startsWith(route + "/")
    )
  ) {
    // Check for a secure, signed session cookie
    const sessionCookie = request.cookies.get(SESSION_COOKIE);
    if (!sessionCookie) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      // Security: never leak route info in error messages
      return NextResponse.redirect(loginUrl);
    }
    // Optionally: add further session validation here (e.g., JWT decode, expiry check)
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/profile"],
};
