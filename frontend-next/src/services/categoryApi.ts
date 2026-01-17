import api from "./api";

export interface Category {
  _id?: string; // Frontend convention
  id?: string; // Backend returns 'id'
  name: string;
  slug: string;
  description?: string;
  parent?: {
    _id?: string;
    id?: string;
    name: string;
    slug: string;
  } | null;
  image?: string;
  isActive: boolean;
  subcategories?: Category[];
  productCount?: number;
  totalProductCount?: number;
  createdAt: string;
  updatedAt: string;
}

// Helper to get category ID (handles both _id and id)
export const getCategoryId = (cat: Category): string => {
  // Backend returns 'id', some frontend code expects '_id'
  const id = cat.id || cat._id || "";
  return id;
};

export interface CreateCategoryPayload {
  name: string;
  slug?: string;
  description?: string;
  parent?: string | null;
  image?: string;
  isActive?: boolean;
}

export interface UpdateCategoryPayload extends Partial<CreateCategoryPayload> {}

export const categoryApi = {
  // Get all categories (flat list)
  getCategories: (params?: { parent?: string | null; active?: boolean }) =>
    api.get<{ categories: Category[]; total: number; page: number; limit: number }>("/categories", { params }),

  // Get categories as tree structure
  getCategoryTree: () =>
    api.get<{ data: Category[] }>("/categories/tree"),

  // Get single category by ID
  getCategory: (id: string) =>
    api.get<{ data: Category }>(`/categories/${id}`),

  // Get category by slug
  getCategoryBySlug: (slug: string) =>
    api.get<{ data: Category }>(`/categories/slug/${slug}`),

  // Get subcategories of a category
  getSubcategories: (id: string) =>
    api.get<{ data: Category[] }>(`/categories/${id}/subcategories`),

  // Admin: Create category
  createCategory: (data: CreateCategoryPayload) =>
    api.post<{ data: Category }>("/categories", data),

  // Admin: Update category
  updateCategory: (id: string, data: UpdateCategoryPayload) =>
    api.put<{ data: Category }>(`/categories/${id}`, data),

  // Admin: Delete category
  deleteCategory: (id: string) =>
    api.delete(`/categories/${id}`),
};
