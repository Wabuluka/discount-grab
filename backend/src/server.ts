import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import mongoose from "mongoose";
import morgan from "morgan";
import config from "./config";
import { errorHandler, notFound } from "./middleware/errorHandler";
import authRouter from "./routes/auth.routes";
import cartRouter from "./routes/cart.routes";
import categoryRouter from "./routes/category.routes";
import geoRouter from "./routes/geo.routes";
import heroSlideRouter from "./routes/heroSlide.routes";
import orderRouter from "./routes/order.routes";
import productRouter from "./routes/product.routes";
import uploadRouter from "./routes/upload.routes";
import userRouter from "./routes/user.routes";
import logger from "./utils/logger";

const app = express();

// Global unhandled exception handler
process.on("uncaughtException", (error: Error) => {
  logger.error("Uncaught Exception - Shutting down...", {
    type: "uncaught_exception",
    name: error.name,
    message: error.message,
    stack: error.stack,
  });
  process.exit(1);
});

// Global unhandled promise rejection handler
process.on("unhandledRejection", (reason: unknown) => {
  logger.error("Unhandled Promise Rejection", {
    type: "unhandled_rejection",
    reason: reason instanceof Error ? reason.message : String(reason),
    stack: reason instanceof Error ? reason.stack : undefined,
  });
});

// SIGTERM handler for graceful shutdown
process.on("SIGTERM", () => {
  logger.info("SIGTERM received - Graceful shutdown initiated");
  mongoose.connection.close().then(() => {
    logger.info("MongoDB connection closed");
    process.exit(0);
  });
});

// SIGINT handler for graceful shutdown (Ctrl+C)
process.on("SIGINT", () => {
  logger.info("SIGINT received - Graceful shutdown initiated");
  mongoose.connection.close().then(() => {
    logger.info("MongoDB connection closed");
    process.exit(0);
  });
});

app.use(helmet());
app.use(compression());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Response time tracking - set header before response is sent
app.use((req, res, next) => {
  const start = Date.now();
  const originalSend = res.send;
  res.send = function (body) {
    res.setHeader("X-Response-Time", `${Date.now() - start}ms`);
    return originalSend.call(this, body);
  };
  next();
});

// HTTP request logging with Morgan
app.use(
  morgan("combined", { stream: { write: (s) => logger.info(s.trim()) } })
);

// Health check endpoint
app.get("/health", (_, res) => res.json({ status: "ok", timestamp: new Date().toISOString() }));

// Cache control middleware for public API routes
const cacheControl = (maxAge: number) => (_req: express.Request, res: express.Response, next: express.NextFunction) => {
  res.set("Cache-Control", `public, max-age=${maxAge}, stale-while-revalidate=${maxAge * 5}`);
  next();
};

// API routes
app.use("/api/products", cacheControl(60), productRouter);
app.use("/api/auth", authRouter);
app.use("/api/cart", cartRouter);
app.use("/api/orders", orderRouter);
app.use("/api/categories", cacheControl(300), categoryRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/users", userRouter);
app.use("/api/hero-slides", cacheControl(120), heroSlideRouter);
app.use("/api/geo", geoRouter);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Database connection and server start
mongoose
  .connect(config.mongoUri)
  .then(() => {
    logger.info("Connected to MongoDB", {
      type: "database",
      operation: "connect",
      database: "mongodb",
    });
    app.listen(config.port, () => {
      logger.info(`Server listening on port: ${config.port}`, {
        type: "server",
        port: config.port,
        environment: process.env.NODE_ENV || "development",
      });
    });
  })
  .catch((err) => {
    logger.error("Failed to connect to MongoDB", {
      type: "database",
      operation: "connect",
      error: err.message,
      stack: err.stack,
    });
    process.exit(1);
  });

// MongoDB connection event listeners
mongoose.connection.on("error", (err) => {
  logger.error("MongoDB connection error", {
    type: "database",
    operation: "connection_error",
    error: err.message,
  });
});

mongoose.connection.on("disconnected", () => {
  logger.warn("MongoDB disconnected", {
    type: "database",
    operation: "disconnected",
  });
});

mongoose.connection.on("reconnected", () => {
  logger.info("MongoDB reconnected", {
    type: "database",
    operation: "reconnected",
  });
});

export default app;
