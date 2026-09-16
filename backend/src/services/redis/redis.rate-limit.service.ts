import type { RateLimitResult } from '@/types';
import logger from '@/utils/logger';
import { redisService } from './redis.service';

class RateLimitService {
  async resetRateLimit(key: string): Promise<void> {
    try {
      await redisService.del(key);
    } catch (error) {
      logger.error('Reset rate limit failed', { key, error });
    }
  }

  async checkRateLimit(
    key: string,
    limit: number,
    windowSeconds: number,
  ): Promise<RateLimitResult> {
    try {
      if (!redisService.isConnected()) {
        return {
          allowed: true,
          remaining: limit,
          resetAt: new Date(Date.now() + windowSeconds * 1000),
        };
      }

      const count = await redisService.incr(key);
      if (count === 1) {
        await redisService.expires(key, windowSeconds);
      }

      const allowed = count <= limit;
      const remaining = Math.max(0, count - limit);
      const ttl = await redisService.ttl(key);

      return {
        allowed,
        remaining,
        resetAt: new Date(Date.now() + ttl * 1000),
      };
    } catch (error) {
      logger.error('Checking rate limiting failed', { key, error });
      return {
        allowed: true,
        remaining: limit,
        resetAt: new Date(Date.now() + windowSeconds * 1000),
      };
    }
  }

  async getRateLimitStatus(
    key: string,
    limit: number,
  ): Promise<RateLimitResult> {
    try {
      if (!redisService.isConnected()) {
        return {
          allowed: true,
          remaining: limit,
          resetAt: new Date(Date.now()),
        };
      }
      const value = await redisService.get(key);
      const count = value ? parseInt(value, 10) : 0;
      const allowed = count <= limit;
      const remaining = Math.max(0, count - limit);
      const ttl = await redisService.ttl(key);

      return {
        allowed,
        remaining,
        resetAt: new Date(Date.now() + ttl * 1000),
      };
    } catch (error) {
      logger.error('Get rate limit status failed', { key, error });
      return {
        allowed: true,
        remaining: limit,
        resetAt: new Date(Date.now()),
      };
    }
  }
}

export const rateLimitService = new RateLimitService();
