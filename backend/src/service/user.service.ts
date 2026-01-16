import User from "../models/User";

export interface UserFilter {
  search?: string;
  role?: "user" | "admin";
}

export async function getAllUsers(
  page: number = 1,
  limit: number = 20,
  filter: UserFilter = {}
) {
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
      .limit(limit),
    User.countDocuments(query),
  ]);

  return {
    users,
    total,
    page,
    pages: Math.ceil(total / limit),
  };
}

export async function getUserById(id: string) {
  const user = await User.findById(id).select("-password");
  return user;
}

export async function getUserStats() {
  const [total, admins, customers, recentUsers] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: "admin" }),
    User.countDocuments({ role: "user" }),
    User.find()
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(5),
  ]);

  return {
    total,
    admins,
    customers,
    recentUsers,
  };
}
