import { errors } from "@/constants";

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly code: string;

  constructor(
    statusCode: number = errors.INTERNAL_SERVER_ERROR.status,
    code: string = errors.INTERNAL_SERVER_ERROR.code,
    message: string = "Internal server error",
    isOperational: boolean = true,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class ValidationError extends AppError {
  public readonly validationErrors: Record<string, string>[];
  constructor(
    message: string = "Validation error",
    validationErrors: Record<string, string>[],
    isOperational: boolean = true,
  ) {
    super(
      errors.VALIDATION_ERROR.status,
      errors.VALIDATION_ERROR.code,
      message,
      isOperational,
    );
    this.validationErrors = validationErrors;
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(
    message: string = "Resource not found",
    isOperational: boolean = true,
  ) {
    super(
      errors.NOT_FOUND.status,
      errors.NOT_FOUND.code,
      message,
      isOperational,
    );
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized", isOperational: boolean = true) {
    super(
      errors.UNAUTHORIZED.status,
      errors.UNAUTHORIZED.code,
      message,
      isOperational,
    );
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = "Forbidden", isOperational: boolean = true) {
    super(
      errors.FORBIDDEN.status,
      errors.FORBIDDEN.code,
      message,
      isOperational,
    );
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = "Conflict", isOperational: boolean = true) {
    super(errors.CONFLICT.status, errors.CONFLICT.code, message, isOperational);
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}

export class ExternalServiceError extends AppError {
  public readonly externalServiceName: string;
  constructor(
    message: string = "External service error",
    externalServiceName: string = "Unknown",
    isOperational: boolean = true,
  ) {
    super(
      errors.EXTERNAL_SERVICE_ERROR.status,
      errors.EXTERNAL_SERVICE_ERROR.code,
      `${externalServiceName}: ${message}`,
      isOperational,
    );
    this.externalServiceName = externalServiceName;
    Object.setPrototypeOf(this, ExternalServiceError.prototype);
  }
}

export class TooManyRequestsError extends AppError {
  constructor(
    message: string = "Too many requests",
    isOperational: boolean = true,
  ) {
    super(
      errors.TOO_MANY_REQUESTS.status,
      errors.TOO_MANY_REQUESTS.code,
      message,
      isOperational,
    );
    Object.setPrototypeOf(this, TooManyRequestsError.prototype);
  }
}

export class InsufficientCreditError extends AppError {
  constructor(
    message: string = "Insufficient credit",
    isOperational: boolean = true,
  ) {
    super(
      errors.INSUFFICIENT_CREDIT.status,
      errors.INSUFFICIENT_CREDIT.code,
      message,
      isOperational,
    );
    Object.setPrototypeOf(this, InsufficientCreditError.prototype);
  }
}

export class BadRequestError extends AppError {
  constructor(message:string = "Bad Request",isOperational: boolean = true){
    super(
      errors.BAD_REQUEST.status,
      errors.BAD_REQUEST.code,
      message,
      isOperational
    )
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }
}