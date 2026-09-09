import { errors } from '@/constants';
import { AppError, ValidationError } from '@/utils/errors';
import logger from '@/utils/logger';
import type { NextFunction, Request, Response } from 'express';
import { z, ZodError } from 'zod';

function handleValidationError(error: unknown, next: NextFunction) {
  if (error instanceof ZodError) {
    const validationErrors = error.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    }));

    logger.error('Validation error', {
      issues: error.issues,
      validationErrors,
    });

    return next(new ValidationError('Validation error', validationErrors));
  }

  const { code, status: statusCode } = errors.VALIDATION_ERROR;
  return next(new AppError(statusCode, code, 'Validation error', true));
}

function setParsedRequestProperty(
  req: Request,
  property: 'body' | 'query' | 'params',
  value: unknown,
) {
  Object.defineProperty(req, property, {
    configurable: true,
    enumerable: true,
    value,
    writable: true,
  });
}

export function validateRequest(schema: z.ZodType<unknown>) {
  return function (req: Request, _res: Response, next: NextFunction) {
    try {
      const validated = z.parse(schema, req.body);
      setParsedRequestProperty(req, 'body', validated);
      next();
    } catch (error) {
      return handleValidationError(error, next);
    }
  };
}

export function validateQuery(schema: z.ZodType<unknown>) {
  return function (req: Request, _res: Response, next: NextFunction) {
    try {
      const validated = schema.parse(req.query);

      setParsedRequestProperty(req, 'query', validated);
      next();
    } catch (error) {
      return handleValidationError(error, next);
    }
  };
}

export function validateParams(schema: z.ZodType<unknown>) {
  return function (req: Request, _res: Response, next: NextFunction) {
    try {
      const validated = schema.parse(req.params);
      setParsedRequestProperty(req, 'params', validated);
      next();
    } catch (error) {
      return handleValidationError(error, next);
    }
  };
}
