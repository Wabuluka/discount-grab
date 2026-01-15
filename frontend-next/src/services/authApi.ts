import api from "./api";

export interface User {
  id: string;
  email: string;
  name?: string;
  role?: "user" | "admin";
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  name?: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export const authApi = {
  login: (data: LoginPayload) => api.post<AuthResponse>("/auth/login", data),
  register: (data: RegisterPayload) => api.post<AuthResponse>("/auth/register", data),
  logout: () => api.post("/auth/logout"),
  me: () => api.get<{ user: User }>("/auth/me"),
  refresh: () => api.post<{ accessToken: string }>("/auth/refresh"),
};
