import { Controller, Get } from '@nestjs/common';
import { ActiveUser } from 'src/auth/decorators/activeUser.decorator';
import { ActiveUserInterface } from 'src/lib/types';
import { ActivityService } from './providers/activity.service';
import { UserStatus as UserStatusEnum } from 'src/user/entities/user.entity';
import { UserStatus } from 'src/auth/decorators/auth.decorator';

@Controller('activity')
export class ActivityController {
  constructor(
    /**
     * Inject activities service
     */
    private readonly activityService: ActivityService,
  ) {}

  @Get('')
  @UserStatus(
    UserStatusEnum.ACTIVE,
    UserStatusEnum.PENDING,
    UserStatusEnum.SUSPENDED,
    UserStatusEnum.DEACTIVATED,
  )
  async getMyActivities(@ActiveUser() user: ActiveUserInterface) {
    return this.activityService.getUserActivities(user);
  }
}
