import type { Product } from "@/types/product";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000/api";

// Common headers for server-side fetches
const defaultHeaders: HeadersInit = {
  "Content-Type": "application/json",
  "ngrok-skip-browser-warning": "true",
};

interface ApiResponse<T> {
  data: T;
}

export async function fetchProduct(id: string): Promise<Product | null> {
  try {
    const response = await fetch(`${API_BASE}/products/${id}`, {
      headers: defaultHeaders,
      next: { revalidate: 60 }, // Revalidate every 60 seconds
    });

    if (!response.ok) {
      return null;
    }

    const result: ApiResponse<Product> = await response.json();
    return result.data;
  } catch {
    return null;
  }
}

export async function fetchProducts(params?: {
  page?: number;
  limit?: number;
  category?: string;
  q?: string;
}): Promise<{ products: Product[]; total: number }> {
  try {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));
    if (params?.category) searchParams.set("category", params.category);
    if (params?.q) searchParams.set("q", params.q);

    const response = await fetch(`${API_BASE}/products?${searchParams.toString()}`, {
      headers: defaultHeaders,
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      return { products: [], total: 0 };
    }

    return response.json();
  } catch {
    return { products: [], total: 0 };
  }
}

export async function fetchPopularProducts(limit: number = 4): Promise<Product[]> {
  try {
    const response = await fetch(`${API_BASE}/products/popular?limit=${limit}`, {
      headers: defaultHeaders,
      next: { revalidate: 300 }, // 5 minutes
    });

    if (!response.ok) {
      return [];
    }

    const result = await response.json();
    return result.products || [];
  } catch {
    return [];
  }
}

export async function fetchLatestProducts(limit: number = 4): Promise<Product[]> {
  try {
    const response = await fetch(`${API_BASE}/products/latest?limit=${limit}`, {
      headers: defaultHeaders,
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      return [];
    }

    const result = await response.json();
    return result.products || [];
  } catch {
    return [];
  }
}
