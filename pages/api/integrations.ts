import { NextApiRequest, NextApiResponse } from 'next';
import { rateLimit } from '@/lib/services/security';
import { trackEvent } from '@/lib/services/analytics';

interface IntegrationRequest extends NextApiRequest {
  body: {
    type: 'zapier' | 'ifttt' | 'slack' | 'discord' | 'teams' | 'email';
    config: Record<string, any>;
    events: string[];
    active?: boolean;
  };
}

// In-memory storage for demo (use database in production)
const integrations: Map<string, any> = new Map();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Apply rate limiting
    await rateLimit(req, res);

    const { method, query } = req;
    const { type } = query;

    switch (method) {
      case 'GET':
        if (type === 'available') {
          return await getAvailableIntegrations(req, res);
        }
        return await getIntegrations(req, res);
      case 'POST':
        return await createIntegration(req as IntegrationRequest, res);
      case 'PUT':
        return await updateIntegration(req, res);
      case 'DELETE':
        return await deleteIntegration(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Integrations API Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message:
        process.env.NODE_ENV === 'development' ? (error as Error).message : 'Something went wrong',
    });
  }
}

async function getAvailableIntegrations(req: NextApiRequest, res: NextApiResponse) {
  try {
    const availableIntegrations = [
      {
        type: 'zapier',
        name: 'Zapier',
        description: 'Connect to 5000+ apps through Zapier',
        icon: '⚡',
        features: [
          'Trigger actions when new articles are published',
          'Send notifications to email, Slack, or other apps',
          'Create custom workflows with multiple steps',
        ],
        configFields: [
          { name: 'webhook_url', type: 'url', required: true, description: 'Zapier webhook URL' },
        ],
        supportedEvents: [
          'article.created',
          'article.updated',
          'video.created',
          'video.updated',
          'feed.updated',
          'feed.error',
        ],
      },
      {
        type: 'ifttt',
        name: 'IFTTT',
        description: 'If This Then That automation',
        icon: '🔗',
        features: [
          'Create simple automation rules',
          'Connect to smart home devices',
          'Social media posting',
        ],
        configFields: [
          { name: 'webhook_url', type: 'url', required: true, description: 'IFTTT webhook URL' },
          { name: 'event_name', type: 'text', required: true, description: 'IFTTT event name' },
        ],
        supportedEvents: ['article.created', 'video.created', 'feed.updated'],
      },
      {
        type: 'slack',
        name: 'Slack',
        description: 'Send notifications to Slack channels',
        icon: '💬',
        features: [
          'Real-time notifications',
          'Channel-specific messages',
          'Rich message formatting',
        ],
        configFields: [
          { name: 'webhook_url', type: 'url', required: true, description: 'Slack webhook URL' },
          {
            name: 'channel',
            type: 'text',
            required: false,
            description: 'Channel name (optional)',
          },
          {
            name: 'username',
            type: 'text',
            required: false,
            description: 'Bot username (optional)',
          },
        ],
        supportedEvents: ['article.created', 'video.created', 'feed.error'],
      },
      {
        type: 'discord',
        name: 'Discord',
        description: 'Send notifications to Discord channels',
        icon: '🎮',
        features: ['Rich embeds with images', 'Channel mentions', 'Custom bot messages'],
        configFields: [
          { name: 'webhook_url', type: 'url', required: true, description: 'Discord webhook URL' },
          {
            name: 'username',
            type: 'text',
            required: false,
            description: 'Bot username (optional)',
          },
          {
            name: 'avatar_url',
            type: 'url',
            required: false,
            description: 'Bot avatar URL (optional)',
          },
        ],
        supportedEvents: ['article.created', 'video.created', 'feed.error'],
      },
      {
        type: 'teams',
        name: 'Microsoft Teams',
        description: 'Send notifications to Teams channels',
        icon: '💼',
        features: ['Actionable cards', 'Team mentions', 'Integration with Office 365'],
        configFields: [
          { name: 'webhook_url', type: 'url', required: true, description: 'Teams webhook URL' },
        ],
        supportedEvents: ['article.created', 'video.created', 'feed.error'],
      },
      {
        type: 'email',
        name: 'Email',
        description: 'Send email notifications',
        icon: '📧',
        features: ['HTML email templates', 'Multiple recipients', 'Custom subject lines'],
        configFields: [
          { name: 'to', type: 'email', required: true, description: 'Recipient email address' },
          {
            name: 'subject_template',
            type: 'text',
            required: false,
            description: 'Email subject template',
          },
          {
            name: 'cc',
            type: 'email',
            required: false,
            description: 'CC email addresses (comma-separated)',
          },
        ],
        supportedEvents: ['article.created', 'video.created', 'feed.error', 'daily.digest'],
      },
    ];

    await trackEvent('integrations', 'available_viewed', { userId: 'default' });

    return res.status(200).json({ integrations: availableIntegrations });
  } catch (error) {
    console.error('Get available integrations error:', error);
    return res.status(500).json({ error: 'Failed to get available integrations' });
  }
}

async function getIntegrations(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { userId = 'default' } = req.query;

    const userIntegrations = Array.from(integrations.values()).filter(
      (integration) => integration.userId === userId,
    );

    await trackEvent('integrations', 'list_viewed', { userId, count: userIntegrations.length });

    return res.status(200).json({
      integrations: userIntegrations,
      total: userIntegrations.length,
    });
  } catch (error) {
    console.error('Get integrations error:', error);
    return res.status(500).json({ error: 'Failed to get integrations' });
  }
}

async function createIntegration(req: IntegrationRequest, res: NextApiResponse) {
  try {
    const { userId = 'default' } = req.query;
    const { type, config, events, active = true } = req.body;

    if (!type || !config || !events || !Array.isArray(events)) {
      return res.status(400).json({ error: 'Type, config, and events are required' });
    }

    const integrationId = generateId();
    const integration = {
      id: integrationId,
      userId,
      type,
      config,
      events,
      active,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastTriggeredAt: null,
      triggerCount: 0,
      errorCount: 0,
      lastError: null,
    };

    integrations.set(integrationId, integration);

    await trackEvent('integrations', 'created', { userId, integrationId, type, events });

    return res.status(201).json({ integration });
  } catch (error) {
    console.error('Create integration error:', error);
    return res.status(500).json({ error: 'Failed to create integration' });
  }
}

async function updateIntegration(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { userId = 'default', id } = req.query;
    const { config, events, active } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Integration ID is required' });
    }

    const integration = integrations.get(id as string);
    if (!integration || integration.userId !== userId) {
      return res.status(404).json({ error: 'Integration not found' });
    }

    const updatedIntegration = {
      ...integration,
      ...(config && { config }),
      ...(events && { events }),
      ...(active !== undefined && { active }),
      updatedAt: new Date(),
    };

    integrations.set(id as string, updatedIntegration);

    await trackEvent('integrations', 'updated', { userId, integrationId: id });

    return res.status(200).json({ integration: updatedIntegration });
  } catch (error) {
    console.error('Update integration error:', error);
    return res.status(500).json({ error: 'Failed to update integration' });
  }
}

async function deleteIntegration(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { userId = 'default', id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'Integration ID is required' });
    }

    const integration = integrations.get(id as string);
    if (!integration || integration.userId !== userId) {
      return res.status(404).json({ error: 'Integration not found' });
    }

    integrations.delete(id as string);

    await trackEvent('integrations', 'deleted', { userId, integrationId: id });

    return res.status(200).json({ message: 'Integration deleted successfully' });
  } catch (error) {
    console.error('Delete integration error:', error);
    return res.status(500).json({ error: 'Failed to delete integration' });
  }
}

function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

// Integration delivery service
export async function deliverIntegration(event: string, data: any): Promise<void> {
  try {
    const relevantIntegrations = Array.from(integrations.values()).filter(
      (integration) => integration.active && integration.events.includes(event),
    );

    for (const integration of relevantIntegrations) {
      try {
        await deliverToIntegration(integration, event, data);

        // Update stats
        integration.triggerCount += 1;
        integration.lastTriggeredAt = new Date();
        integrations.set(integration.id, integration);
      } catch (error) {
        console.error(`Failed to deliver to integration ${integration.id}:`, error);

        // Update error stats
        integration.errorCount += 1;
        integration.lastError = (error as Error).message;
        integrations.set(integration.id, integration);
      }
    }
  } catch (error) {
    console.error('Integration delivery error:', error);
  }
}

async function deliverToIntegration(integration: any, event: string, data: any): Promise<void> {
  const payload = {
    event,
    data,
    timestamp: new Date().toISOString(),
  };

  switch (integration.type) {
    case 'zapier':
    case 'ifttt':
      await fetch(integration.config.webhook_url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      break;

    case 'slack':
      await deliverToSlack(integration, payload);
      break;

    case 'discord':
      await deliverToDiscord(integration, payload);
      break;

    case 'teams':
      await deliverToTeams(integration, payload);
      break;

    case 'email':
      await deliverToEmail(integration, payload);
      break;

    default:
      throw new Error(`Unsupported integration type: ${integration.type}`);
  }
}

async function deliverToSlack(integration: any, payload: any): Promise<void> {
  const { webhook_url, channel, username } = integration.config;

  const slackPayload = {
    text: `New ${payload.event}: ${payload.data.title || 'Update'}`,
    channel,
    username,
    attachments: [
      {
        color: 'good',
        fields: [
          {
            title: 'Event',
            value: payload.event,
            short: true,
          },
          {
            title: 'Time',
            value: payload.timestamp,
            short: true,
          },
        ],
      },
    ],
  };

  await fetch(webhook_url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(slackPayload),
  });
}

async function deliverToDiscord(integration: any, payload: any): Promise<void> {
  const { webhook_url, username, avatar_url } = integration.config;

  const discordPayload = {
    content: `New ${payload.event}`,
    username,
    avatar_url,
    embeds: [
      {
        title: payload.data.title || 'Update',
        description: payload.data.description || '',
        color: 5814783,
        timestamp: payload.timestamp,
        footer: {
          text: 'aggroNATION',
        },
      },
    ],
  };

  await fetch(webhook_url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(discordPayload),
  });
}

async function deliverToTeams(integration: any, payload: any): Promise<void> {
  const { webhook_url } = integration.config;

  const teamsPayload = {
    '@type': 'MessageCard',
    '@context': 'http://schema.org/extensions',
    summary: `New ${payload.event}`,
    themeColor: '0072C6',
    sections: [
      {
        activityTitle: payload.data.title || 'Update',
        activitySubtitle: payload.event,
        activityImage: 'https://via.placeholder.com/64',
        facts: [
          {
            name: 'Event',
            value: payload.event,
          },
          {
            name: 'Time',
            value: payload.timestamp,
          },
        ],
      },
    ],
  };

  await fetch(webhook_url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(teamsPayload),
  });
}

async function deliverToEmail(integration: any, payload: any): Promise<void> {
  // Email delivery would require SMTP configuration
  // This is a mock implementation
  console.log('Email delivery:', {
    to: integration.config.to,
    subject: integration.config.subject_template || `New ${payload.event}`,
    body: JSON.stringify(payload, null, 2),
  });
}
