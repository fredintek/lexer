import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
  reset_password_token_exp: process.env.RESET_PASSWORD_TOKEN_EXPIRATION,
  jwt_secret: process.env.JWT_SECRET,
  jwt_audience: process.env.JWT_AUDIENCE,
  jwt_issuer: process.env.JWT_ISSUER,
  jwt_expiresIn: process.env.JWT_EXPIRES_IN,
  jwt_refresh_expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
  refresh_token_max_age: process.env.REFRESH_TOKEN_MAX_AGE,
}));
