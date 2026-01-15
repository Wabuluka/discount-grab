import { NextFunction, Request, Response } from "express";
import { AppError } from "./errorHandler";

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

const cleanupInterval = setInterval(() => {
  const now = Date.now();
  for (const key in store) {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  }
}, 60000);

if (cleanupInterval.unref) {
  cleanupInterval.unref();
}

interface RateLimitOptions {
  windowMs?: number;
  max?: number;
  message?: string;
  keyGenerator?: (req: Request) => string;
}

export const rateLimiter = (options: RateLimitOptions = {}) => {
  const {
    windowMs = 60000,
    max = 100,
    message = "Too many requests, please try again later",
    keyGenerator = (req: Request) => req.ip || "unknown",
  } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    const key = keyGenerator(req);
    const now = Date.now();

    if (!store[key] || store[key].resetTime < now) {
      store[key] = {
        count: 1,
        resetTime: now + windowMs,
      };
      return next();
    }

    store[key].count++;

    if (store[key].count > max) {
      const retryAfter = Math.ceil((store[key].resetTime - now) / 1000);
      res.setHeader("Retry-After", retryAfter);
      return next(new AppError(message, 429));
    }

    next();
  };
};

export const authLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many login attempts, please try again after 15 minutes",
  keyGenerator: (req) => `auth_${req.ip}`,
});

export const apiLimiter = rateLimiter({
  windowMs: 60 * 1000,
  max: 100,
  message: "Too many API requests",
});
