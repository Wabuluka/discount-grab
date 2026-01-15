"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as yup from "yup";
import { useAppDispatch, useAppSelector } from "@/store/store";
import FormWrapper from "@/components/form/FormWrapper";
import Input from "@/components/form/Input";
import { clearError, clearRateLimit, login } from "@/store/slices/authSlice";

const loginValidationSchema = yup.object({
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup.string().required("Password is required"),
});

function formatTimeRemaining(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { loading, error, isAuthenticated, initializing, rateLimitedUntil } = useAppSelector(
    (state) => state.auth
  );
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  const calculateTimeRemaining = useCallback(() => {
    if (!rateLimitedUntil) return null;
    const remaining = Math.max(0, Math.ceil((rateLimitedUntil - Date.now()) / 1000));
    return remaining > 0 ? remaining : null;
  }, [rateLimitedUntil]);

  useEffect(() => {
    if (!rateLimitedUntil) {
      setTimeRemaining(null);
      return;
    }

    const updateTimer = () => {
      const remaining = calculateTimeRemaining();
      setTimeRemaining(remaining);

      if (remaining === null || remaining <= 0) {
        dispatch(clearRateLimit());
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [rateLimitedUntil, calculateTimeRemaining, dispatch]);

  useEffect(() => {
    if (initializing) return;
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, initializing, router]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  async function onSubmit(data: { email: string; password: string }) {
    dispatch(login(data));
  }

  const isRateLimited = timeRemaining !== null && timeRemaining > 0;

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-cyan-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
            <p className="text-gray-500 mt-1">Sign in to your account</p>
          </div>

          {/* Rate Limit Warning with Countdown */}
          {isRateLimited && timeRemaining && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-amber-800 text-sm font-medium">Too many login attempts</p>
                  <p className="text-amber-700 text-sm mt-1">Please wait before trying again</p>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex items-center justify-center bg-amber-100 rounded-lg px-3 py-2">
                      <svg className="w-4 h-4 text-amber-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-amber-800 font-mono font-bold text-lg">
                        {formatTimeRemaining(timeRemaining)}
                      </span>
                    </div>
                    <span className="text-amber-600 text-sm">remaining</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error (non-rate-limit) */}
          {error && !isRateLimited && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <FormWrapper
            onSubmit={onSubmit}
            schema={loginValidationSchema}
            defaultValues={{ email: "", password: "" }}
            submitLabel={loading ? "Signing in..." : isRateLimited ? "Please wait..." : "Sign in"}
            disabled={isRateLimited}
            loading={loading}
          >
            <fieldset disabled={loading || isRateLimited} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email
                </label>
                <Input
                  name="email"
                  placeholder="you@example.com"
                  id="email"
                  type="email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Password
                </label>
                <Input
                  name="password"
                  placeholder="Enter your password"
                  id="password"
                  type="password"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500" />
                  <span className="text-sm text-gray-600">Remember me</span>
                </label>
                <a href="#" className="text-sm text-cyan-600 hover:text-cyan-700">
                  Forgot password?
                </a>
              </div>
            </fieldset>
          </FormWrapper>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-white text-sm text-gray-500">or</span>
            </div>
          </div>

          {/* Social */}
          <button
            type="button"
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span className="text-sm font-medium text-gray-700">Continue with Google</span>
          </button>

          {/* Footer */}
          <p className="text-center mt-6 text-sm text-gray-600">
            Don&apos;t have an account?{" "}
            <Link href="/auth/register" className="text-cyan-600 hover:text-cyan-700 font-medium">
              Sign up
            </Link>
          </p>
        </div>

        {/* Bottom text */}
        <p className="text-center mt-6 text-xs text-gray-400">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
