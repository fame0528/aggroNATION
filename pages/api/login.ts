import type { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';

const uri =
  process.env.MONGODB_URI || 'mongodb+srv://fame:Sthcnh4525!@aggronation.b2xoypd.mongodb.net/';

/**
 * API route for user login.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  try {
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db();
    const users = db.collection('users');
    const user = await users.findOne({ email });
    if (!user) {
      await client.close();
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const valid = await bcrypt.compare(password, user.password);
    await client.close();
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' });
    // For demo: set a cookie for session. In production, use JWT or NextAuth.
    res.setHeader(
      'Set-Cookie',
      `user=${JSON.stringify({ name: user.name, email: user.email })}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`,
    );
    return res
      .status(200)
      .json({ message: 'Login successful', user: { name: user.name, email: user.email } });
  } catch (err) {
    return res.status(500).json({ message: (err as Error).message || 'Login failed' });
  }
}
