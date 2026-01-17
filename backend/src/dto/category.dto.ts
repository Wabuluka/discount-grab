/**
 * Category DTOs
 */

import { ICategory } from "../models/Category";

// Category reference DTO (minimal, for embedding in other entities)
export interface CategoryRefDTO {
  id: string;
  name: string;
  slug: string;
}

// Full category DTO
export interface CategoryDTO {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parent?: CategoryRefDTO | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Category tree node DTO (for hierarchical display)
export interface CategoryTreeNodeDTO {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isActive: boolean;
  productCount: number;
  totalProductCount: number;
  subcategories: CategoryTreeNodeDTO[];
}

// Category list item DTO
export interface CategoryListItemDTO {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parent?: CategoryRefDTO | null;
  isActive: boolean;
}

/**
 * Transform a Category document to CategoryRefDTO
 */
export function toCategoryRefDTO(category: ICategory | any): CategoryRefDTO {
  return {
    id: category._id?.toString?.() || category._id || category.id || "",
    name: category.name,
    slug: category.slug,
  };
}

/**
 * Transform a Category document to full CategoryDTO
 */
export function toCategoryDTO(category: ICategory | any): CategoryDTO {
  const dto: CategoryDTO = {
    id: category._id?.toString?.() || category._id || category.id || "",
    name: category.name,
    slug: category.slug,
    isActive: category.isActive ?? true,
    createdAt: new Date(category.createdAt).toISOString(),
    updatedAt: new Date(category.updatedAt).toISOString(),
  };

  if (category.description) dto.description = category.description;
  if (category.image) dto.image = category.image;

  // Handle populated parent
  if (category.parent) {
    if (typeof category.parent === "object" && category.parent.name) {
      dto.parent = toCategoryRefDTO(category.parent);
    } else {
      dto.parent = null;
    }
  } else {
    dto.parent = null;
  }

  return dto;
}

/**
 * Transform a Category document to CategoryListItemDTO
 */
export function toCategoryListItemDTO(category: ICategory | any): CategoryListItemDTO {
  const dto: CategoryListItemDTO = {
    id: category._id?.toString?.() || category._id || category.id || "",
    name: category.name,
    slug: category.slug,
    isActive: category.isActive ?? true,
  };

  if (category.description) dto.description = category.description;
  if (category.image) dto.image = category.image;

  if (category.parent && typeof category.parent === "object" && category.parent.name) {
    dto.parent = toCategoryRefDTO(category.parent);
  } else {
    dto.parent = null;
  }

  return dto;
}

/**
 * Transform category tree data to CategoryTreeNodeDTO
 */
export function toCategoryTreeNodeDTO(category: any): CategoryTreeNodeDTO {
  return {
    id: category._id?.toString?.() || category._id || category.id || "",
    name: category.name,
    slug: category.slug,
    description: category.description,
    image: category.image,
    isActive: category.isActive ?? true,
    productCount: category.productCount || 0,
    totalProductCount: category.totalProductCount || 0,
    subcategories: (category.subcategories || []).map(toCategoryTreeNodeDTO),
  };
}

/**
 * Transform array of categories to list DTOs
 */
export function toCategoryListDTO(categories: (ICategory | any)[]): CategoryListItemDTO[] {
  return categories.map(toCategoryListItemDTO);
}

/**
 * Transform array of category tree nodes to tree DTOs
 */
export function toCategoryTreeDTO(categories: any[]): CategoryTreeNodeDTO[] {
  return categories.map(toCategoryTreeNodeDTO);
}
