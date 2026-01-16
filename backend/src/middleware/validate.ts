import { NextFunction, Request, Response } from "express";
import { ZodSchema, ZodError, ZodIssue } from "zod";
import { AppError, ErrorCode, ValidationError } from "./errorHandler";

/**
 * Parse Zod error into user-friendly validation details
 */
const parseZodError = (error: ZodError): ValidationError[] => {
  return error.issues.map((issue: ZodIssue) => ({
    field: issue.path.join(".") || "unknown",
    message: issue.message,
  }));
};

/**
 * Middleware to validate request body against a Zod schema
 */
export const validateBody =
  (schema: ZodSchema<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const details = parseZodError(result.error);
      const fieldNames = details.map((d) => d.field).join(", ");
      return next(
        new AppError(
          `Validation failed for: ${fieldNames}`,
          ErrorCode.VALIDATION_ERROR,
          details
        )
      );
    }
    req.body = result.data;
    next();
  };

/**
 * Middleware to validate request query parameters against a Zod schema
 */
export const validateQuery =
  (schema: ZodSchema<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      const details = parseZodError(result.error);
      const fieldNames = details.map((d) => d.field).join(", ");
      return next(
        new AppError(
          `Invalid query parameters: ${fieldNames}`,
          ErrorCode.VALIDATION_ERROR,
          details
        )
      );
    }
    req.query = result.data;
    next();
  };

/**
 * Middleware to validate request params against a Zod schema
 */
export const validateParams =
  (schema: ZodSchema<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      const details = parseZodError(result.error);
      const fieldNames = details.map((d) => d.field).join(", ");
      return next(
        new AppError(
          `Invalid path parameters: ${fieldNames}`,
          ErrorCode.VALIDATION_ERROR,
          details
        )
      );
    }
    req.params = result.data;
    next();
  };
