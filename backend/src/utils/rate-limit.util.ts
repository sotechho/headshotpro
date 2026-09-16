import type { RateLimitConfig } from '@/types';
import type { Request } from 'express';
import logger from './logger';

export function getIdentifier(req: Request, config: RateLimitConfig) {
  if (config.identifierType === 'email') {
    const email = req.body?.email as string;
    if (!email) {
      return getRequestIp(req);
    }
    return email.toLowerCase().trim();
  }
  return getRequestIp(req);
}

export function getRequestIp(req: Request): string {
  const forwadedFor = req.headers['x-forwarded-for'];
  logger.info('Request forwaded for:', { forwadedFor });

  if (forwadedFor) {
    const ip =
      typeof forwadedFor === 'string'
        ? forwadedFor.split(',')[0]?.trim()
        : 'unknown';
    return ip as string;
  }

  const fallbackIp =
    req.headers['x-real-ip'] || req.socket.remoteAddress || 'unknown';
  logger.info('Missing forwaded for and using fallback', { fallbackIp });
  return fallbackIp as string;
}
