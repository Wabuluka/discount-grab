import { NextFunction, Request, Response } from "express";
import User from "../models/User";
import { verifyAccess } from "../service/token.service";
import { AppError, ErrorCode } from "./errorHandler";
import { logSecurityEvent } from "../utils/logger";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name?: string;
        role?: "user" | "admin";
      };
    }
  }
}

export const auth = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.replace("Bearer ", "");

    if (!token) {
      logSecurityEvent("Authentication attempt without token", {
        ip: req.ip || "unknown",
        userAgent: req.headers["user-agent"],
        action: "auth_missing_token",
        success: false,
      });
      throw new AppError("Authentication token is required", ErrorCode.TOKEN_MISSING);
    }

    const payload = verifyAccess(token);
    const user = await User.findById(payload.sub);

    if (!user) {
      logSecurityEvent("Authentication attempt with invalid user", {
        ip: req.ip || "unknown",
        userAgent: req.headers["user-agent"],
        action: "auth_invalid_user",
        success: false,
        reason: "User not found in database",
      });
      throw new AppError("User not found", ErrorCode.USER_NOT_FOUND);
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
    next();
  } catch (err) {
    // If it's already an AppError, pass it through
    if (err instanceof AppError) {
      return next(err);
    }
    // Handle JWT errors - they will be caught by the error handler
    next(err);
  }
};

export const isAdmin = (req: Request, _res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new AppError("Authentication required", ErrorCode.UNAUTHORIZED));
  }

  if (req.user.role !== "admin") {
    logSecurityEvent("Unauthorized admin access attempt", {
      userId: req.user.id,
      ip: req.ip || "unknown",
      userAgent: req.headers["user-agent"],
      action: "admin_access_denied",
      success: false,
      reason: `User role: ${req.user.role}`,
    });
    return next(
      new AppError(
        "Admin access required",
        ErrorCode.INSUFFICIENT_PERMISSIONS
      )
    );
  }
  next();
};
