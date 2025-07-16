import { cookies } from "next/headers";
import { NextRequest } from "next/server";

/**
 * User session object interface.
 */
export interface UserSession {
  name: string;
  email: string;
  [key: string]: any;
}

/**
 * Name of the session cookie (configurable via env or fallback).
 */
const SESSION_COOKIE_NAME =
  process.env.SESSION_COOKIE_NAME || "__Secure-next-auth.session-token";

/**
 * Get the current user session from cookies (server/client safe).
 * In production, use JWT or NextAuth for secure session management.
 * @param req Optional NextRequest (for Edge API routes)
 * @returns UserSession object or null if not authenticated/invalid
 */
export async function getSession(
  req?: NextRequest
): Promise<UserSession | null> {
  let sessionCookie;
  if (req && "cookies" in req && typeof req.cookies.get === "function") {
    sessionCookie = req.cookies.get(SESSION_COOKIE_NAME);
  } else {
    const cookieStore = await cookies();
    sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
  }
  if (!sessionCookie) return null;
  try {
    return JSON.parse(sessionCookie.value) as UserSession;
  } catch (err) {
    // In production, use a logger (e.g., pino, winston) instead of console.error
    if (process.env.NODE_ENV !== "production") {
      console.error("Failed to parse session cookie:", err);
    }
    return null;
  }
}

/**
 * Set the user session cookie (for demo only; use JWT/NextAuth in production).
 * @param res The Next.js API response object
 * @param user The user session object
 */
export function setSession(res: any, user: UserSession) {
  // In production, use JWT or NextAuth for secure session management.
  // Set secure, HttpOnly, and SameSite=Strict for best security.
  const isProd = process.env.NODE_ENV === "production";
  const cookie = `${SESSION_COOKIE_NAME}=${encodeURIComponent(
    JSON.stringify(user)
  )}; Path=/; HttpOnly; SameSite=Strict; Max-Age=604800${
    isProd ? "; Secure" : ""
  }`;
  res.setHeader("Set-Cookie", cookie);
}

/**
 * Clear the user session cookie (for demo only; use JWT/NextAuth in production).
 * @param res The Next.js API response object
 */
export function clearSession(res: any) {
  // Remove the session cookie by setting Max-Age=0
  const isProd = process.env.NODE_ENV === "production";
  const cookie = `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${
    isProd ? "; Secure" : ""
  }`;
  res.setHeader("Set-Cookie", cookie);
}
