import { Controller, Get } from '@nestjs/common';
import { ActiveUser } from 'src/auth/decorators/activeUser.decorator';
import { ActiveUserInterface } from 'src/lib/types';
import { ActivityService } from './providers/activity.service';

@Controller('activity')
export class ActivityController {

    constructor(
        /**
         * Inject activities service
         */
        private readonly activityService: ActivityService
    ){}


    @Get('')
    async getMyActivities(@ActiveUser() user: ActiveUserInterface) {
        return this.activityService.getUserActivities(user)
    }
}
