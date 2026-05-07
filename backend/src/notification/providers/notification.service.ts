import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FirebaseService } from 'src/firebase/providers/firebase.service';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from '../entities/notification.entity';
import { EmailService } from 'src/email/providers/email.service';
import { UpdateNotificationSettingsDto } from '../dtos';

@Injectable()
export class NotificationService {
    constructor(
    @InjectRepository(Notification) private readonly notificationRepo: Repository<Notification>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly firebaseService: FirebaseService,
    private readonly mailerService: EmailService,
  ) {}

  /**
   * Internal method to be called by other services (Trade, Wallet, etc.)
   */
  public async emit(userId: string, data: { title: string; desc: string; type: NotificationType; metadata?: any, urgent?: boolean }) {
    const user = await this.userRepo.createQueryBuilder('user')
      .select(['user.id', 'user.fcmToken', 'user.pushEnabled', 'user.emailEnabled', 'user.email'])
      .where('user.id = :userId', { userId })
      .getOne();

    if(!user) return;
    // Save to Database
    const insertResult = await this.notificationRepo.createQueryBuilder()
      .insert()
      .into('notification')
      .values({
        title: data.title,
        description: data.desc,
        type: data.type,
        metadata: data.metadata,
        urgent: data?.urgent,
        user: { id: userId }
      })
      .execute();


    const tasks: Promise<any>[] = [];

    // If token exists, send Push Notification via Firebase
    if (user.pushEnabled && user.fcmToken) {
        tasks.push(this.firebaseService.sendPush(user.fcmToken, data.title, data.desc, data.metadata));
    }

    if (user.emailEnabled) {
        tasks.push(
        this.mailerService.sendEmail(user, data.title, data.desc)
        );
    }
    await Promise.allSettled(tasks);
    return insertResult.generatedMaps[0];
  }

  public async getForUser(userId: string) {
    return this.notificationRepo.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  public async markAsRead(userId: string, notificationId?: string) {
    if (notificationId) {
      return this.notificationRepo.update({ id: notificationId, user: { id: userId } }, { isRead: true });
    }
    return this.notificationRepo.update({ user: { id: userId }, isRead: false }, { isRead: true });
  }

    public async updateNotificationSettings(userId: string, updateNotificationSettingsDto: UpdateNotificationSettingsDto) {
        await this.userRepo.update(userId, updateNotificationSettingsDto);
        return { message: 'Settings updated successfully', updateNotificationSettingsDto };
    }
}
