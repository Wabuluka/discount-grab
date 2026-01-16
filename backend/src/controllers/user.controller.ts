import { NextFunction, Request, Response } from "express";
import * as userService from "../service/user.service";

export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string | undefined;
    const role = req.query.role as "user" | "admin" | undefined;

    const result = await userService.getAllUsers(page, limit, { search, role });
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const user = await userService.getUserById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ user });
  } catch (err) {
    next(err);
  }
};

export const getUserStats = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const stats = await userService.getUserStats();
    res.json(stats);
  } catch (err) {
    next(err);
  }
};
