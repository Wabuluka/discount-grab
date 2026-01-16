// Error codes matching backend ErrorCode enum
export enum ErrorCode {
  // Validation Errors
  VALIDATION_ERROR = "VALIDATION_ERROR",
  INVALID_INPUT = "INVALID_INPUT",
  MISSING_FIELD = "MISSING_FIELD",
  INVALID_FORMAT = "INVALID_FORMAT",

  // Authentication Errors
  UNAUTHORIZED = "UNAUTHORIZED",
  INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
  TOKEN_EXPIRED = "TOKEN_EXPIRED",
  TOKEN_INVALID = "TOKEN_INVALID",
  TOKEN_MISSING = "TOKEN_MISSING",

  // Authorization Errors
  FORBIDDEN = "FORBIDDEN",
  INSUFFICIENT_PERMISSIONS = "INSUFFICIENT_PERMISSIONS",

  // Resource Errors
  NOT_FOUND = "NOT_FOUND",
  RESOURCE_NOT_FOUND = "RESOURCE_NOT_FOUND",
  USER_NOT_FOUND = "USER_NOT_FOUND",
  PRODUCT_NOT_FOUND = "PRODUCT_NOT_FOUND",
  ORDER_NOT_FOUND = "ORDER_NOT_FOUND",
  CART_NOT_FOUND = "CART_NOT_FOUND",
  CATEGORY_NOT_FOUND = "CATEGORY_NOT_FOUND",

  // Conflict Errors
  CONFLICT = "CONFLICT",
  DUPLICATE_ENTRY = "DUPLICATE_ENTRY",
  EMAIL_EXISTS = "EMAIL_EXISTS",
  SLUG_EXISTS = "SLUG_EXISTS",

  // Business Logic Errors
  BUSINESS_ERROR = "BUSINESS_ERROR",
  INSUFFICIENT_STOCK = "INSUFFICIENT_STOCK",
  CART_EMPTY = "CART_EMPTY",
  ORDER_CANNOT_CANCEL = "ORDER_CANNOT_CANCEL",
  INVALID_QUANTITY = "INVALID_QUANTITY",

  // Rate Limiting
  RATE_LIMITED = "RATE_LIMITED",

  // Server Errors
  INTERNAL_ERROR = "INTERNAL_ERROR",
  DATABASE_ERROR = "DATABASE_ERROR",
  SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",

  // Network Errors (frontend only)
  NETWORK_ERROR = "NETWORK_ERROR",
  TIMEOUT = "TIMEOUT",
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
    details?: ValidationError[];
    timestamp: string;
    path: string;
    method: string;
    requestId?: string;
    stack?: string;
  };
}

export interface ApiError {
  code: ErrorCode;
  message: string;
  details?: ValidationError[];
  statusCode: number;
  requestId?: string;
}

// User-friendly error messages for frontend display
export const errorMessages: Record<ErrorCode, string> = {
  [ErrorCode.VALIDATION_ERROR]: "Please check your input and try again",
  [ErrorCode.INVALID_INPUT]: "Invalid input provided",
  [ErrorCode.MISSING_FIELD]: "Please fill in all required fields",
  [ErrorCode.INVALID_FORMAT]: "Invalid data format",
  [ErrorCode.UNAUTHORIZED]: "Please log in to continue",
  [ErrorCode.INVALID_CREDENTIALS]: "Invalid email or password",
  [ErrorCode.TOKEN_EXPIRED]: "Your session has expired. Please log in again",
  [ErrorCode.TOKEN_INVALID]: "Your session is invalid. Please log in again",
  [ErrorCode.TOKEN_MISSING]: "Please log in to continue",
  [ErrorCode.FORBIDDEN]: "You don't have permission to do this",
  [ErrorCode.INSUFFICIENT_PERMISSIONS]: "Insufficient permissions",
  [ErrorCode.NOT_FOUND]: "The requested item was not found",
  [ErrorCode.RESOURCE_NOT_FOUND]: "Resource not found",
  [ErrorCode.USER_NOT_FOUND]: "User not found",
  [ErrorCode.PRODUCT_NOT_FOUND]: "Product not found",
  [ErrorCode.ORDER_NOT_FOUND]: "Order not found",
  [ErrorCode.CART_NOT_FOUND]: "Cart not found",
  [ErrorCode.CATEGORY_NOT_FOUND]: "Category not found",
  [ErrorCode.CONFLICT]: "A conflict occurred. Please refresh and try again",
  [ErrorCode.DUPLICATE_ENTRY]: "This item already exists",
  [ErrorCode.EMAIL_EXISTS]: "An account with this email already exists",
  [ErrorCode.SLUG_EXISTS]: "This name is already in use",
  [ErrorCode.BUSINESS_ERROR]: "Unable to complete the operation",
  [ErrorCode.INSUFFICIENT_STOCK]: "Sorry, this item is out of stock",
  [ErrorCode.CART_EMPTY]: "Your cart is empty",
  [ErrorCode.ORDER_CANNOT_CANCEL]: "This order cannot be cancelled",
  [ErrorCode.INVALID_QUANTITY]: "Invalid quantity",
  [ErrorCode.RATE_LIMITED]: "Too many attempts. Please wait and try again",
  [ErrorCode.INTERNAL_ERROR]: "Something went wrong. Please try again later",
  [ErrorCode.DATABASE_ERROR]: "A server error occurred. Please try again",
  [ErrorCode.SERVICE_UNAVAILABLE]: "Service is temporarily unavailable",
  [ErrorCode.NETWORK_ERROR]: "Network error. Please check your connection",
  [ErrorCode.TIMEOUT]: "Request timed out. Please try again",
};

/**
 * Parse API error response into a standardized ApiError object
 */
export function parseApiError(error: unknown): ApiError {
  // Handle Axios error with response
  if (
    error &&
    typeof error === "object" &&
    "response" in error &&
    (error as any).response?.data
  ) {
    const response = (error as any).response;
    const data = response.data as ApiErrorResponse;

    // New API error format
    if (data.error && data.error.code) {
      return {
        code: data.error.code,
        message: data.error.message,
        details: data.error.details,
        statusCode: response.status,
        requestId: data.error.requestId,
      };
    }

    // Legacy error format (fallback)
    if ((data as any).message) {
      return {
        code: getErrorCodeFromStatus(response.status),
        message: (data as any).message,
        statusCode: response.status,
      };
    }
  }

  // Handle network errors
  if (error && typeof error === "object" && "code" in error) {
    const axiosError = error as any;
    if (axiosError.code === "ECONNABORTED" || axiosError.code === "ETIMEDOUT") {
      return {
        code: ErrorCode.TIMEOUT,
        message: errorMessages[ErrorCode.TIMEOUT],
        statusCode: 0,
      };
    }
    if (axiosError.code === "ERR_NETWORK") {
      return {
        code: ErrorCode.NETWORK_ERROR,
        message: errorMessages[ErrorCode.NETWORK_ERROR],
        statusCode: 0,
      };
    }
  }

  // Fallback for unknown errors
  const message =
    error instanceof Error ? error.message : "An unexpected error occurred";
  return {
    code: ErrorCode.INTERNAL_ERROR,
    message,
    statusCode: 500,
  };
}

/**
 * Get error code from HTTP status code (for legacy API responses)
 */
function getErrorCodeFromStatus(status: number): ErrorCode {
  switch (status) {
    case 400:
      return ErrorCode.VALIDATION_ERROR;
    case 401:
      return ErrorCode.UNAUTHORIZED;
    case 403:
      return ErrorCode.FORBIDDEN;
    case 404:
      return ErrorCode.NOT_FOUND;
    case 409:
      return ErrorCode.CONFLICT;
    case 429:
      return ErrorCode.RATE_LIMITED;
    case 500:
      return ErrorCode.INTERNAL_ERROR;
    case 503:
      return ErrorCode.SERVICE_UNAVAILABLE;
    default:
      return ErrorCode.INTERNAL_ERROR;
  }
}

/**
 * Get user-friendly error message
 */
export function getErrorMessage(error: ApiError): string {
  // If there are validation details, format them nicely
  if (error.details && error.details.length > 0) {
    if (error.details.length === 1) {
      return error.details[0].message;
    }
    return error.message;
  }

  // Use the error message from the API if available
  if (error.message) {
    return error.message;
  }

  // Fall back to default message for the error code
  return errorMessages[error.code] || errorMessages[ErrorCode.INTERNAL_ERROR];
}

/**
 * Check if error requires re-authentication
 */
export function isAuthError(error: ApiError): boolean {
  return [
    ErrorCode.UNAUTHORIZED,
    ErrorCode.TOKEN_EXPIRED,
    ErrorCode.TOKEN_INVALID,
    ErrorCode.TOKEN_MISSING,
  ].includes(error.code);
}

/**
 * Check if error is a rate limit error
 */
export function isRateLimitError(error: ApiError): boolean {
  return error.code === ErrorCode.RATE_LIMITED;
}

/**
 * Check if error is a validation error
 */
export function isValidationError(error: ApiError): boolean {
  return [
    ErrorCode.VALIDATION_ERROR,
    ErrorCode.INVALID_INPUT,
    ErrorCode.MISSING_FIELD,
    ErrorCode.INVALID_FORMAT,
  ].includes(error.code);
}
