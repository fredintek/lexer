import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Activity } from '../entities/activity.entity';
import { Repository } from 'typeorm';
import { ActiveUserInterface } from 'src/lib/types';

@Injectable()
export class ActivityService {
    constructor(
        /**
         * Inject Activity Repository
         */
        @InjectRepository(Activity)
        private readonly activityRepo: Repository<Activity>
    ){}


    public async getUserActivities(user: ActiveUserInterface){
        return await this.activityRepo.find({
        where: { user: { id: user.userId } },
        order: { createdAt: 'DESC' },
        take: 10,
    });
    }
}
