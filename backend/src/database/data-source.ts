import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import * as path from 'path';

const envFile =
  process.env.NODE_ENV === 'production' ? '.env.prod' : '.env.dev';
config({ path: path.resolve(process.cwd(), envFile) });

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [
    process.env.NODE_ENV === 'production'
      ? 'dist/**/*.entity.js'
      : 'src/**/*.entity.ts',
  ],
  migrations: [
    process.env.NODE_ENV === 'production'
      ? 'dist/database/migrations/*.js'
      : 'src/database/migrations/*.ts',
  ],
  synchronize: false,
  logging: process.env.NODE_ENV !== 'production',
});
