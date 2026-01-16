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
import orderRouter from "./routes/order.routes";
import productRouter from "./routes/product.routes";
import uploadRouter from "./routes/upload.routes";
import userRouter from "./routes/user.routes";
import logger from "./utils/logger";

const app = express();

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  morgan("combined", { stream: { write: (s) => logger.info(s.trim()) } })
);

app.get("health", (_, res) => res.json({ status: "ok" }));

app.use("/api/products", productRouter);
app.use("/api/auth", authRouter);
app.use("/api/cart", cartRouter);
app.use("/api/orders", orderRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/users", userRouter);

app.use(notFound);
app.use(errorHandler);

mongoose
  .connect(config.mongoUri)
  .then(() => {
    logger.info("Connected to MongoDB");
    app.listen(config.port, () => {
      logger.info(`Server listening on port: ${config.port}`);
    });
  })
  .catch((err) => {
    logger.error("Failed to connect to MongoDB: " + err);
    process.exit(1);
  });
