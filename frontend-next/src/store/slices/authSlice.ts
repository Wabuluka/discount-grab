import type { PayloadAction } from "@reduxjs/toolkit";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { LoginPayload, RegisterPayload, User } from "@/services/authApi";
import { authApi } from "@/services/authApi";
import { parseApiError, getErrorMessage, isRateLimitError, ErrorCode } from "@/types/error";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  initializing: boolean;
  error: string | null;
  errorCode: ErrorCode | null;
  rateLimitedUntil: number | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  initializing: true,
  error: null,
  errorCode: null,
  rateLimitedUntil: null,
};

export const initializeAuth = createAsyncThunk(
  "auth/initialize",
  async () => {
    if (typeof window !== "undefined") {
      const hasToken = !!localStorage.getItem("access_token");
      if (hasToken) {
        try {
          const res = await authApi.me();
          return { hasToken: true, user: res.data.user };
        } catch {
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
      const apiError = parseApiError(err);
      const message = getErrorMessage(apiError);

      // Handle rate limiting
      if (isRateLimitError(apiError)) {
        const error = err as { response?: { headers?: Record<string, string> } };
        const retryAfter = error.response?.headers?.["retry-after"];
        const retryAfterSeconds = retryAfter ? parseInt(retryAfter, 10) : 900; // Default 15 min
        const rateLimitedUntil = Date.now() + retryAfterSeconds * 1000;
        return rejectWithValue({
          message,
          code: apiError.code,
          rateLimitedUntil,
        });
      }

      return rejectWithValue({
        message,
        code: apiError.code,
        rateLimitedUntil: null,
      });
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
      const apiError = parseApiError(err);
      const message = getErrorMessage(apiError);
      return rejectWithValue({
        message,
        code: apiError.code,
      });
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
      const apiError = parseApiError(err);
      return rejectWithValue({
        message: getErrorMessage(apiError),
        code: apiError.code,
      });
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
      state.errorCode = null;
      state.rateLimitedUntil = null;
    },
    clearRateLimit: (state) => {
      state.rateLimitedUntil = null;
      state.error = null;
      state.errorCode = null;
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
        state.errorCode = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.rateLimitedUntil = null;
        state.error = null;
        state.errorCode = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        const payload = action.payload as {
          message: string;
          code: ErrorCode;
          rateLimitedUntil: number | null;
        } | undefined;

        if (payload) {
          state.error = payload.message;
          state.errorCode = payload.code;
          state.rateLimitedUntil = payload.rateLimitedUntil ?? null;
        } else {
          state.error = action.error?.message || "Login failed";
          state.errorCode = ErrorCode.INTERNAL_ERROR;
          state.rateLimitedUntil = null;
        }
      })
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.errorCode = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
        state.errorCode = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        const payload = action.payload as { message: string; code: ErrorCode } | undefined;

        if (payload) {
          state.error = payload.message;
          state.errorCode = payload.code;
        } else {
          state.error = action.error?.message || "Registration failed";
          state.errorCode = ErrorCode.INTERNAL_ERROR;
        }
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
        state.error = null;
        state.errorCode = null;
      });
  },
});

export const { clearError, clearRateLimit, setUser } = authSlice.actions;
export default authSlice.reducer;
