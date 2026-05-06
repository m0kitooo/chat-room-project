import 'dotenv/config';
import { exit } from 'node:process';
import { z } from 'zod';
import { formatZodIssues } from '../utils/zod.js';

const base64urlStringRegex = /^[A-Za-z0-9_-]+$/;

const verifyEnv = () => {
  const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production']).default('development'),
    HOST: z.string().default('localhost'),
    PORT: z.coerce.number().default(3000),
    APP_URL: z.url(),
    DATABASE_URL: z.string(),
    BCRYPT_ROUNDS: z.coerce.number().default(12),
    JWT_ACCESS_SECRET_BASE64URL: z.string().regex(base64urlStringRegex),
    JWT_ACCESS_EXPIRES_IN: z.string(),
    JWT_VERIFICATION_SECRET_BASE64URL: z.string().regex(base64urlStringRegex),
    JWT_VERIFICATION_EXPIRES_IN: z.coerce.number(),
    SMTP_HOST: z.string(),
    SMTP_PORT: z.coerce.number().default(587),
    SMTP_USER: z.string(),
    SMTP_PASS: z.string(),
    LOG_DIR: z.string().optional(),
  });
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('Invalid env configuration provided, missing variables:', formatZodIssues(result.error.issues));
    exit(1);
  }
  return result.data;
};

export default verifyEnv();