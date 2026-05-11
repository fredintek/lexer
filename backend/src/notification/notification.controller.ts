import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { NotificationService } from './providers/notification.service';
import { ActiveUser } from 'src/auth/decorators/activeUser.decorator';
import { ActiveUserInterface } from 'src/lib/types';
import { UpdateNotificationSettingsDto } from './dtos';
import { UserStatus as UserStatusEnum } from 'src/user/entities/user.entity';
import { UserStatus } from 'src/auth/decorators/auth.decorator';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @UserStatus(
    UserStatusEnum.ACTIVE,
    UserStatusEnum.PENDING,
    UserStatusEnum.SUSPENDED,
    UserStatusEnum.DEACTIVATED,
  )
  async getMyNotifications(@ActiveUser() user: ActiveUserInterface) {
    return this.notificationService.getForUser(user.userId);
  }

  @Patch('read')
  async markAllRead(@ActiveUser() user: ActiveUserInterface) {
    return this.notificationService.markAsRead(user.userId);
  }

  @Patch(':id/read')
  async markOneRead(
    @ActiveUser() user: ActiveUserInterface,
    @Param('id') id: string,
  ) {
    return this.notificationService.markAsRead(user.userId, id);
  }

  @Patch('settings')
  async setNotificationSettings(
    @ActiveUser() currentUser: ActiveUserInterface,
    @Body() updateNotificationSettingsDto: UpdateNotificationSettingsDto,
  ) {
    return this.notificationService.updateNotificationSettings(
      currentUser?.userId,
      updateNotificationSettingsDto,
    );
  }
}
