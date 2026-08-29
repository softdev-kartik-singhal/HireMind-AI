import { prisma } from '../config/prisma.js';

export class NotificationService {
  static async getNotifications(userId: string) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }

  static async markRead(id: string, userId: string) {
    return prisma.notification.updateMany({
      where: { id, userId },
      data: { read: true },
    });
  }

  static async markAllRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId },
      data: { read: true },
    });
  }
}
