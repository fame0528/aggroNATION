import { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/lib/db/connection';
import { getModels, IBookmark, IReadingList } from '@/lib/db/models/rss';
import { rateLimit } from '@/lib/services/security';
import { trackEvent } from '@/lib/services/analytics';

interface BookmarkRequest extends NextApiRequest {
  body: {
    articleId: string;
    title: string;
    url: string;
    description?: string;
    tags?: string[];
    category?: string;
  };
}

interface ReadingListRequest extends NextApiRequest {
  body: {
    name: string;
    description?: string;
    articles?: string[];
    isPublic?: boolean;
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Apply rate limiting
    await rateLimit(req, res);

    await connectDB();

    const { method, query } = req;
    const { type, id } = query;

    // Handle bookmarks
    if (type === 'bookmarks') {
      switch (method) {
        case 'GET':
          return await getBookmarks(req, res);
        case 'POST':
          return await createBookmark(req as BookmarkRequest, res);
        case 'DELETE':
          return await deleteBookmark(req, res);
        default:
          res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
          return res.status(405).json({ error: 'Method not allowed' });
      }
    }

    // Handle reading lists
    if (type === 'reading-lists') {
      switch (method) {
        case 'GET':
          return await getReadingLists(req, res);
        case 'POST':
          return await createReadingList(req as ReadingListRequest, res);
        case 'PUT':
          return await updateReadingList(req, res);
        case 'DELETE':
          return await deleteReadingList(req, res);
        default:
          res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
          return res.status(405).json({ error: 'Method not allowed' });
      }
    }

    return res.status(400).json({ error: 'Invalid type parameter' });
  } catch (error) {
    console.error('User Content API Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message:
        process.env.NODE_ENV === 'development' ? (error as Error).message : 'Something went wrong',
    });
  }
}

async function getBookmarks(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { userId = 'default', limit = '50', offset = '0', category, tags } = req.query;
    const { bookmarks } = await getModels();

    const options: any = {
      limit: parseInt(limit as string),
      skip: parseInt(offset as string),
    };

    if (category) options.category = category;
    if (tags) options.tags = Array.isArray(tags) ? tags : [tags];

    const bookmarkList = await bookmarks.findByUser(userId as string, options);
    const total = await bookmarks.countDocuments({ userId });

    await trackEvent('bookmarks', 'viewed', { userId, count: bookmarkList.length });

    return res.status(200).json({
      bookmarks: bookmarkList,
      total,
      hasMore: parseInt(offset as string) + bookmarkList.length < total,
    });
  } catch (error) {
    console.error('Get bookmarks error:', error);
    return res.status(500).json({ error: 'Failed to fetch bookmarks' });
  }
}

async function createBookmark(req: BookmarkRequest, res: NextApiResponse) {
  try {
    const { userId = 'default' } = req.query;
    const { articleId, title, url, description, tags, category } = req.body;
    const { bookmarks } = await getModels();

    if (!articleId || !title || !url) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if bookmark already exists
    const existingBookmark = await bookmarks.findOne({ userId, articleId });
    if (existingBookmark) {
      return res.status(409).json({ error: 'Bookmark already exists' });
    }

    const bookmark = await bookmarks.create({
      userId: userId as string,
      articleId,
      title,
      url,
      description,
      tags: tags || [],
      category: category || 'general',
      createdAt: new Date(),
    });

    await trackEvent('bookmark', 'created', { userId, articleId, category });

    return res.status(201).json({ bookmark });
  } catch (error) {
    console.error('Create bookmark error:', error);
    return res.status(500).json({ error: 'Failed to create bookmark' });
  }
}

async function deleteBookmark(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { userId = 'default', id } = req.query;
    const { bookmarks } = await getModels();

    if (!id) {
      return res.status(400).json({ error: 'Bookmark ID is required' });
    }

    const bookmark = await bookmarks.findOneAndDelete({ _id: id, userId });
    if (!bookmark) {
      return res.status(404).json({ error: 'Bookmark not found' });
    }

    await trackEvent('bookmark', 'deleted', { userId, bookmarkId: id });

    return res.status(200).json({ message: 'Bookmark deleted successfully' });
  } catch (error) {
    console.error('Delete bookmark error:', error);
    return res.status(500).json({ error: 'Failed to delete bookmark' });
  }
}

async function getReadingLists(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { userId = 'default', limit = '20', offset = '0' } = req.query;
    const { readingLists } = await getModels();

    const options = {
      limit: parseInt(limit as string),
      skip: parseInt(offset as string),
    };

    const readingListData = await readingLists.findByUser(userId as string, options);
    const total = await readingLists.countDocuments({ userId });

    await trackEvent('reading-lists', 'viewed', { userId, count: readingListData.length });

    return res.status(200).json({
      readingLists: readingListData,
      total,
      hasMore: parseInt(offset as string) + readingListData.length < total,
    });
  } catch (error) {
    console.error('Get reading lists error:', error);
    return res.status(500).json({ error: 'Failed to fetch reading lists' });
  }
}

async function createReadingList(req: ReadingListRequest, res: NextApiResponse) {
  try {
    const { userId = 'default' } = req.query;
    const { name, description, articles, isPublic } = req.body;
    const { readingLists } = await getModels();

    if (!name) {
      return res.status(400).json({ error: 'Reading list name is required' });
    }

    const readingList = await readingLists.create({
      userId: userId as string,
      name,
      description,
      articles: articles || [],
      isPublic: isPublic || false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await trackEvent('reading-list', 'created', { userId, name });

    return res.status(201).json({ readingList });
  } catch (error) {
    console.error('Create reading list error:', error);
    return res.status(500).json({ error: 'Failed to create reading list' });
  }
}

async function updateReadingList(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { userId = 'default', id } = req.query;
    const { name, description, articles, isPublic } = req.body;
    const { readingLists } = await getModels();

    if (!id) {
      return res.status(400).json({ error: 'Reading list ID is required' });
    }

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (articles) updateData.articles = articles;
    if (isPublic !== undefined) updateData.isPublic = isPublic;

    const readingList = await readingLists.findOneAndUpdate(
      { _id: id, userId },
      { $set: updateData },
      { new: true },
    );

    if (!readingList) {
      return res.status(404).json({ error: 'Reading list not found' });
    }

    await trackEvent('reading-list', 'updated', { userId, readingListId: id });

    return res.status(200).json({ readingList });
  } catch (error) {
    console.error('Update reading list error:', error);
    return res.status(500).json({ error: 'Failed to update reading list' });
  }
}

async function deleteReadingList(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { userId = 'default', id } = req.query;
    const { readingLists } = await getModels();

    if (!id) {
      return res.status(400).json({ error: 'Reading list ID is required' });
    }

    const readingList = await readingLists.findOneAndDelete({ _id: id, userId });
    if (!readingList) {
      return res.status(404).json({ error: 'Reading list not found' });
    }

    await trackEvent('reading-list', 'deleted', { userId, readingListId: id });

    return res.status(200).json({ message: 'Reading list deleted successfully' });
  } catch (error) {
    console.error('Delete reading list error:', error);
    return res.status(500).json({ error: 'Failed to delete reading list' });
  }
}
