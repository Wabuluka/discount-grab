"use client";

import React from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  FormProvider,
  useForm,
  type FieldValues,
  type SubmitHandler,
  type UseFormProps,
} from "react-hook-form";
import type { ObjectSchema } from "yup";

type FormWrapperProps<T extends FieldValues> = {
  children: React.ReactNode;
  onSubmit: SubmitHandler<T>;
  schema?: ObjectSchema<T>;
  defaultValues?: UseFormProps<T>["defaultValues"];
  showButtons?: boolean;
  submitLabel?: string;
  disabled?: boolean;
  loading?: boolean;
};

const FormWrapper = <T extends FieldValues>({
  children,
  onSubmit,
  schema,
  defaultValues,
  showButtons = true,
  submitLabel = "Submit",
  disabled = false,
  loading = false,
}: FormWrapperProps<T>) => {
  const methods = useForm<T>({
    resolver: schema ? yupResolver(schema) as unknown as undefined : undefined,
    defaultValues,
  });

  const { handleSubmit, formState } = methods;
  const isSubmitting = formState.isSubmitting || loading;

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {children}

        {showButtons && (
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || disabled}
              className="
                w-full px-4 py-3
                bg-cyan-600 text-white font-medium rounded-lg
                transition-all duration-200
                hover:bg-cyan-700
                focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2
                disabled:bg-cyan-400 disabled:cursor-not-allowed
                flex items-center justify-center gap-2
              "
            >
              {isSubmitting && (
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {submitLabel}
            </button>
          </div>
        )}
      </form>
    </FormProvider>
  );
};

export default FormWrapper;
