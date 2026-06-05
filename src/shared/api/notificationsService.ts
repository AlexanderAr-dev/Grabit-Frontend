import { api } from './instance';

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  event_type: string;
  is_read: boolean;
  created_at: string;
  read_at: string | null;
  data: string;
}

interface NotificationsPage {
  items: NotificationItem[];
  total: number;
}

interface NotificationPreferences {
  browser_push_enabled: boolean;
  email_enabled: boolean;
  inbox_enabled: boolean;
  mobile_push_enabled: boolean;
}

export class notificationsService {
  static async getNotifications({
    page = 1,
    pageSize = 20,
    filter = 'all',
  }: {
    page?: number;
    pageSize?: number;
    filter?: 'all' | 'unread';
  } = {}): Promise<NotificationsPage> {
    const response = await api.get<{ data: NotificationsPage }>('/notifications', {
      params: { page, page_size: pageSize, filter },
    });
    return response.data.data;
  }

  static async getUnreadCount(): Promise<number> {
    const response = await api.get<{ data: { count: number } }>('/notifications/unread-count');
    return response.data.data.count;
  }

  static async markRead(notificationIds: string[]): Promise<void> {
    await api.post('/notifications/mark-read', { notification_ids: notificationIds });
  }

  static async markAllRead(): Promise<void> {
    await api.post('/notifications/mark-all-read');
  }

  static async getPreferences(): Promise<NotificationPreferences> {
    const response = await api.get<{ data: NotificationPreferences }>('/notifications/preferences');
    return response.data.data;
  }

  static async updatePreferences(prefs: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
    const response = await api.put<{ data: NotificationPreferences }>('/notifications/preferences', prefs);
    return response.data.data;
  }
}
