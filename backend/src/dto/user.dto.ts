/**
 * User DTOs
 *
 * Excludes: password, __v, and other internal fields
 */

import { IUser } from "../models/User";

// User DTO for authenticated user responses (full profile)
export interface UserDTO {
  id: string;
  email: string;
  name: string;
  role: "user" | "admin";
  createdAt?: string;
  updatedAt?: string;
}

// Public user DTO (minimal info for references in other entities)
export interface UserPublicDTO {
  id: string;
  name: string;
  email: string;
}

// Auth response DTO (login/register)
export interface AuthResponseDTO {
  user: UserDTO;
  accessToken: string;
}

// User list DTO for admin (excludes sensitive data)
export interface UserListItemDTO {
  id: string;
  email: string;
  name: string;
  role: "user" | "admin";
  createdAt: string;
}

// User stats DTO for admin dashboard
export interface UserStatsDTO {
  totalUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  recentUsers: UserListItemDTO[];
}

/**
 * Transform a User document to UserDTO
 * Excludes: password, __v
 */
export function toUserDTO(user: IUser | any): UserDTO {
  return {
    id: user._id?.toString() || user.id,
    email: user.email,
    name: user.name,
    role: user.role || "user",
    ...(user.createdAt && { createdAt: new Date(user.createdAt).toISOString() }),
    ...(user.updatedAt && { updatedAt: new Date(user.updatedAt).toISOString() }),
  };
}

/**
 * Transform a User document to UserPublicDTO (minimal info)
 */
export function toUserPublicDTO(user: IUser | any): UserPublicDTO {
  return {
    id: user._id?.toString() || user.id,
    name: user.name,
    email: user.email,
  };
}

/**
 * Transform a User document to UserListItemDTO
 */
export function toUserListItemDTO(user: IUser | any): UserListItemDTO {
  return {
    id: user._id?.toString() || user.id,
    email: user.email,
    name: user.name,
    role: user.role || "user",
    createdAt: new Date(user.createdAt).toISOString(),
  };
}

/**
 * Transform user array to list DTOs
 */
export function toUserListDTO(users: (IUser | any)[]): UserListItemDTO[] {
  return users.map(toUserListItemDTO);
}
