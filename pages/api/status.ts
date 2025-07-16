import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'GET') {
      res.setHeader('Allow', ['GET']);
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Get system status
    const status = {
      system: {
        status: 'operational',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: process.version,
        platform: process.platform,
      },
      services: {
        database: 'operational', // You can add actual DB health check
        rss: 'operational',
        api: 'operational',
      },
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(status);
  } catch (error) {
    console.error('Status API Error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message:
        process.env.NODE_ENV === 'development' ? (error as Error).message : 'Something went wrong',
    });
  }
}
