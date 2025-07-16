import { NextApiRequest, NextApiResponse } from 'next';
import { rateLimit } from '@/lib/services/security';
import { trackEvent } from '@/lib/services/analytics';

interface WebhookRequest extends NextApiRequest {
  body: {
    url: string;
    events: string[];
    headers?: Record<string, string>;
    active?: boolean;
  };
}

interface APIKeyRequest extends NextApiRequest {
  body: {
    name: string;
    permissions: string[];
    expiresAt?: Date;
  };
}

// In-memory storage for demo (use database in production)
const webhooks: Map<string, any> = new Map();
const apiKeys: Map<string, any> = new Map();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Apply rate limiting
    await rateLimit(req, res);

    const { method, query } = req;
    const { type } = query;

    // Developer tools routes
    if (type === 'webhooks') {
      switch (method) {
        case 'GET':
          return await getWebhooks(req, res);
        case 'POST':
          return await createWebhook(req as WebhookRequest, res);
        case 'PUT':
          return await updateWebhook(req, res);
        case 'DELETE':
          return await deleteWebhook(req, res);
        default:
          res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
          return res.status(405).json({ error: 'Method not allowed' });
      }
    }

    if (type === 'api-keys') {
      switch (method) {
        case 'GET':
          return await getAPIKeys(req, res);
        case 'POST':
          return await createAPIKey(req as APIKeyRequest, res);
        case 'DELETE':
          return await deleteAPIKey(req, res);
        default:
          res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
          return res.status(405).json({ error: 'Method not allowed' });
      }
    }

    if (type === 'docs') {
      return await getAPIDocumentation(req, res);
    }

    if (type === 'test') {
      return await testWebhook(req, res);
    }

    return res.status(400).json({ error: 'Invalid type parameter' });
  } catch (error) {
    console.error('Developer Tools API Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message:
        process.env.NODE_ENV === 'development' ? (error as Error).message : 'Something went wrong',
    });
  }
}

async function getWebhooks(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { userId = 'default' } = req.query;

    const userWebhooks = Array.from(webhooks.values()).filter(
      (webhook) => webhook.userId === userId,
    );

    await trackEvent('developer', 'webhooks_listed', { userId, count: userWebhooks.length });

    return res.status(200).json({
      webhooks: userWebhooks,
      total: userWebhooks.length,
    });
  } catch (error) {
    console.error('Get webhooks error:', error);
    return res.status(500).json({ error: 'Failed to get webhooks' });
  }
}

async function createWebhook(req: WebhookRequest, res: NextApiResponse) {
  try {
    const { userId = 'default' } = req.query;
    const { url, events, headers, active = true } = req.body;

    if (!url || !events || !Array.isArray(events)) {
      return res.status(400).json({ error: 'URL and events array are required' });
    }

    const webhookId = generateId();
    const webhook = {
      id: webhookId,
      userId,
      url,
      events,
      headers: headers || {},
      active,
      createdAt: new Date(),
      updatedAt: new Date(),
      deliveryCount: 0,
      failureCount: 0,
      lastDeliveredAt: null,
      lastFailureAt: null,
    };

    webhooks.set(webhookId, webhook);

    await trackEvent('developer', 'webhook_created', { userId, webhookId, events });

    return res.status(201).json({ webhook });
  } catch (error) {
    console.error('Create webhook error:', error);
    return res.status(500).json({ error: 'Failed to create webhook' });
  }
}

async function updateWebhook(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { userId = 'default', id } = req.query;
    const { url, events, headers, active } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Webhook ID is required' });
    }

    const webhook = webhooks.get(id as string);
    if (!webhook || webhook.userId !== userId) {
      return res.status(404).json({ error: 'Webhook not found' });
    }

    const updatedWebhook = {
      ...webhook,
      ...(url && { url }),
      ...(events && { events }),
      ...(headers && { headers }),
      ...(active !== undefined && { active }),
      updatedAt: new Date(),
    };

    webhooks.set(id as string, updatedWebhook);

    await trackEvent('developer', 'webhook_updated', { userId, webhookId: id });

    return res.status(200).json({ webhook: updatedWebhook });
  } catch (error) {
    console.error('Update webhook error:', error);
    return res.status(500).json({ error: 'Failed to update webhook' });
  }
}

async function deleteWebhook(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { userId = 'default', id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'Webhook ID is required' });
    }

    const webhook = webhooks.get(id as string);
    if (!webhook || webhook.userId !== userId) {
      return res.status(404).json({ error: 'Webhook not found' });
    }

    webhooks.delete(id as string);

    await trackEvent('developer', 'webhook_deleted', { userId, webhookId: id });

    return res.status(200).json({ message: 'Webhook deleted successfully' });
  } catch (error) {
    console.error('Delete webhook error:', error);
    return res.status(500).json({ error: 'Failed to delete webhook' });
  }
}

async function getAPIKeys(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { userId = 'default' } = req.query;

    const userAPIKeys = Array.from(apiKeys.values())
      .filter((key) => key.userId === userId)
      .map((key) => ({
        ...key,
        key: key.key.substring(0, 8) + '...' + key.key.substring(key.key.length - 4), // Mask the key
      }));

    await trackEvent('developer', 'api_keys_listed', { userId, count: userAPIKeys.length });

    return res.status(200).json({
      apiKeys: userAPIKeys,
      total: userAPIKeys.length,
    });
  } catch (error) {
    console.error('Get API keys error:', error);
    return res.status(500).json({ error: 'Failed to get API keys' });
  }
}

async function createAPIKey(req: APIKeyRequest, res: NextApiResponse) {
  try {
    const { userId = 'default' } = req.query;
    const { name, permissions, expiresAt } = req.body;

    if (!name || !permissions || !Array.isArray(permissions)) {
      return res.status(400).json({ error: 'Name and permissions array are required' });
    }

    const apiKeyId = generateId();
    const apiKey = generateAPIKey();

    const keyData = {
      id: apiKeyId,
      userId,
      name,
      key: apiKey,
      permissions,
      expiresAt: expiresAt || null,
      createdAt: new Date(),
      lastUsedAt: null,
      usageCount: 0,
      isActive: true,
    };

    apiKeys.set(apiKeyId, keyData);

    await trackEvent('developer', 'api_key_created', { userId, apiKeyId, permissions });

    return res.status(201).json({
      apiKey: {
        ...keyData,
        key: apiKey, // Return full key only on creation
      },
    });
  } catch (error) {
    console.error('Create API key error:', error);
    return res.status(500).json({ error: 'Failed to create API key' });
  }
}

async function deleteAPIKey(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { userId = 'default', id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'API key ID is required' });
    }

    const apiKey = apiKeys.get(id as string);
    if (!apiKey || apiKey.userId !== userId) {
      return res.status(404).json({ error: 'API key not found' });
    }

    apiKeys.delete(id as string);

    await trackEvent('developer', 'api_key_deleted', { userId, apiKeyId: id });

    return res.status(200).json({ message: 'API key deleted successfully' });
  } catch (error) {
    console.error('Delete API key error:', error);
    return res.status(500).json({ error: 'Failed to delete API key' });
  }
}

async function getAPIDocumentation(req: NextApiRequest, res: NextApiResponse) {
  try {
    const docs = {
      title: 'aggroNATION API Documentation',
      version: '1.0.0',
      baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://localhost:3000/api',
      endpoints: {
        articles: {
          'GET /api/rss/articles': {
            description: 'Get RSS articles with pagination and filtering',
            parameters: {
              page: 'Page number (default: 1)',
              limit: 'Items per page (default: 20)',
              category: 'Filter by category',
              source: 'Filter by source',
              search: 'Search in title and content',
            },
            response: {
              articles: 'Array of article objects',
              total: 'Total count of articles',
              hasMore: 'Boolean indicating if more pages exist',
            },
          },
        },
        videos: {
          'GET /api/rss/videos': {
            description: 'Get RSS videos with pagination and filtering',
            parameters: {
              page: 'Page number (default: 1)',
              limit: 'Items per page (default: 12)',
              category: 'Filter by category',
              channelName: 'Filter by channel name',
            },
            response: {
              videos: 'Array of video objects',
              total: 'Total count of videos',
              hasMore: 'Boolean indicating if more pages exist',
            },
          },
        },
        feeds: {
          'GET /api/rss/feeds': {
            description: 'Get RSS feeds information',
            parameters: {
              type: 'Filter by feed type (articles, videos)',
              active: 'Filter by active status',
            },
            response: {
              feeds: 'Array of feed objects',
              total: 'Total count of feeds',
            },
          },
        },
        search: {
          'GET /api/search': {
            description: 'Search across articles and videos',
            parameters: {
              q: 'Search query',
              type: 'Search type (articles, videos, all)',
              limit: 'Number of results per type',
            },
            response: {
              results: 'Search results grouped by type',
              total: 'Total count of results',
            },
          },
        },
      },
      webhooks: {
        events: [
          'article.created',
          'article.updated',
          'video.created',
          'video.updated',
          'feed.updated',
          'feed.error',
        ],
        payload: {
          event: 'Event type',
          data: 'Event data object',
          timestamp: 'Event timestamp',
        },
      },
      authentication: {
        apiKey: {
          header: 'X-API-Key',
          description: 'Include your API key in the X-API-Key header',
        },
      },
    };

    await trackEvent('developer', 'docs_viewed', { userId: 'default' });

    return res.status(200).json(docs);
  } catch (error) {
    console.error('Get API documentation error:', error);
    return res.status(500).json({ error: 'Failed to get API documentation' });
  }
}

async function testWebhook(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { webhookId } = req.body;

    if (!webhookId) {
      return res.status(400).json({ error: 'Webhook ID is required' });
    }

    const webhook = webhooks.get(webhookId);
    if (!webhook) {
      return res.status(404).json({ error: 'Webhook not found' });
    }

    // Send test payload
    const testPayload = {
      event: 'test',
      data: {
        message: 'This is a test webhook delivery',
        timestamp: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    };

    try {
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...webhook.headers,
        },
        body: JSON.stringify(testPayload),
      });

      const success = response.ok;
      const statusCode = response.status;

      // Update webhook stats
      webhook.deliveryCount += 1;
      if (success) {
        webhook.lastDeliveredAt = new Date();
      } else {
        webhook.failureCount += 1;
        webhook.lastFailureAt = new Date();
      }

      webhooks.set(webhookId, webhook);

      await trackEvent('developer', 'webhook_tested', {
        webhookId,
        success,
        statusCode,
      });

      return res.status(200).json({
        success,
        statusCode,
        message: success ? 'Webhook test successful' : 'Webhook test failed',
        payload: testPayload,
      });
    } catch (error) {
      webhook.failureCount += 1;
      webhook.lastFailureAt = new Date();
      webhooks.set(webhookId, webhook);

      await trackEvent('developer', 'webhook_test_failed', {
        webhookId,
        error: (error as Error).message,
      });

      return res.status(500).json({
        success: false,
        message: 'Webhook test failed',
        error: (error as Error).message,
      });
    }
  } catch (error) {
    console.error('Test webhook error:', error);
    return res.status(500).json({ error: 'Failed to test webhook' });
  }
}

function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

function generateAPIKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = 'ak_'; // API key prefix
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
