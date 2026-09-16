import { rateLimitService } from '@/services/redis';
import type { RateLimitConfig } from '@/types';
import { getIdentifier } from '@/utils';
import { TooManyRequestsError } from '@/utils/errors';
import logger from '@/utils/logger';
import type { NextFunction, Request, Response } from 'express';

function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds} second${seconds !== 1 ? 's' : ''}`;
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  }

  const days = Math.floor(hours / 24);
  return `${days} day${days !== 1 ? 's' : ''}`;
}

export function rateLimitMiddleware(config: RateLimitConfig) {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {
      const key = `ratelimit:${config.keyPrefix}:${getIdentifier(req, config)}`;
      const { allowed, remaining, resetAt } =
        await rateLimitService.checkRateLimit(
          key,
          config.maxRequest,
          config.windowSeconds,
        );

      logger.info('Reset at', {
        resetAt,
        key,
      });

      res.setHeader('X-RateLimit-Limit', config.maxRequest);
      res.setHeader('X-RateLimit-Remaining', remaining);
      res.setHeader('X-RateLimit-Reset', resetAt.toISOString());

      if (!allowed) {
        const resetAtSeconds = Math.floor(new Date(resetAt).getTime() / 1000);
        const nowSeconds = Math.floor(Date.now() / 1000);
        const secondsRemaining = Math.max(0, resetAtSeconds - nowSeconds);
        return next(
          new TooManyRequestsError(
            `Too many requests try again after: ${formatDuration(secondsRemaining)}`,
          ),
        );
      }
      next();
    } catch (error) {
      next(error);
    }
  };
}
