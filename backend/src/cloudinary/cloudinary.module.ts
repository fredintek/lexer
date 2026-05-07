import { Module } from '@nestjs/common';
import { CloudinaryService } from './providers/cloudinary.service';
import { CloudinaryProvider } from './providers/cloudinary.provider';

export const CLOUDINARY = 'CLOUDINARY';

@Module({
  providers: [CloudinaryService, CloudinaryProvider],
  exports: [CloudinaryService, CloudinaryProvider],
})
export class CloudinaryModule {}
