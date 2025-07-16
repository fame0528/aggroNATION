/**
 * @fileoverview Real-time update service for RSS dashboard
 * @author aggroNATION Development Team
 * @version 1.0.0
 */

import { EventEmitter } from 'events';

export interface RealTimeEvent {
  type: 'article' | 'video' | 'model' | 'feed' | 'health' | 'stats';
  action: 'created' | 'updated' | 'deleted' | 'error';
  data: any;
  timestamp: number;
}

/**
 * Real-time update service
 */
export class RealTimeService extends EventEmitter {
  private subscribers: Map<string, Set<Function>> = new Map();
  private eventBuffer: RealTimeEvent[] = [];
  private maxBufferSize = 100;

  /**
   * Subscribe to real-time events
   */
  subscribe(eventType: string, callback: Function): string {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, new Set());
    }

    this.subscribers.get(eventType)!.add(callback);

    // Generate subscription ID
    const subscriptionId = `${eventType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Return unsubscribe function
    return subscriptionId;
  }

  /**
   * Unsubscribe from real-time events
   */
  unsubscribe(eventType: string, callback: Function): void {
    if (this.subscribers.has(eventType)) {
      this.subscribers.get(eventType)!.delete(callback);
    }
  }

  /**
   * Emit real-time event
   */
  emit(eventType: string, event: RealTimeEvent): boolean {
    // Add to buffer
    this.eventBuffer.push(event);

    // Keep buffer size under control
    if (this.eventBuffer.length > this.maxBufferSize) {
      this.eventBuffer.shift();
    }

    // Notify subscribers
    if (this.subscribers.has(eventType)) {
      this.subscribers.get(eventType)!.forEach((callback) => {
        try {
          callback(event);
        } catch (error) {
          console.error('Real-time callback error:', error);
        }
      });
    }

    // Emit to EventEmitter
    return super.emit(eventType, event);
  }

  /**
   * Get recent events
   */
  getRecentEvents(limit: number = 10): RealTimeEvent[] {
    return this.eventBuffer.slice(-limit);
  }

  /**
   * Clear event buffer
   */
  clearBuffer(): void {
    this.eventBuffer = [];
  }

  /**
   * Get subscriber count
   */
  getSubscriberCount(eventType?: string): number {
    if (eventType) {
      return this.subscribers.get(eventType)?.size || 0;
    }

    return Array.from(this.subscribers.values()).reduce((total, set) => total + set.size, 0);
  }

  /**
   * Get all event types
   */
  getEventTypes(): string[] {
    return Array.from(this.subscribers.keys());
  }
}

/**
 * Global real-time service instance
 */
export const realTimeService = new RealTimeService();

/**
 * Helper functions to emit specific events
 */
export const realTimeEvents = {
  articleCreated: (article: any) => {
    realTimeService.emit('article', {
      type: 'article',
      action: 'created',
      data: article,
      timestamp: Date.now(),
    });
  },

  videoCreated: (video: any) => {
    realTimeService.emit('video', {
      type: 'video',
      action: 'created',
      data: video,
      timestamp: Date.now(),
    });
  },

  feedUpdated: (feed: any) => {
    realTimeService.emit('feed', {
      type: 'feed',
      action: 'updated',
      data: feed,
      timestamp: Date.now(),
    });
  },

  healthChanged: (health: any) => {
    realTimeService.emit('health', {
      type: 'health',
      action: 'updated',
      data: health,
      timestamp: Date.now(),
    });
  },

  statsUpdated: (stats: any) => {
    realTimeService.emit('stats', {
      type: 'stats',
      action: 'updated',
      data: stats,
      timestamp: Date.now(),
    });
  },

  error: (error: any) => {
    realTimeService.emit('error', {
      type: 'feed',
      action: 'error',
      data: error,
      timestamp: Date.now(),
    });
  },
};

/**
 * Server-Sent Events handler for real-time updates
 */
export function createSSEHandler() {
  return function (req: any, res: any) {
    // Set SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    });

    // Send initial connection event
    res.write(`data: ${JSON.stringify({ type: 'connection', status: 'connected' })}\n\n`);

    // Subscribe to all events
    const subscriptions: string[] = [];

    ['article', 'video', 'feed', 'health', 'stats', 'error'].forEach((eventType) => {
      const callback = (event: RealTimeEvent) => {
        res.write(`data: ${JSON.stringify(event)}\n\n`);
      };

      const subId = realTimeService.subscribe(eventType, callback);
      subscriptions.push(subId);
    });

    // Handle client disconnect
    req.on('close', () => {
      subscriptions.forEach((subId) => {
        // Clean up subscriptions
        // Note: This is a simplified cleanup - in production you'd want proper subscription management
      });
    });

    // Send periodic heartbeat
    const heartbeat = setInterval(() => {
      res.write(`data: ${JSON.stringify({ type: 'heartbeat', timestamp: Date.now() })}\n\n`);
    }, 30000);

    req.on('close', () => {
      clearInterval(heartbeat);
    });
  };
}
