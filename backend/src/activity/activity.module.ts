import { Module } from '@nestjs/common';
import { ActivityService } from './providers/activity.service';
import { ActivityController } from './activity.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Activity } from './entities/activity.entity';
import { ActivityListener } from './providers/activity.listeners';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  providers: [ActivityService, ActivityListener],
  controllers: [ActivityController],
  imports: [TypeOrmModule.forFeature([Activity]), NotificationModule]
})
export class ActivityModule {}
