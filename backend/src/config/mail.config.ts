import { registerAs } from '@nestjs/config';

export default registerAs('mail', () => ({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: process.env.MAIL_SECURE,
  user: process.env.MAIL_USER,
  pass: process.env.MAIL_PASS,
  no_reply: process.env.NO_REPLY,
  email_otp_exp: process.env.EMAIL_OTP_EXPIRATION,
}));
