import logger from '@/utils/logger';
import { redisService } from './redis.service';

class RedisCacheService {
  async set<T>(key: string, value: T, ttl: number): Promise<void> {
    try {
      if (!redisService.isConnected()) {
        return;
      }
      await redisService.setx(key, JSON.stringify(value), ttl);
    } catch (error) {
      logger.error('Failed to set cache', { key, error });
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      if (!redisService.isConnected()) {
        return null;
      }
      const value = await redisService.get(key);
      const parsedData = value ? (JSON.parse(value) as T) : null;
      return parsedData;
    } catch (error) {
      logger.error('Failed to get cache', { key, error });
      return null;
    }
  }

  async delete(key: string): Promise<void> {
    try {
      if (!redisService.isConnected()) {
        return;
      }
      await redisService.del(key);
    } catch (error) {
      logger.error('Failed to delete cache', { key, error });
    }
  }

  async deleteByPattern(pattern: string): Promise<void> {
    try {
      const keys = await redisService.getAllMatchingKeys(pattern);
      if (keys.length === 0) {
        return;
      }
      await Promise.all(keys.map((key: string) => this.delete(key)));
    } catch (error) {
      logger.error('Failed to delete cache by pattern', { pattern, error });
    }
  }
}

export const redisCacheService = new RedisCacheService();
