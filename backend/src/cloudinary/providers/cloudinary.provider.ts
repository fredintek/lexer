import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

export const CLOUDINARY = 'CLOUDINARY';

export const CloudinaryProvider = {
  provide: CLOUDINARY,
  useFactory: (configService: ConfigService) => {
    const config = {
      cloud_name: configService.get<string>('app.cloudinary_cloud_name'),
      api_key: configService.get<string>('app.cloudinary_api_key'),
      api_secret: configService.get<string>('app.cloudinary_api_secret'),
    };
    console.log('Cloudinary Config Loaded:', !!config.api_secret);
    return cloudinary.config(config);
  },
  inject: [ConfigService]
};