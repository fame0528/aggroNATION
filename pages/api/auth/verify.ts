import { NextApiRequest, NextApiResponse } from 'next';
import { AuthService } from '@/lib/services/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const authorization = req.headers.authorization;

    if (!authorization || !authorization.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided',
      });
    }

    const token = authorization.split(' ')[1];
    const result = await AuthService.getCurrentUser(token);

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(401).json(result);
    }
  } catch (error) {
    console.error('Token verification API error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}
