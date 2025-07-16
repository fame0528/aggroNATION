import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * API route for user logout.
 */
export default function handler(req: NextApiRequest, res: NextApiResponse): void {
  res.setHeader('Set-Cookie', `user=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
  res.status(200).json({ message: 'Logged out' });
}
