import { Module } from '@nestjs/common';
import { PaymentService } from './providers/payment.service';
import { PaymentController } from './payment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentMethod } from './entities/payment.entity';

@Module({
  controllers: [PaymentController],
  providers: [PaymentService],
  imports: [TypeOrmModule.forFeature([PaymentMethod])]
})
export class PaymentModule {}
