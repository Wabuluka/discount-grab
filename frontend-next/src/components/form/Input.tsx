"use client";

import { useState, type InputHTMLAttributes } from "react";
import { useFormContext } from "react-hook-form";

type InputProps = {
  name: string;
  label?: string;
  placeholder?: string;
  rules?: unknown;
  hint?: string;
} & InputHTMLAttributes<HTMLInputElement>;

export default function Input({
  name,
  label,
  placeholder,
  className,
  type,
  hint,
  ...props
}: InputProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const [showPassword, setShowPassword] = useState(false);
  const isPasswordType = type === "password";
  const inputType = isPasswordType ? (showPassword ? "text" : "password") : type;

  const error = errors[name];

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor={name}>
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={name}
          placeholder={placeholder}
          type={inputType}
          {...register(name)}
          {...props}
          className={`
            w-full px-4 py-3
            bg-gray-50 border border-gray-300 rounded-lg
            text-gray-900 placeholder-gray-400
            transition-all duration-200
            focus:bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none
            hover:border-gray-400
            disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed
            ${isPasswordType ? "pr-12" : ""}
            ${error ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""}
            ${className || ""}
          `}
          autoComplete={isPasswordType ? "current-password" : "off"}
        />
        {isPasswordType && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
            tabIndex={-1}
          >
            {showPassword ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        )}
      </div>
      {hint && !error && (
        <p className="mt-1.5 text-xs text-gray-500 flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {hint}
        </p>
      )}
      {error && (
        <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error.message as string}
        </p>
      )}
    </div>
  );
}
