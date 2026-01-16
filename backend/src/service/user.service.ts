import User from "../models/User";
import { AppError, ErrorCode } from "../middleware/errorHandler";
import {
  UserDTO,
  UserListItemDTO,
  toUserDTO,
  toUserListDTO,
} from "../dto";

export interface UserFilter {
  search?: string;
  role?: "user" | "admin";
}

export interface UserListResult {
  users: UserListItemDTO[];
  total: number;
  page: number;
  pages: number;
}

export interface UserStatsResult {
  total: number;
  admins: number;
  customers: number;
  recentUsers: UserListItemDTO[];
}

export async function getAllUsers(
  page: number = 1,
  limit: number = 20,
  filter: UserFilter = {}
): Promise<UserListResult> {
  const query: Record<string, unknown> = {};

  if (filter.search) {
    query.$or = [
      { name: { $regex: filter.search, $options: "i" } },
      { email: { $regex: filter.search, $options: "i" } },
    ];
  }

  if (filter.role) {
    query.role = filter.role;
  }

  const skip = (page - 1) * limit;
  const [users, total] = await Promise.all([
    User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(query),
  ]);

  return {
    users: toUserListDTO(users),
    total,
    page,
    pages: Math.ceil(total / limit),
  };
}

export async function getUserById(id: string): Promise<UserDTO> {
  const user = await User.findById(id).select("-password");
  if (!user) {
    throw new AppError("User not found", ErrorCode.USER_NOT_FOUND);
  }
  return toUserDTO(user);
}

export async function getUserStats(): Promise<UserStatsResult> {
  const [total, admins, customers, recentUsers] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: "admin" }),
    User.countDocuments({ role: "user" }),
    User.find()
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
  ]);

  return {
    total,
    admins,
    customers,
    recentUsers: toUserListDTO(recentUsers),
  };
}
