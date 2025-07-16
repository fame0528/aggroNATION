import { NextApiRequest, NextApiResponse } from 'next';
import { analyticsService } from '@/lib/services/analytics';
import { z } from 'zod';

const analyticsQuerySchema = z.object({
  type: z.enum(['dashboard', 'user', 'realtime', 'export']).optional().default('dashboard'),
  timeRange: z.enum(['24h', '7d', '30d']).optional().default('7d'),
});

const trackEventSchema = z.object({
  type: z.enum(['page_view', 'article_read', 'video_watch', 'search', 'error', 'api_call']),
  data: z.record(z.any()),
  context: z
    .object({
      userId: z.string().optional(),
      sessionId: z.string().optional(),
      userAgent: z.string().optional(),
      referrer: z.string().optional(),
    })
    .optional(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const { type, timeRange } = analyticsQuerySchema.parse(req.query);

      switch (type) {
        case 'dashboard':
          const dashboardStats = await analyticsService.getDashboardStats();
          return res.status(200).json(dashboardStats);

        case 'user':
          const userAnalytics = analyticsService.getUserAnalytics(timeRange);
          return res.status(200).json(userAnalytics);

        case 'realtime':
          const realTimeMetrics = analyticsService.getRealTimeMetrics();
          return res.status(200).json(realTimeMetrics);

        case 'export':
          const exportData = analyticsService.exportData(timeRange);
          return res.status(200).json({
            events: exportData,
            count: exportData.length,
            timeRange,
            exportedAt: new Date().toISOString(),
          });

        default:
          return res.status(400).json({ error: 'Invalid analytics type' });
      }
    } else if (req.method === 'POST') {
      // Track an event
      const { type, data, context } = trackEventSchema.parse(req.body);

      // Add IP and user agent from request
      const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      const eventContext = {
        ...context,
        ip: Array.isArray(ip) ? ip[0] : ip,
        userAgent: req.headers['user-agent'],
      };

      analyticsService.track(type, data, eventContext);

      res.status(200).json({ success: true, message: 'Event tracked' });
    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Analytics API Error:', error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors,
      });
    }

    res.status(500).json({
      error: 'Internal server error',
      message:
        process.env.NODE_ENV === 'development' ? (error as Error).message : 'Something went wrong',
    });
  }
}
