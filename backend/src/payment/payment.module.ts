import { Module } from '@nestjs/common';
import { PaymentService } from './providers/payment.service';
import { PaymentController } from './payment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentMethod } from './entities/payment.entity';
import { User } from 'src/user/entities/user.entity';

@Module({
  controllers: [PaymentController],
  providers: [PaymentService],
  imports: [TypeOrmModule.forFeature([PaymentMethod, User])],
})
export class PaymentModule {}
