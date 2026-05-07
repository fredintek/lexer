import { Module } from '@nestjs/common';
import { BannerController } from './banner.controller';
import { BannerService } from './providers/banner.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Banner } from './entities/banner.entity';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  controllers: [BannerController],
  providers: [BannerService],
  imports:[TypeOrmModule.forFeature([Banner]), CloudinaryModule]
})
export class BannerModule {}
