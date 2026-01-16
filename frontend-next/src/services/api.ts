"use client";

import axios from "axios";
import { parseApiError, isAuthError } from "@/types/error";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000/api",
  withCredentials: true,
  timeout: 30000, // 30 second timeout
  headers: {
    "ngrok-skip-browser-warning": "true",
  },
});

// Request interceptor - attach auth token
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response interceptor - handle errors and token refresh
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;

    // Parse the error to get standardized format
    const apiError = parseApiError(err);

    // Handle authentication errors with token refresh
    if (isAuthError(apiError) && !originalRequest._retry) {
      // Don't retry refresh token requests
      if (originalRequest.url?.includes("/auth/refresh")) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("access_token");
          window.location.href = "/auth";
        }
        return Promise.reject(err);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((e) => Promise.reject(e));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await api.post("/auth/refresh");
        const { accessToken } = response.data;
        if (typeof window !== "undefined") {
          localStorage.setItem("access_token", accessToken);
        }
        processQueue(null, accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        if (typeof window !== "undefined") {
          localStorage.removeItem("access_token");
          window.location.href = "/auth";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(err);
  }
);

export default api;

// Re-export error utilities for convenience
export { parseApiError, isAuthError, isRateLimitError, isValidationError, getErrorMessage } from "@/types/error";
export type { ApiError, ValidationError } from "@/types/error";
