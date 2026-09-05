import { AI_PROVIDERS } from '@/constants/ai.constants';
import { parseBool } from '@/utils';
import dotenv from 'dotenv';

dotenv.config();

type SMTPOptions = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
  from: string;
  logger: boolean;
  debug: boolean;
};

const smtp: SMTPOptions = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: parseBool(
    process.env.SMTP_SECURE,
    process.env.NODE_ENV === 'production',
  ),
  user: process.env.SMTP_USER || '',
  password: process.env.SMTP_PASSWORD || '',
  from: process.env.EMAIL_FROM || 'info@headshotpro.ai',
  logger: process.env.NODE_ENV === 'development',
  debug: process.env.NODE_ENV === 'development',
};

const jwt = {
  accessSecret: process.env.JWT_ACCESS_SECRET || 'dev_access_secret',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret',
  accessExpiresIn: process.env.JWT_ACCESS_EXPIRES || '15m',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES || '7d',
};

const waafipay = {
  MERCHANT_U_ID: process.env.MERCHANT_U_ID || '',
  MERCHANT_API_KEY: process.env.MERCHANT_API_KEY || '',
  MERCHANT_API_USER_ID: process.env.MERCHANT_API_USER_ID || '',
  MERCHANT_API_END_POINT: process.env.MERCHANT_API_END_POINT || '',
};

const ebir = {
  EBIR_MERCHANT_U_ID: process.env.EBIR_MERCHANT_U_ID || '',
  EBIR_MERCHANT_API_KEY: process.env.EBIR_MERCHANT_API_KEY || '',
  EBIR_MERCHANT_API_USER_ID: process.env.EBIR_MERCHANT_API_USER_ID || '',
  EBIR_MERCHANT_API_END_POINT: process.env.EBIR_MERCHANT_API_END_POINT || '',
};

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 8000,
  database: {
    url: process.env.DATABASE_URL || 'mongodb://localhost:27017/headshotpro',
  },
  apiVersionPrefix: {
    v1: '/api/v1',
  },
  frontendUrl:
    process.env.NODE_ENV === 'production'
      ? process.env.FRONTEND_URL
      : 'http://localhost:3000',
  logger: {
    directory: 'logs',
    files: {
      error: 'error.log',
      warn: 'warn.log',
      combined: 'combined.log',
    },
  },
  smtp,
  jwt,
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    webhookSecretKey: process.env.STRIPE_WEBHOOK_SECRET || '',
  },
  waafipay,
  ebir,
  upload: {
    allowedFilesMimeTypes: [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
    ],
    maxFiles: 1,
    maxFileSize: 10 * 1024 * 1024, // 10 MB
  },
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    accessSecretKey: process.env.AWS_SECRET_ACCESS_KEY,
    bucketName: process.env.AWS_BUCKET_NAME || 'headshotpros3bucket',
    region: process.env.AWS_REGION,
    version: process.env.AWS_VERSION || '2010-12-01',
  },
  replicate: {
    apiKey: process.env.REPLICATE_API_KEY || '',
  },
  aiProvider: process.env.AI_PROVIDER || AI_PROVIDERS.REPLICATE,
};
