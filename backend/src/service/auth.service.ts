import { Types } from "mongoose";
import { AppError } from "../middleware/errorHandler";
import User from "../models/User";
import { issueRefresh, rotateRefresh, signAccess } from "./token.service";

export const register = async (
  email: string,
  password: string,
  name: string,
  role?: string
) => {
  const existing = await User.findOne({ email });
  if (existing) throw new AppError("Email already registered", 409);
  const user = await User.create({ email, password, name, role });
  const access = signAccess(user.id, user.role || "user");
  const refresh = await issueRefresh(user._id as Types.ObjectId, {});
  return { user: sanitize(user), access, refresh };
};

export const login = async (
  email: string,
  password: string,
  ctx: { ua?: string; ip?: string }
) => {
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password)))
    throw new AppError("Invalid credentials", 401);
  const access = signAccess(user.id, user.role || "user");
  const refresh = await issueRefresh(user._id as Types.ObjectId, ctx);
  return { user: sanitize(user), access, refresh };
};

export const me = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError("User not found", 404);
  return sanitize(user);
};

export const refreshTokens = async (
  userId: string,
  oldToken: string,
  ctx: { ua?: string; ip?: string }
) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError("Unauthorized", 401);
  const newRefresh = await rotateRefresh(oldToken, user._id as Types.ObjectId, ctx);
  if (!newRefresh) throw new AppError("Unauthorized", 401);
  const access = signAccess(user.id, user.role || "user");
  return { access, refresh: newRefresh, user: sanitize(user) };
};

const sanitize = (u: any) => ({
  id: u.id,
  email: u.email,
  name: u.name,
  role: u.role,
});
