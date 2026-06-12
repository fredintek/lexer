import { Module } from '@nestjs/common';
import { KycController } from './kyc.controller';
import { KycService } from './providers/kyc.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Kyc } from './entities/kyc.entity';
import { FileUploadProvider } from 'src/common/providers/FileUploader';

@Module({
  controllers: [KycController],
  providers: [KycService, FileUploadProvider],
  imports: [TypeOrmModule.forFeature([User, Kyc])],
})
export class KycModule {}
