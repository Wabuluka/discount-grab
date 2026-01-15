import dotenv from "dotenv";
dotenv.config();

export default {
  port: process.env.PORT || 4000,
  mongoUri:
    process.env.MONGO_URI || "mongodb://localhost:27017/electronics_store",
  env: process.env.NODE_ENV || "development",
  jwtSecret: process.env.JWT_SECRET || "change-me",
  accessTtl: process.env.ACCESS_TOKEN_TTL || "15m",
  refreshTtl: process.env.REFRESH_TOKEN_TTL || "7d",
  saltRounds: Number(process.env.SALT_ROUNDS || 10),
  cookieSecure: String(process.env.COOKIE_SECURE || "false") === "true",
  cookieDomain: process.env.COOKIE_DOMAIN || undefined,
};
