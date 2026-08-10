import dotenv from 'dotenv';

dotenv.config();

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  PORT: parseInt(process.env.PORT ?? '3001', 10),
  CORS_ORIGIN: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
  DATABASE_URL:
    process.env.DATABASE_URL ??
    'postgresql://postgres:postgres@localhost:5432/rwavenue?schema=public',
  API_BASE_URL: process.env.API_BASE_URL ?? '',
  API_TIMEOUT: parseInt(process.env.API_TIMEOUT ?? '30000', 10),
};
