import env from './env.js';
import * as jose from 'jose';

export const config = {
  isDev: env.NODE_ENV === 'development',
  isProd: env.NODE_ENV === 'production',

  server: {
    host: env.HOST,
    port: env.PORT,
    appUrl: env.APP_URL,
  },

  logs: {
    dir: env.LOG_DIR ?? (env.NODE_ENV === 'production' ? '/var/log/app' : 'logs'),
  },

  db: {
    url: env.DATABASE_URL,
  },

  bcrypt: {
    rounds: env.BCRYPT_ROUNDS,
  },

  jwt: {
    access: {
      secret: jose.base64url.decode(env.JWT_ACCESS_SECRET_BASE64URL),
      expiresIn: env.JWT_ACCESS_EXPIRES_IN,
    },
    verification: {
      secret: jose.base64url.decode(env.JWT_VERIFICATION_SECRET_BASE64URL),
      expiresIn: env.JWT_VERIFICATION_EXPIRES_IN,
    },
  },

  smtp: {
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
} as const;
