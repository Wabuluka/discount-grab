import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";
import { AppError } from "./errorHandler";

export const validateBody =
  (schema: ZodSchema<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return next(
        new AppError(
          "Validation Error: " + JSON.stringify(result.error.format()),
          400
        )
      );
    }
    req.body = result.data;
    next();
  };
