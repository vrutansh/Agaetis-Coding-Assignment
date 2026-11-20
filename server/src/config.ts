import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config({ path: new URL('../../.env', import.meta.url) });

const envSchema = z.object({
  DATABASE_URL: z.string().min(1).default('postgresql://roster:roster@127.0.0.1:5433/roster'),
  PORT: z.coerce.number().int().positive().default(4000),
  CORS_ORIGINS: z.string().default('http://localhost:5173'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

export const config = envSchema.parse(process.env);
export const allowedOrigins = config.CORS_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean);
