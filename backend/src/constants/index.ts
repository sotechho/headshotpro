export * from './headshot.constants';

export const errors = {
  BAD_REQUEST: {
    status: 400,
    code: 'BAD_REQUEST',
  },
  UNAUTHORIZED: {
    status: 401,
    code: 'UNAUTHORIZED',
  },
  FORBIDDEN: {
    status: 403,
    code: 'FORBIDDEN',
  },
  NOT_FOUND: {
    status: 404,
    code: 'NOT_FOUND',
  },
  CONFLICT: {
    status: 409,
    code: 'CONFLICT',
  },
  INTERNAL_SERVER_ERROR: {
    status: 500,
    code: 'INTERNAL_SERVER_ERROR',
  },
  EXTERNAL_SERVICE_ERROR: {
    status: 502,
    code: 'EXTERNAL_SERVICE_ERROR',
  },
  TOO_MANY_REQUESTS: {
    code: 'TOO_MANY_REQUESTS',
    status: 429,
  },
  VALIDATION_ERROR: {
    code: 'VALIDATION_ERROR',
    status: 422,
  },
  INSUFFICIENT_CREDIT: {
    code: 'INSUFFICIENT_CREDIT',
    status: 402,
  },
};

export const role = {
  user: 'user',
  admin: 'admin',
};
