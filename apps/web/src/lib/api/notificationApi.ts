import { api } from './axios';

export interface AppNotification {
  _id: string;
  type: string;
  title: string;
  message: string;
  order?: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export const notificationApi = {
  list: async (params?: { limit?: number; unreadOnly?: boolean }) => {
    const response = await api.get('/notifications', { params });
    return response.data.data as { items: AppNotification[]; unreadCount: number };
  },
  markRead: async (id: string) => {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data.data;
  },
  markAllRead: async () => {
    await api.patch('/notifications/read-all');
  },
};
