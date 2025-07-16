import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', ['POST']);
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Initialize RSS feeds
    const feedsResponse = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/rss/admin`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer admin-token', // You should implement proper auth
        },
        body: JSON.stringify({
          action: 'initialize',
        }),
      },
    );

    const feedsResult = await feedsResponse.json();

    // Trigger initial RSS refresh
    const refreshResponse = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/rss/refresh`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          force: true,
        }),
      },
    );

    const refreshResult = await refreshResponse.json();

    res.status(200).json({
      message: 'Dashboard initialized successfully',
      feeds: feedsResult,
      refresh: refreshResult,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Dashboard init error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message:
        process.env.NODE_ENV === 'development' ? (error as Error).message : 'Something went wrong',
    });
  }
}
