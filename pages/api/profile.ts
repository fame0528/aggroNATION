import type { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient } from 'mongodb';

const uri =
  process.env.MONGODB_URI || 'mongodb+srv://fame:Sthcnh4525!@aggronation.b2xoypd.mongodb.net/';

/**
 * API route for updating user profile.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  try {
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db();
    const users = db.collection('users');
    // For demo: update by email (in production, use user ID from session)
    await users.updateOne({ email }, { $set: { name, email } });
    await client.close();
    return res.status(200).json({ message: 'Profile updated' });
  } catch (err) {
    return res.status(500).json({ message: (err as Error).message || 'Update failed' });
  }
}
