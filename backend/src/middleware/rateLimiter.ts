import { NextFunction, Request, Response } from "express";
import { AppError, ErrorCode } from "./errorHandler";
import { logSecurityEvent } from "../utils/logger";

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
  skipSuccessfulRequests?: boolean;
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
      res.setHeader("Retry-After", String(retryAfter));
      res.setHeader("X-RateLimit-Limit", String(max));
      res.setHeader("X-RateLimit-Remaining", "0");
      res.setHeader("X-RateLimit-Reset", String(Math.ceil(store[key].resetTime / 1000)));

      logSecurityEvent("Rate limit exceeded", {
        ip: req.ip || "unknown",
        userAgent: req.headers["user-agent"],
        action: "rate_limit_exceeded",
        success: false,
        reason: `Exceeded ${max} requests in ${windowMs / 1000}s window`,
      });

      return next(new AppError(message, ErrorCode.RATE_LIMITED));
    }

    // Set rate limit headers for successful requests
    res.setHeader("X-RateLimit-Limit", String(max));
    res.setHeader("X-RateLimit-Remaining", String(max - store[key].count));
    res.setHeader("X-RateLimit-Reset", String(Math.ceil(store[key].resetTime / 1000)));

    next();
  };
};

export const authLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: "Too many login attempts. Please try again after 15 minutes",
  keyGenerator: (req) => `auth_${req.ip}`,
});

export const apiLimiter = rateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  message: "Too many API requests. Please slow down",
});

export const strictLimiter = rateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: "Too many requests for this operation",
});
