import { config } from '@/config';
import logger from '@/utils/logger';
import Redis from 'ioredis';

class RedisService {
  private client: Redis | null = null;

  constructor() {
    if (!config.redisUrl) {
      logger.warn('Redis credentials missing');
      this.client = null;
    }
    this.client = new Redis(config.redisUrl);
  }

  async setx(key: string, value: string, expires: number): Promise<void> {
    try {
      if (!this.client) {
        logger.warn('Redis connection failed');
        return;
      }
      await this.client.set(key, value, 'EX', expires);
    } catch (error) {
      logger.error('Failed to set', { error, key, expires });
    }
  }

  async get(key: string): Promise<string | null> {
    try {
      if (!this.client) {
        logger.warn('Redis connection failed');
        return null;
      }
      return await this.client.get(key);
    } catch (error) {
      logger.error('Failed to get', { error, key });
      return null;
    }
  }

  async incr(key: string): Promise<number> {
    try {
      if (!this.client) {
        logger.warn('Redis connection failed');
        return 0;
      }
      return await this.client.incr(key);
    } catch (error) {
      logger.error('Failed to increment', { error, key });
      return 0;
    }
  }

  async expires(key: string, expires: number): Promise<void> {
    try {
      if (!this.client) {
        logger.warn('Redis connection failed');
        return;
      }
      await this.client.expire(key, expires);
    } catch (error) {
      logger.error('Failed to set expiration', { error, key, expires });
    }
  }

  async del(key: string): Promise<void> {
    try {
      if (!this.client) {
        logger.warn('Redis connection failed');
        return;
      }
      await this.client.del(key);
    } catch (error) {
      logger.error('Failed to delete', { error, key });
    }
  }

  async ttl(key: string): Promise<number> {
    try {
      if (!this.client) {
        logger.warn('Redis connection failed');
        return 0;
      }
      return await this.client.ttl(key);
    } catch (error) {
      logger.error('Failed to delete', { error, key });
      return 0;
    }
  }

  isConnected(): boolean {
    return !!this.client;
  }
}

export const redisService = new RedisService();
