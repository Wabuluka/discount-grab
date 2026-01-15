import type { PayloadAction } from "@reduxjs/toolkit";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { LoginPayload, RegisterPayload, User } from "@/services/authApi";
import { authApi } from "@/services/authApi";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  initializing: boolean;
  error: string | null;
  rateLimitedUntil: number | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  initializing: true, // Start as true - we're checking auth on load
  error: null,
  rateLimitedUntil: null,
};

export const initializeAuth = createAsyncThunk(
  "auth/initialize",
  async (_, { dispatch }) => {
    if (typeof window !== "undefined") {
      const hasToken = !!localStorage.getItem("access_token");
      if (hasToken) {
        // If we have a token, try to fetch the user
        try {
          const res = await authApi.me();
          return { hasToken: true, user: res.data.user };
        } catch {
          // Token is invalid, clear it
          localStorage.removeItem("access_token");
          return { hasToken: false, user: null };
        }
      }
      return { hasToken: false, user: null };
    }
    return { hasToken: false, user: null };
  }
);

export const login = createAsyncThunk(
  "auth/login",
  async (payload: LoginPayload, { rejectWithValue }) => {
    try {
      const res = await authApi.login(payload);
      localStorage.setItem("access_token", res.data.accessToken);
      return res.data.user;
    } catch (err: unknown) {
      const error = err as {
        response?: {
          data?: { message?: string };
          headers?: Record<string, string>;
          status?: number;
        };
        message?: string;
      };

      // Handle network errors
      if (!error.response) {
        const networkMessage = error.message || "Network error. Please check your connection.";
        return rejectWithValue({ message: networkMessage, rateLimitedUntil: null });
      }

      const message = error.response.data?.message || "Login failed";
      const retryAfter = error.response.headers?.["retry-after"];
      const status = error.response.status;

      if (status === 429 && retryAfter) {
        const retryAfterSeconds = parseInt(retryAfter, 10);
        const rateLimitedUntil = Date.now() + retryAfterSeconds * 1000;
        return rejectWithValue({ message, rateLimitedUntil });
      }

      return rejectWithValue({ message, rateLimitedUntil: null });
    }
  }
);

export const register = createAsyncThunk(
  "auth/register",
  async (payload: RegisterPayload, { rejectWithValue }) => {
    try {
      const res = await authApi.register(payload);
      localStorage.setItem("access_token", res.data.accessToken);
      return res.data.user;
    } catch (err: unknown) {
      const error = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };

      // Handle network errors
      if (!error.response) {
        return rejectWithValue(error.message || "Network error. Please check your connection.");
      }

      return rejectWithValue(error.response.data?.message || "Registration failed");
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  "auth/me",
  async (_, { rejectWithValue }) => {
    try {
      const res = await authApi.me();
      return res.data.user;
    } catch (err: unknown) {
      localStorage.removeItem("access_token");
      return rejectWithValue("Session expired");
    }
  }
);

export const logout = createAsyncThunk("auth/logout", async () => {
  try {
    await authApi.logout();
  } finally {
    localStorage.removeItem("access_token");
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.rateLimitedUntil = null;
    },
    clearRateLimit: (state) => {
      state.rateLimitedUntil = null;
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializeAuth.pending, (state) => {
        state.initializing = true;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.initializing = false;
        state.isAuthenticated = action.payload.hasToken;
        state.user = action.payload.user;
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.initializing = false;
        state.isAuthenticated = false;
        state.user = null;
      })
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.rateLimitedUntil = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        const payload = action.payload as { message: string; rateLimitedUntil: number | null } | undefined;
        if (payload && typeof payload === "object" && "message" in payload) {
          state.error = payload.message;
          state.rateLimitedUntil = payload.rateLimitedUntil ?? null;
        } else {
          state.error = (action.error?.message as string) || "Login failed";
          state.rateLimitedUntil = null;
        }
      })
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || action.error?.message || "Registration failed";
      })
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      });
  },
});

export const { clearError, clearRateLimit, setUser } = authSlice.actions;
export default authSlice.reducer;
