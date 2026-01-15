"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as yup from "yup";
import { useAppDispatch, useAppSelector } from "@/store/store";
import FormWrapper from "@/components/form/FormWrapper";
import Input from "@/components/form/Input";
import { clearError, register } from "@/store/slices/authSlice";

const registerValidationSchema = yup.object({
  name: yup.string().required("Name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Please confirm your password"),
});

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { loading, error, isAuthenticated, initializing } = useAppSelector(
    (state) => state.auth
  );

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

  async function onSubmit(data: RegisterFormData) {
    const { confirmPassword, ...registerData } = data;
    dispatch(register(registerData));
  }

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-cyan-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Create account</h1>
            <p className="text-gray-500 mt-1">Start shopping with us today</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <FormWrapper
            onSubmit={onSubmit}
            schema={registerValidationSchema}
            defaultValues={{ name: "", email: "", password: "", confirmPassword: "" }}
            submitLabel={loading ? "Creating account..." : "Create account"}
            loading={loading}
          >
            <fieldset disabled={loading} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Full name
                </label>
                <Input
                  name="name"
                  placeholder="John Doe"
                  id="name"
                  type="text"
                />
              </div>

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

              {/* Password fields - side by side on larger screens */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Password
                  </label>
                  <Input
                    name="password"
                    placeholder="At least 6 characters"
                    id="password"
                    type="password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Confirm password
                  </label>
                  <Input
                    name="confirmPassword"
                    placeholder="Repeat password"
                    id="confirmPassword"
                    type="password"
                  />
                </div>
              </div>

              <div className="flex items-start gap-2 pt-1">
                <input type="checkbox" className="w-4 h-4 mt-0.5 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500" />
                <span className="text-sm text-gray-600">
                  I agree to the{" "}
                  <a href="#" className="text-cyan-600 hover:text-cyan-700">Terms</a>
                  {" "}and{" "}
                  <a href="#" className="text-cyan-600 hover:text-cyan-700">Privacy Policy</a>
                </span>
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
            Already have an account?{" "}
            <Link href="/auth" className="text-cyan-600 hover:text-cyan-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>

        {/* Bottom text */}
        <p className="text-center mt-6 text-xs text-gray-400">
          Your data is secure and encrypted
        </p>
      </div>
    </div>
  );
}
