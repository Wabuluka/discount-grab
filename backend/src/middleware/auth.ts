import { NextFunction, Request, Response } from "express";
import User from "../models/User";
import { verifyAccess } from "../service/token.service";
import { AppError } from "./errorHandler";

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
    const token = (req.headers.authorization || "").replace("Bearer ", "");
    if (!token) throw new AppError("Unauthorized", 401);
    const payload = verifyAccess(token);
    const user = await User.findById(payload.sub);
    if (!user) throw new AppError("Unauthorized", 401);
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
    next();
  } catch {
    next(new AppError("Unauthorized", 401));
  }
};

export const isAdmin = (req: Request, _res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== "admin")
    return next(new AppError("Forbidden", 403));
  next();
};
