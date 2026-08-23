import prisma from '../config/database';
import { Notification } from '@prisma/client';

export class NotificationService {
  static async createNotification(
    title: string,
    message: string,
    type: 'info' | 'warning' | 'success' | 'error' = 'info'
  ): Promise<Notification> {
    return await prisma.notification.create({
      data: {
        title,
        message,
        type
      }
    });
  }

  async getAll(): Promise<Notification[]> {
    return await prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50 // Limit to last 50 alerts
    });
  }

  async markRead(id: string): Promise<Notification> {
    return await prisma.notification.update({
      where: { id },
      data: { read: true }
    });
  }

  async markAllRead(): Promise<void> {
    await prisma.notification.updateMany({
      where: { read: false },
      data: { read: true }
    });
  }

  async clearAll(): Promise<void> {
    await prisma.notification.deleteMany({});
  }
}
export default NotificationService;
