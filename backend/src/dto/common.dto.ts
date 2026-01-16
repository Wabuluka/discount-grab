/**
 * Common DTO types and utilities
 */

// Pagination response wrapper
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

// Standard API response wrapper
export interface ApiResponse<T> {
  success: true;
  data: T;
}

// Helper to create paginated response
export function toPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResponse<T> {
  return {
    data,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  };
}

// Helper to wrap data in standard response
export function toApiResponse<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    data,
  };
}

// Timestamp fields commonly returned in responses
export interface TimestampFields {
  createdAt: string;
  updatedAt: string;
}

// Helper to format dates as ISO strings
export function formatTimestamps(doc: {
  createdAt?: Date;
  updatedAt?: Date;
}): Partial<TimestampFields> {
  const result: Partial<TimestampFields> = {};
  if (doc.createdAt) result.createdAt = doc.createdAt.toISOString();
  if (doc.updatedAt) result.updatedAt = doc.updatedAt.toISOString();
  return result;
}
