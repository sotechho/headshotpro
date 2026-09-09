import { config } from '@/config';
import { errors } from '@/constants';
import { AppError, ValidationError } from '@/utils/errors';
import logger from '@/utils/logger';
import { errorResponse } from '@/utils/responses';
import type { NextFunction, Request, Response } from 'express';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  logger.error(err.message, { err });

  // handle app errors
  if (err instanceof AppError) {
    const errors =
      err instanceof ValidationError ? err.validationErrors : undefined;
    if (errors) {
      logger.error('Request validation failed', {
        method: req.method,
        path: req.originalUrl,
        errors,
      });
    }
    return errorResponse(res, err.statusCode, err.message, errors);
  }

  // handle mongodb validation errors
  if (err.name === 'ValidationError') {
    return errorResponse(
      res,
      errors.VALIDATION_ERROR.status,
      'Validation error',
    );
  }

  // handle mongodb duplicate errors
  if (err.name === 'MongoServerError' && (err as any).code === 11000) {
    const errorMessage = 'Duplicate field value';
    return errorResponse(res, errors.CONFLICT.status, errorMessage);
  }

  // handle jwt errors

  if (err.name === 'JsonWebTokenError') {
    return errorResponse(res, errors.UNAUTHORIZED.status, 'Invalid token');
  }

  if (err.name === 'TokenExpiredError') {
    return errorResponse(res, errors.UNAUTHORIZED.status, 'Token expired');
  }

  const errorMessage =
    config.env === 'development'
      ? err.message || 'Internal Server Error'
      : 'Internal Server Error';

  return errorResponse(res, 500, errorMessage);
}
