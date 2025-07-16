/**
 * @fileoverview Notification service for user alerts and updates
 * @author aggroNATION Development Team
 * @version 1.0.0
 */

export interface Notification {
  id: string;
  userId: string;
  type: 'breaking_news' | 'new_video' | 'trending_topic' | 'system_alert' | 'feed_error';
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  createdAt: Date;
  expiresAt?: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category?: string;
  actionUrl?: string;
  actionText?: string;
}

export interface NotificationPreferences {
  userId: string;
  email: boolean;
  push: boolean;
  inApp: boolean;
  categories: {
    breaking_news: boolean;
    new_video: boolean;
    trending_topic: boolean;
    system_alert: boolean;
    feed_error: boolean;
  };
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
  quietHours: {
    enabled: boolean;
    startTime: string; // HH:mm format
    endTime: string; // HH:mm format
  };
}

/**
 * Notification service
 */
export class NotificationService {
  private notifications: Map<string, Notification[]> = new Map();
  private preferences: Map<string, NotificationPreferences> = new Map();
  private maxNotificationsPerUser = 100;

  /**
   * Create a new notification
   */
  create(notification: Omit<Notification, 'id' | 'createdAt' | 'read'>): Notification {
    const newNotification: Notification = {
      ...notification,
      id: this.generateId(),
      createdAt: new Date(),
      read: false,
    };

    // Get user notifications
    const userNotifications = this.notifications.get(notification.userId) || [];
    userNotifications.unshift(newNotification);

    // Keep notifications under limit
    if (userNotifications.length > this.maxNotificationsPerUser) {
      userNotifications.splice(this.maxNotificationsPerUser);
    }

    this.notifications.set(notification.userId, userNotifications);

    // Check if user should receive this notification
    const userPrefs = this.preferences.get(notification.userId);
    if (this.shouldSendNotification(newNotification, userPrefs)) {
      this.sendNotification(newNotification, userPrefs);
    }

    return newNotification;
  }

  /**
   * Get notifications for a user
   */
  getForUser(
    userId: string,
    options: {
      unreadOnly?: boolean;
      limit?: number;
      category?: string;
      priority?: Notification['priority'];
    } = {},
  ): Notification[] {
    let userNotifications = this.notifications.get(userId) || [];

    // Filter by read status
    if (options.unreadOnly) {
      userNotifications = userNotifications.filter((n) => !n.read);
    }

    // Filter by category
    if (options.category) {
      userNotifications = userNotifications.filter((n) => n.category === options.category);
    }

    // Filter by priority
    if (options.priority) {
      userNotifications = userNotifications.filter((n) => n.priority === options.priority);
    }

    // Remove expired notifications
    const now = new Date();
    userNotifications = userNotifications.filter((n) => !n.expiresAt || n.expiresAt > now);

    // Limit results
    if (options.limit) {
      userNotifications = userNotifications.slice(0, options.limit);
    }

    return userNotifications;
  }

  /**
   * Mark notification as read
   */
  markAsRead(userId: string, notificationId: string): boolean {
    const userNotifications = this.notifications.get(userId);
    if (!userNotifications) return false;

    const notification = userNotifications.find((n) => n.id === notificationId);
    if (!notification) return false;

    notification.read = true;
    return true;
  }

  /**
   * Mark all notifications as read for a user
   */
  markAllAsRead(userId: string): number {
    const userNotifications = this.notifications.get(userId);
    if (!userNotifications) return 0;

    let markedCount = 0;
    userNotifications.forEach((notification) => {
      if (!notification.read) {
        notification.read = true;
        markedCount++;
      }
    });

    return markedCount;
  }

  /**
   * Delete a notification
   */
  delete(userId: string, notificationId: string): boolean {
    const userNotifications = this.notifications.get(userId);
    if (!userNotifications) return false;

    const index = userNotifications.findIndex((n) => n.id === notificationId);
    if (index === -1) return false;

    userNotifications.splice(index, 1);
    return true;
  }

  /**
   * Get unread count for a user
   */
  getUnreadCount(userId: string): number {
    const userNotifications = this.notifications.get(userId) || [];
    const now = new Date();

    return userNotifications.filter((n) => !n.read && (!n.expiresAt || n.expiresAt > now)).length;
  }

  /**
   * Set user notification preferences
   */
  setPreferences(userId: string, preferences: Partial<NotificationPreferences>): void {
    const currentPrefs = this.preferences.get(userId) || this.getDefaultPreferences(userId);
    const updatedPrefs = { ...currentPrefs, ...preferences };
    this.preferences.set(userId, updatedPrefs);
  }

  /**
   * Get user notification preferences
   */
  getPreferences(userId: string): NotificationPreferences {
    return this.preferences.get(userId) || this.getDefaultPreferences(userId);
  }

  /**
   * Send breaking news notification to all users
   */
  broadcastBreakingNews(title: string, message: string, data?: Record<string, any>): void {
    // Get all users (in production, this would come from database)
    const allUserIds = Array.from(this.preferences.keys());

    allUserIds.forEach((userId) => {
      this.create({
        userId,
        type: 'breaking_news',
        title,
        message,
        data,
        priority: 'urgent',
        category: 'news',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      });
    });
  }

  /**
   * Notify about new content
   */
  notifyNewContent(
    type: 'article' | 'video',
    content: { title: string; author?: string; category?: string; id: string },
  ): void {
    // This would typically query users based on their content preferences
    const interestedUsers = Array.from(this.preferences.keys()); // Simplified

    interestedUsers.forEach((userId) => {
      const notificationType = type === 'article' ? 'breaking_news' : 'new_video';

      this.create({
        userId,
        type: notificationType,
        title: `New ${type} available`,
        message: `${content.title}${content.author ? ` by ${content.author}` : ''}`,
        data: { contentId: content.id, contentType: type },
        priority: 'medium',
        category: content.category || 'general',
        actionUrl: type === 'article' ? `/articles/${content.id}` : `/videos/${content.id}`,
        actionText: type === 'article' ? 'Read Article' : 'Watch Video',
      });
    });
  }

  /**
   * Clean up expired notifications
   */
  cleanup(): number {
    let cleanedCount = 0;
    const now = new Date();

    for (const [userId, userNotifications] of this.notifications.entries()) {
      const originalLength = userNotifications.length;
      const filtered = userNotifications.filter((n) => !n.expiresAt || n.expiresAt > now);

      cleanedCount += originalLength - filtered.length;
      this.notifications.set(userId, filtered);
    }

    return cleanedCount;
  }

  /**
   * Get notification statistics
   */
  getStats(): {
    totalUsers: number;
    totalNotifications: number;
    unreadNotifications: number;
    notificationsByType: Record<string, number>;
    notificationsByPriority: Record<string, number>;
  } {
    let totalNotifications = 0;
    let unreadNotifications = 0;
    const byType: Record<string, number> = {};
    const byPriority: Record<string, number> = {};

    for (const userNotifications of this.notifications.values()) {
      for (const notification of userNotifications) {
        totalNotifications++;

        if (!notification.read) {
          unreadNotifications++;
        }

        byType[notification.type] = (byType[notification.type] || 0) + 1;
        byPriority[notification.priority] = (byPriority[notification.priority] || 0) + 1;
      }
    }

    return {
      totalUsers: this.notifications.size,
      totalNotifications,
      unreadNotifications,
      notificationsByType: byType,
      notificationsByPriority: byPriority,
    };
  }

  // Private methods

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  }

  private getDefaultPreferences(userId: string): NotificationPreferences {
    return {
      userId,
      email: true,
      push: true,
      inApp: true,
      categories: {
        breaking_news: true,
        new_video: true,
        trending_topic: true,
        system_alert: true,
        feed_error: false,
      },
      frequency: 'immediate',
      quietHours: {
        enabled: true,
        startTime: '22:00',
        endTime: '08:00',
      },
    };
  }

  private shouldSendNotification(
    notification: Notification,
    preferences?: NotificationPreferences,
  ): boolean {
    if (!preferences) return true;

    // Check if category is enabled
    if (!preferences.categories[notification.type]) {
      return false;
    }

    // Check quiet hours
    if (preferences.quietHours.enabled && this.isInQuietHours(preferences.quietHours)) {
      // Only urgent notifications during quiet hours
      return notification.priority === 'urgent';
    }

    return true;
  }

  private isInQuietHours(quietHours: NotificationPreferences['quietHours']): boolean {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const [startHour, startMin] = quietHours.startTime.split(':').map(Number);
    const [endHour, endMin] = quietHours.endTime.split(':').map(Number);

    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;

    if (startTime <= endTime) {
      // Same day range
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      // Overnight range
      return currentTime >= startTime || currentTime <= endTime;
    }
  }

  private sendNotification(
    notification: Notification,
    preferences?: NotificationPreferences,
  ): void {
    // Here you would integrate with actual notification services
    // For now, just log
    console.log('Sending notification:', {
      type: notification.type,
      title: notification.title,
      userId: notification.userId,
      priority: notification.priority,
    });

    // In production, you would:
    // - Send push notifications via Firebase/OneSignal
    // - Send emails via SendGrid/Mailgun
    // - Send in-app notifications via WebSocket
  }
}

/**
 * Global notification service instance
 */
export const notificationService = new NotificationService();

// Start cleanup interval
setInterval(
  () => {
    const cleaned = notificationService.cleanup();
    if (cleaned > 0) {
      console.log(`Cleaned up ${cleaned} expired notifications`);
    }
  },
  60 * 60 * 1000,
); // Every hour
