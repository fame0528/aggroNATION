import { NextApiRequest, NextApiResponse } from 'next';
import { getModels } from '../../../lib/db/models/rss';
import { z } from 'zod';

const videoQuerySchema = z.object({
  limit: z.string().optional().default('12'),
  page: z.string().optional().default('1'),
  category: z.string().optional(),
  channelName: z.string().optional(),
  status: z.string().optional(),
  search: z.string().optional(),
});

const videoPostSchema = z.object({
  title: z.string().min(1),
  description: z.string(),
  videoUrl: z.string().url(),
  videoId: z.string().min(1),
  thumbnail: z.string().url(),
  channelName: z.string().min(1),
  channelId: z.string().min(1),
  feedUrl: z.string().url(),
  duration: z.string(),
  viewCount: z.number().optional().default(0),
  publishedAt: z.string().datetime(),
  tags: z.array(z.string()).optional().default([]),
  category: z.string().optional().default('Technology'),
  status: z.enum(['active', 'archived', 'hidden']).optional().default('active'),
  language: z.string().optional(),
  likeCount: z.number().optional(),
  commentCount: z.number().optional(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { videos } = await getModels();

    if (req.method === 'GET') {
      const query = videoQuerySchema.parse(req.query);

      const limit = parseInt(query.limit);
      const page = parseInt(query.page);

      const result = await videos.getVideos({
        page,
        limit,
        category: query.category,
        channelName: query.channelName,
        status: query.status,
        search: query.search,
      });

      res.status(200).json({
        videos: result.videos,
        pagination: {
          total: result.total,
          page,
          limit,
          totalPages: Math.ceil(result.total / limit),
          hasMore: page * limit < result.total,
        },
      });
    } else if (req.method === 'POST') {
      const videoData = videoPostSchema.parse(req.body);

      // Add required fields
      const videoToCreate = {
        ...videoData,
        hash: Buffer.from(videoData.videoId + videoData.title).toString('base64'),
        fetchedAt: new Date(),
        publishedAt: new Date(videoData.publishedAt),
      };

      const video = await videos.create(videoToCreate);

      res.status(201).json({ video });
    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);

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
