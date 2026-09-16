import { rateLimitService } from '@/services/redis';
import type { RateLimitConfig } from '@/types';
import { TooManyRequestsError } from '@/utils/errors';
import { getIdentifier } from '@/utils';
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

  return `${hours} hour${hours !== 1 ? 's' : ''}`;
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

      res.setHeader('X-RateLimit-Limit', config.maxRequest);
      res.setHeader('X-RateLimit-Remaining', remaining);
      res.setHeader('X-RateLimit-Reset', resetAt.toISOString());

      if (!allowed) {
        return next(
          new TooManyRequestsError(
            `Too many requests rtry again after: ${formatDuration(config.windowSeconds)}`,
          ),
        );
      }
      next();
    } catch (error) {
      next(error);
    }
  };
}
