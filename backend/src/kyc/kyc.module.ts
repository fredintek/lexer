import { Module } from '@nestjs/common';
import { KycController } from './kyc.controller';
import { KycService } from './providers/kyc.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { Kyc } from './entities/kyc.entity';

@Module({
  controllers: [KycController],
  providers: [KycService],
  imports: [TypeOrmModule.forFeature([User, Kyc]), CloudinaryModule]
})
export class KycModule {}
