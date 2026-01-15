"use client";

import type { InputHTMLAttributes } from "react";
import { useFormContext } from "react-hook-form";

type InputProps = {
  name: string;
  label?: string;
  placeholder?: string;
  rules?: unknown;
} & InputHTMLAttributes<HTMLInputElement>;

export default function Input({
  name,
  label,
  placeholder,
  className,
  ...props
}: InputProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const error = errors[name];

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor={name}>
          {label}
        </label>
      )}
      <input
        id={name}
        placeholder={placeholder}
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
          ${error ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""}
          ${className || ""}
        `}
        autoComplete="off"
      />
      {error && (
        <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error.message as string}
        </p>
      )}
    </div>
  );
}
