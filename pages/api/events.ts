import { NextApiRequest, NextApiResponse } from 'next';
import { createSSEHandler } from '@/lib/services/real-time';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Use the SSE handler
  const sseHandler = createSSEHandler();
  sseHandler(req, res);
}

// Disable Next.js automatic body parsing for SSE
export const config = {
  api: {
    bodyParser: false,
    responseLimit: false,
  },
};
