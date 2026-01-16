import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CheckinNotification } from './checkin-notification.entity';

@Injectable()
export class CheckinNotificationService {
  constructor(
    @InjectRepository(CheckinNotification)
    private readonly notificationRepository: Repository<CheckinNotification>,
  ) {}

  /**
   * 创建通知
   */
  async create(userId: number, checkinId: number, type: number = 1): Promise<CheckinNotification> {
    const notification = this.notificationRepository.create({
      userId,
      checkinId,
      type,
      isRead: 0,
    });
    return await this.notificationRepository.save(notification);
  }

  /**
   * 标记通知为已读
   */
  async markAsRead(id: number, userId: number): Promise<void> {
    const notification = await this.notificationRepository.findOne({
      where: { id, userId },
    });
    if (notification) {
      notification.isRead = 1;
      await this.notificationRepository.save(notification);
    }
  }

  /**
   * 获取用户未读通知数量
   */
  async getUnreadCount(userId: number): Promise<number> {
    return await this.notificationRepository.count({
      where: { userId, isRead: 0 },
    });
  }
}
