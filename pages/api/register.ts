import type { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';

const uri =
  process.env.MONGODB_URI || 'mongodb+srv://fame:Sthcnh4525!@aggronation.b2xoypd.mongodb.net/';

/**
 * API route for user registration.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  try {
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db();
    const users = db.collection('users');
    const existing = await users.findOne({ email });
    if (existing) {
      await client.close();
      return res.status(409).json({ message: 'Email already registered' });
    }
    const hashed = await bcrypt.hash(password, 10);
    await users.insertOne({ name, email, password: hashed, createdAt: new Date() });
    await client.close();
    return res.status(201).json({ message: 'User registered' });
  } catch (err) {
    return res.status(500).json({ message: (err as Error).message || 'Registration failed' });
  }
}
