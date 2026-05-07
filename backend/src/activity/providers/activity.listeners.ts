// activity.listener.ts
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Activity, ActivityType } from '../entities/activity.entity';
import { NotificationType } from 'src/notification/entities/notification.entity';
import { NotificationService } from 'src/notification/providers/notification.service';

@Injectable()
export class ActivityListener {
  constructor(
    @InjectRepository(Activity)
    private readonly activityRepository: Repository<Activity>,

    private readonly notificationService: NotificationService,
  ) {}

  @OnEvent('user.activity')
  public async handleUserActivity(payload: { userId: string; type: ActivityType; description: string }) {
    const logTask = await this.activityRepository.save({
      user: { id: payload.userId },
      type: payload.type,
      description: payload.description,
    });
    
    const notificationType = this.mapActivityToNotification(payload.type);
    const notifyTask = await this.notificationService.emit(payload.userId, {
      title: this.formatTitle(payload.type),
      desc: payload.description,
      type: notificationType,
      urgent: payload.description.toLowerCase().includes('withdraw') || payload.type === 'SECURITY',
    });
    
    try {
      // await Promise.all([logTask]);
      await Promise.all([logTask, notifyTask]);
      console.log(`Activity Logged: ${payload.type} for User ${payload.userId}`);
    } catch (error) {
      console.error("Error in activity/notification listener:", error);
    }
  }

  private mapActivityToNotification(type: any): NotificationType {
    switch (type) {
      case 'TRANSACTION': return NotificationType.WALLET;
      case 'TRADE': return NotificationType.TRADE;
      case 'SECURITY': return NotificationType.SECURITY;
      default: return NotificationType.SYSTEM;
    }
  }

  private formatTitle(type: string): string {
    return type.charAt(0) + type.slice(1).toLowerCase() + ' Alert';
  }
}