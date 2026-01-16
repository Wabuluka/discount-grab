import winston from "winston";
import path from "path";
import fs from "fs";

const { combine, timestamp, printf, colorize, json, errors } = winston.format;

// Sensitive fields to redact from logs
const SENSITIVE_FIELDS = [
  "password",
  "newPassword",
  "currentPassword",
  "confirmPassword",
  "token",
  "accessToken",
  "refreshToken",
  "secret",
  "apiKey",
  "authorization",
  "cookie",
  "creditCard",
  "cardNumber",
  "cvv",
  "ssn",
];

// Check if a key is sensitive
const isSensitiveKey = (key: string): boolean => {
  const lowerKey = key.toLowerCase();
  return SENSITIVE_FIELDS.some((field) => lowerKey.includes(field.toLowerCase()));
};

// Deep sanitize a value (for nested objects)
const sanitizeValue = (value: any, depth = 0): any => {
  // Prevent infinite recursion
  if (depth > 10) return "[Max Depth Exceeded]";

  if (value === null || value === undefined) return value;

  if (typeof value === "string") return value;

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item, depth + 1));
  }

  if (typeof value === "object") {
    const sanitized: Record<string, any> = {};
    for (const [key, val] of Object.entries(value)) {
      if (isSensitiveKey(key)) {
        sanitized[key] = "[REDACTED]";
      } else if (typeof val === "object" && val !== null) {
        sanitized[key] = sanitizeValue(val, depth + 1);
      } else {
        sanitized[key] = val;
      }
    }
    return sanitized;
  }

  return value;
};

// Winston format to sanitize sensitive data
const sanitizeFormat = winston.format((info) => {
  // Iterate over enumerable string keys only (preserves Symbol properties)
  for (const key of Object.keys(info)) {
    if (isSensitiveKey(key)) {
      info[key] = "[REDACTED]";
    } else if (typeof info[key] === "object" && info[key] !== null) {
      info[key] = sanitizeValue(info[key], 0);
    }
  }

  return info;
});

// Ensure logs directory exists
const logsDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Custom format for console output
const consoleFormat = printf(({ level, message, timestamp, stack, ...meta }) => {
  let log = `${timestamp} ${level}: ${message}`;
  if (stack) {
    log += `\n${stack}`;
  }
  if (Object.keys(meta).length > 0) {
    log += `\n${JSON.stringify(meta, null, 2)}`;
  }
  return log;
});

// Custom format for file output (structured JSON)
const fileFormat = combine(
  sanitizeFormat(),
  timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }),
  errors({ stack: true }),
  json()
);

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: combine(
    sanitizeFormat(),
    timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }),
    errors({ stack: true })
  ),
  defaultMeta: { service: "dg-shoppingcart-api" },
  transports: [
    // Console transport with colors
    new winston.transports.Console({
      format: combine(
        sanitizeFormat(),
        colorize({ all: true }),
        timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        consoleFormat
      ),
    }),
    // Combined log file (all levels)
    new winston.transports.File({
      filename: path.join(logsDir, "combined.log"),
      format: fileFormat,
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
    }),
    // Error log file (errors only)
    new winston.transports.File({
      filename: path.join(logsDir, "error.log"),
      level: "error",
      format: fileFormat,
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
    }),
  ],
});

// Helper methods for structured logging
export const logRequest = (
  method: string,
  url: string,
  statusCode: number,
  responseTime: number,
  userId?: string
) => {
  logger.info("HTTP Request", {
    type: "http_request",
    method,
    url,
    statusCode,
    responseTime: `${responseTime}ms`,
    userId,
  });
};

export const logError = (
  error: Error,
  context?: {
    method?: string;
    url?: string;
    userId?: string;
    requestId?: string;
    additionalData?: Record<string, unknown>;
  }
) => {
  logger.error(error.message, {
    type: "error",
    name: error.name,
    stack: error.stack,
    ...context,
  });
};

export const logSecurityEvent = (
  event: string,
  details: {
    userId?: string;
    ip?: string;
    userAgent?: string;
    action: string;
    success: boolean;
    reason?: string;
  }
) => {
  logger.warn(event, {
    type: "security",
    ...details,
  });
};

export const logDatabaseEvent = (
  operation: string,
  collection: string,
  duration?: number,
  error?: Error
) => {
  const level = error ? "error" : "debug";
  logger[level](`Database ${operation}`, {
    type: "database",
    operation,
    collection,
    duration: duration ? `${duration}ms` : undefined,
    error: error?.message,
  });
};

export default logger;
