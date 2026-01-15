import crypto from "crypto";
import jwt from "jsonwebtoken";
import { Types } from "mongoose";
import config from "../config";
import RefreshToken from "../models/RefreshToken";

export const signAccess = (userId: string, role: string) => {
  const expiresIn = ms(String(config.accessTtl));
  return jwt.sign({ sub: userId, role }, config.jwtSecret, { expiresIn });
};

export const verifyAccess = (token: string) =>
  jwt.verify(token, config.jwtSecret) as {
    sub: string;
    role: string;
    iat: number;
    exp: number;
  };

export const issueRefresh = async (
  userId: Types.ObjectId,
  ctx: { ua?: string; ip?: string }
) => {
  const token = crypto.randomBytes(48).toString("hex");
  const expiresAt = new Date(Date.now() + ms(String(config.refreshTtl)));
  await RefreshToken.create({
    user: userId,
    token,
    expiresAt,
    userAgent: ctx.ua,
    ip: ctx.ip,
  });
  return token;
};

export const rotateRefresh = async (
  oldToken: string,
  userId: Types.ObjectId,
  ctx: { ua?: string; ip?: string }
) => {
  const existing = await RefreshToken.findOne({
    token: oldToken,
    user: userId,
    revoked: { $ne: true },
  });
  if (!existing || existing.expiresAt < new Date()) return null;
  existing.revoked = true;
  const newToken = crypto.randomBytes(48).toString("hex");
  existing.replacedByToken = newToken;
  await existing.save();
  const expiresAt = new Date(Date.now() + ms(String(config.refreshTtl)));
  await RefreshToken.create({
    user: userId,
    token: newToken,
    expiresAt,
    userAgent: ctx.ua,
    ip: ctx.ip,
  });
  return newToken;
};

export const revokeAllForUser = async (userId: string) => {
  await RefreshToken.updateMany(
    { user: userId, revoked: { $ne: true } },
    { $set: { revoked: true } }
  );
};

// tiny ms parser for “7d/15m/900s”
function ms(s: string) {
  const m = /^(\d+)([smhd])$/.exec(s) || [];
  const n = Number(m[1] || 0);
  const u = m[2];
  return u === "s"
    ? n * 1000
    : u === "m"
    ? n * 60_000
    : u === "h"
    ? n * 3_600_000
    : n * 86_400_000;
}
