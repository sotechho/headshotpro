import { rateLimitMiddleware } from '../rate-limit.middleware';

export const rateLimit = {
  general: rateLimitMiddleware({
    identifierType: 'ip',
    keyPrefix: 'general:api',
    maxRequest: 100,
    windowSeconds: 60,
  }),
  auth: {
    login: rateLimitMiddleware({
      identifierType: 'email',
      keyPrefix: 'auth:login',
      maxRequest: 5,
      windowSeconds: 5 * 60,
    }),
    register: rateLimitMiddleware({
      identifierType: 'email',
      keyPrefix: 'auth:register',
      maxRequest: 5,
      windowSeconds: 5 * 60,
    }),
    resendVerification: rateLimitMiddleware({
      identifierType: 'email',
      keyPrefix: 'auth:resend',
      maxRequest: 5,
      windowSeconds: 15 * 60,
    }),
  },
};
