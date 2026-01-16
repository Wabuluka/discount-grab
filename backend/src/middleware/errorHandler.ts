import { NextFunction, Request, Response } from "express";
import { Error as MongooseError } from "mongoose";
import logger, { logError, logSecurityEvent } from "../utils/logger";

// Error codes for consistent error identification
export enum ErrorCode {
  // Validation Errors (4000-4099)
  VALIDATION_ERROR = "VALIDATION_ERROR",
  INVALID_INPUT = "INVALID_INPUT",
  MISSING_FIELD = "MISSING_FIELD",
  INVALID_FORMAT = "INVALID_FORMAT",

  // Authentication Errors (4100-4199)
  UNAUTHORIZED = "UNAUTHORIZED",
  INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
  TOKEN_EXPIRED = "TOKEN_EXPIRED",
  TOKEN_INVALID = "TOKEN_INVALID",
  TOKEN_MISSING = "TOKEN_MISSING",

  // Authorization Errors (4300-4399)
  FORBIDDEN = "FORBIDDEN",
  INSUFFICIENT_PERMISSIONS = "INSUFFICIENT_PERMISSIONS",

  // Resource Errors (4400-4499)
  NOT_FOUND = "NOT_FOUND",
  RESOURCE_NOT_FOUND = "RESOURCE_NOT_FOUND",
  USER_NOT_FOUND = "USER_NOT_FOUND",
  PRODUCT_NOT_FOUND = "PRODUCT_NOT_FOUND",
  ORDER_NOT_FOUND = "ORDER_NOT_FOUND",
  CART_NOT_FOUND = "CART_NOT_FOUND",
  CATEGORY_NOT_FOUND = "CATEGORY_NOT_FOUND",

  // Conflict Errors (4900-4999)
  CONFLICT = "CONFLICT",
  DUPLICATE_ENTRY = "DUPLICATE_ENTRY",
  EMAIL_EXISTS = "EMAIL_EXISTS",
  SLUG_EXISTS = "SLUG_EXISTS",

  // Business Logic Errors (5000-5099)
  BUSINESS_ERROR = "BUSINESS_ERROR",
  INSUFFICIENT_STOCK = "INSUFFICIENT_STOCK",
  CART_EMPTY = "CART_EMPTY",
  ORDER_CANNOT_CANCEL = "ORDER_CANNOT_CANCEL",
  INVALID_QUANTITY = "INVALID_QUANTITY",

  // Rate Limiting (4290)
  RATE_LIMITED = "RATE_LIMITED",

  // Server Errors (5000+)
  INTERNAL_ERROR = "INTERNAL_ERROR",
  DATABASE_ERROR = "DATABASE_ERROR",
  SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",
}

// Map error codes to HTTP status codes
const errorCodeToStatus: Record<ErrorCode, number> = {
  [ErrorCode.VALIDATION_ERROR]: 400,
  [ErrorCode.INVALID_INPUT]: 400,
  [ErrorCode.MISSING_FIELD]: 400,
  [ErrorCode.INVALID_FORMAT]: 400,
  [ErrorCode.UNAUTHORIZED]: 401,
  [ErrorCode.INVALID_CREDENTIALS]: 401,
  [ErrorCode.TOKEN_EXPIRED]: 401,
  [ErrorCode.TOKEN_INVALID]: 401,
  [ErrorCode.TOKEN_MISSING]: 401,
  [ErrorCode.FORBIDDEN]: 403,
  [ErrorCode.INSUFFICIENT_PERMISSIONS]: 403,
  [ErrorCode.NOT_FOUND]: 404,
  [ErrorCode.RESOURCE_NOT_FOUND]: 404,
  [ErrorCode.USER_NOT_FOUND]: 404,
  [ErrorCode.PRODUCT_NOT_FOUND]: 404,
  [ErrorCode.ORDER_NOT_FOUND]: 404,
  [ErrorCode.CART_NOT_FOUND]: 404,
  [ErrorCode.CATEGORY_NOT_FOUND]: 404,
  [ErrorCode.CONFLICT]: 409,
  [ErrorCode.DUPLICATE_ENTRY]: 409,
  [ErrorCode.EMAIL_EXISTS]: 409,
  [ErrorCode.SLUG_EXISTS]: 409,
  [ErrorCode.BUSINESS_ERROR]: 400,
  [ErrorCode.INSUFFICIENT_STOCK]: 400,
  [ErrorCode.CART_EMPTY]: 400,
  [ErrorCode.ORDER_CANNOT_CANCEL]: 400,
  [ErrorCode.INVALID_QUANTITY]: 400,
  [ErrorCode.RATE_LIMITED]: 429,
  [ErrorCode.INTERNAL_ERROR]: 500,
  [ErrorCode.DATABASE_ERROR]: 500,
  [ErrorCode.SERVICE_UNAVAILABLE]: 503,
};

// User-friendly error messages
const errorCodeMessages: Record<ErrorCode, string> = {
  [ErrorCode.VALIDATION_ERROR]: "The provided data is invalid",
  [ErrorCode.INVALID_INPUT]: "Invalid input provided",
  [ErrorCode.MISSING_FIELD]: "Required field is missing",
  [ErrorCode.INVALID_FORMAT]: "Invalid data format",
  [ErrorCode.UNAUTHORIZED]: "Authentication required",
  [ErrorCode.INVALID_CREDENTIALS]: "Invalid email or password",
  [ErrorCode.TOKEN_EXPIRED]: "Your session has expired. Please log in again",
  [ErrorCode.TOKEN_INVALID]: "Invalid authentication token",
  [ErrorCode.TOKEN_MISSING]: "Authentication token is required",
  [ErrorCode.FORBIDDEN]: "You do not have permission to perform this action",
  [ErrorCode.INSUFFICIENT_PERMISSIONS]: "Insufficient permissions",
  [ErrorCode.NOT_FOUND]: "The requested resource was not found",
  [ErrorCode.RESOURCE_NOT_FOUND]: "Resource not found",
  [ErrorCode.USER_NOT_FOUND]: "User not found",
  [ErrorCode.PRODUCT_NOT_FOUND]: "Product not found",
  [ErrorCode.ORDER_NOT_FOUND]: "Order not found",
  [ErrorCode.CART_NOT_FOUND]: "Cart not found",
  [ErrorCode.CATEGORY_NOT_FOUND]: "Category not found",
  [ErrorCode.CONFLICT]: "A conflict occurred with the current state",
  [ErrorCode.DUPLICATE_ENTRY]: "This entry already exists",
  [ErrorCode.EMAIL_EXISTS]: "An account with this email already exists",
  [ErrorCode.SLUG_EXISTS]: "This slug is already in use",
  [ErrorCode.BUSINESS_ERROR]: "Unable to complete the operation",
  [ErrorCode.INSUFFICIENT_STOCK]: "Insufficient stock available",
  [ErrorCode.CART_EMPTY]: "Your cart is empty",
  [ErrorCode.ORDER_CANNOT_CANCEL]: "This order cannot be cancelled",
  [ErrorCode.INVALID_QUANTITY]: "Invalid quantity specified",
  [ErrorCode.RATE_LIMITED]: "Too many requests. Please try again later",
  [ErrorCode.INTERNAL_ERROR]: "An unexpected error occurred",
  [ErrorCode.DATABASE_ERROR]: "A database error occurred",
  [ErrorCode.SERVICE_UNAVAILABLE]: "Service is temporarily unavailable",
};

export interface ValidationError {
  field: string;
  message: string;
}

export class AppError extends Error {
  statusCode: number;
  code: ErrorCode;
  isOperational: boolean;
  details?: ValidationError[];
  timestamp: string;

  constructor(
    message: string,
    code: ErrorCode = ErrorCode.INTERNAL_ERROR,
    details?: ValidationError[],
    isOperational = true
  ) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.statusCode = errorCodeToStatus[code] || 500;
    this.isOperational = isOperational;
    this.details = details;
    this.timestamp = new Date().toISOString();
    Error.captureStackTrace(this, this.constructor);
  }

  // Factory methods for common errors
  static validation(message: string, details?: ValidationError[]) {
    return new AppError(message, ErrorCode.VALIDATION_ERROR, details);
  }

  static unauthorized(message?: string, code?: ErrorCode) {
    return new AppError(
      message || errorCodeMessages[ErrorCode.UNAUTHORIZED],
      code || ErrorCode.UNAUTHORIZED
    );
  }

  static forbidden(message?: string) {
    return new AppError(
      message || errorCodeMessages[ErrorCode.FORBIDDEN],
      ErrorCode.FORBIDDEN
    );
  }

  static notFound(resource?: string) {
    const message = resource
      ? `${resource} not found`
      : errorCodeMessages[ErrorCode.NOT_FOUND];
    return new AppError(message, ErrorCode.NOT_FOUND);
  }

  static conflict(message: string, code?: ErrorCode) {
    return new AppError(message, code || ErrorCode.CONFLICT);
  }

  static badRequest(message: string, code?: ErrorCode) {
    return new AppError(message, code || ErrorCode.BUSINESS_ERROR);
  }

  static internal(message?: string) {
    return new AppError(
      message || errorCodeMessages[ErrorCode.INTERNAL_ERROR],
      ErrorCode.INTERNAL_ERROR,
      undefined,
      false
    );
  }
}

// Error response interface
interface ErrorResponse {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
    details?: ValidationError[];
    timestamp: string;
    path: string;
    method: string;
    requestId?: string;
    stack?: string;
  };
}

// Not found middleware
export const notFound = (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Route not found: ${req.originalUrl}`, ErrorCode.NOT_FOUND));
};

// Main error handler middleware
export const errorHandler = (
  err: Error | AppError | MongooseError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  // Generate request ID if not present
  const requestId =
    (req.headers["x-request-id"] as string) ||
    `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  let appError: AppError;

  // Convert various error types to AppError
  if (err instanceof AppError) {
    appError = err;
  } else if (err.name === "ValidationError" && "errors" in err) {
    // Mongoose validation error
    const mongooseErr = err as MongooseError.ValidationError;
    const details: ValidationError[] = Object.entries(mongooseErr.errors).map(
      ([field, error]) => ({
        field,
        message: error.message,
      })
    );
    appError = AppError.validation("Validation failed", details);
  } else if (err.name === "CastError") {
    // Mongoose cast error (invalid ObjectId)
    const castErr = err as MongooseError.CastError;
    appError = new AppError(
      `Invalid ${castErr.path}: ${castErr.value}`,
      ErrorCode.INVALID_FORMAT
    );
  } else if ((err as any).code === 11000) {
    // MongoDB duplicate key error
    const keyValue = (err as any).keyValue;
    const field = Object.keys(keyValue)[0];
    const value = keyValue[field];
    appError = new AppError(
      `Duplicate value for ${field}: ${value}`,
      ErrorCode.DUPLICATE_ENTRY
    );
  } else if (err.name === "JsonWebTokenError") {
    appError = new AppError(
      "Invalid token",
      ErrorCode.TOKEN_INVALID
    );
    logSecurityEvent("Invalid JWT Token", {
      ip: req.ip || "unknown",
      userAgent: req.headers["user-agent"],
      action: "token_validation",
      success: false,
      reason: err.message,
    });
  } else if (err.name === "TokenExpiredError") {
    appError = new AppError(
      "Token has expired",
      ErrorCode.TOKEN_EXPIRED
    );
  } else {
    // Unknown error - treat as internal error
    appError = new AppError(
      err.message || "An unexpected error occurred",
      ErrorCode.INTERNAL_ERROR,
      undefined,
      false
    );
  }

  // Log the error with full context
  logError(appError, {
    method: req.method,
    url: req.originalUrl,
    userId: (req as any).user?.id,
    requestId,
    additionalData: {
      body: req.body,
      params: req.params,
      query: req.query,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    },
  });

  // Build error response
  const errorResponse: ErrorResponse = {
    success: false,
    error: {
      code: appError.code,
      message: appError.isOperational
        ? appError.message
        : errorCodeMessages[ErrorCode.INTERNAL_ERROR],
      timestamp: appError.timestamp,
      path: req.originalUrl,
      method: req.method,
      requestId,
    },
  };

  // Add validation details if present
  if (appError.details && appError.details.length > 0) {
    errorResponse.error.details = appError.details;
  }

  // Add stack trace in development
  if (process.env.NODE_ENV === "development") {
    errorResponse.error.stack = appError.stack;
  }

  // Send response
  res.status(appError.statusCode).json(errorResponse);
};

// Export error code for use in other modules
export { errorCodeMessages };
