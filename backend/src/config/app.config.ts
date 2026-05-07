import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  env: process.env.NODE_ENV,
  port: process.env.PORT,
  api_version: process.env.API_VERSION,
  frontend_url: process.env.FRONTEND_URL,
  cloudinary_cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  cloudinary_api_key: process.env.CLOUDINARY_API_KEY,
  cloudinary_api_secret: process.env.CLOUDINARY_API_SECRET,
  totp_secret: process.env.ENCRYPTION_KEY,
}));
