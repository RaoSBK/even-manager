import { httpClient } from './httpClient';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  read: boolean;
  createdAt: string;
}

export const notificationApi = {
  getAll: () =>
    httpClient.get<Notification[]>('/notifications'),

  markRead: (id: string) =>
    httpClient.patch<Notification>(`/notifications/${id}/read`, {}),

  markAllRead: () =>
    httpClient.post<{ message: string }>('/notifications/mark-all-read', {}),

  clearAll: () =>
    httpClient.delete<{ message: string }>('/notifications/clear-all')
};
export default notificationApi;
