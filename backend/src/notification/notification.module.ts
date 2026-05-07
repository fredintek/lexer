import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationService } from './providers/notification.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { User } from 'src/user/entities/user.entity';
import { FirebaseModule } from 'src/firebase/firebase.module';
import { EmailModule } from 'src/email/email.module';

@Module({
  controllers: [NotificationController],
  providers: [NotificationService],
  imports: [TypeOrmModule.forFeature([Notification, User]), FirebaseModule, EmailModule],
  exports: [NotificationService],
})
export class NotificationModule {}
