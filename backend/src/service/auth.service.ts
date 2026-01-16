import { Types } from "mongoose";
import { AppError, ErrorCode } from "../middleware/errorHandler";
import User from "../models/User";
import { issueRefresh, rotateRefresh, signAccess } from "./token.service";
import { UserDTO, toUserDTO } from "../dto";

interface AuthResult {
  user: UserDTO;
  access: string;
  refresh: string;
}

export const register = async (
  email: string,
  password: string,
  name: string,
  role?: string
): Promise<AuthResult> => {
  const existing = await User.findOne({ email });
  if (existing) {
    throw new AppError("An account with this email already exists", ErrorCode.EMAIL_EXISTS);
  }
  const user = await User.create({ email, password, name, role });
  const access = signAccess(user.id, user.role || "user");
  const refresh = await issueRefresh(user._id as Types.ObjectId, {});
  return { user: toUserDTO(user), access, refresh };
};

export const login = async (
  email: string,
  password: string,
  ctx: { ua?: string; ip?: string }
): Promise<AuthResult> => {
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError("Invalid email or password", ErrorCode.INVALID_CREDENTIALS);
  }
  const access = signAccess(user.id, user.role || "user");
  const refresh = await issueRefresh(user._id as Types.ObjectId, ctx);
  return { user: toUserDTO(user), access, refresh };
};

export const me = async (userId: string): Promise<UserDTO> => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError("User not found", ErrorCode.USER_NOT_FOUND);
  }
  return toUserDTO(user);
};

export const refreshTokens = async (
  userId: string,
  oldToken: string,
  ctx: { ua?: string; ip?: string }
): Promise<AuthResult> => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError("Invalid session", ErrorCode.UNAUTHORIZED);
  }
  const newRefresh = await rotateRefresh(oldToken, user._id as Types.ObjectId, ctx);
  if (!newRefresh) {
    throw new AppError("Session expired or invalid", ErrorCode.TOKEN_EXPIRED);
  }
  const access = signAccess(user.id, user.role || "user");
  return { access, refresh: newRefresh, user: toUserDTO(user) };
};
