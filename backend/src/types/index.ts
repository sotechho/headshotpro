import type { IUser } from '@/models/User.model';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export interface GenerateAccessAndRefreshToken {
  accessToken: string;
  refreshToken: string;
}

export interface LoginServiceResponse extends GenerateAccessAndRefreshToken {
  user: IUser;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}

export interface RateLimitConfig {
  maxRequest: number;
  windowSeconds: number;
  identifierType: 'ip' | 'email';
  keyPrefix: string;
  message?: string;
}
