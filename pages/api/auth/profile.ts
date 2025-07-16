import { NextApiRequest, NextApiResponse } from 'next';
import { AuthService } from '@/lib/services/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const authorization = req.headers.authorization;

    if (!authorization || !authorization.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided',
      });
    }

    const token = authorization.split(' ')[1];
    const decoded = AuthService.verifyToken(token);

    if (req.method === 'GET') {
      // Get current user profile
      const result = await AuthService.getCurrentUser(token);

      if (result.success) {
        return res.status(200).json(result);
      } else {
        return res.status(401).json(result);
      }
    } else if (req.method === 'PUT') {
      // Update user profile
      const result = await AuthService.updateProfile(decoded.userId, req.body);

      if (result.success) {
        return res.status(200).json(result);
      } else {
        return res.status(400).json(result);
      }
    } else {
      return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Profile API error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}
