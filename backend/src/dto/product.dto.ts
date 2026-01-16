/**
 * Product DTOs
 */

import { IProduct } from "../models/Product";
import { CategoryRefDTO, toCategoryRefDTO } from "./category.dto";

// Product DTO (full details)
export interface ProductDTO {
  id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  stock: number;
  category?: CategoryRefDTO | null;
  specs?: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

// Product list item DTO (for listings)
export interface ProductListItemDTO {
  id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  stock: number;
  category?: CategoryRefDTO | null;
}

// Product reference DTO (minimal, for cart/order items)
export interface ProductRefDTO {
  id: string;
  title: string;
  images: string[];
  stock: number;
}

// Product in cart DTO
export interface CartProductDTO {
  id: string;
  title: string;
  images: string[];
  stock: number;
}

/**
 * Transform a Product document to full ProductDTO
 */
export function toProductDTO(product: IProduct | any): ProductDTO {
  const dto: ProductDTO = {
    id: product._id?.toString() || product.id,
    title: product.title,
    description: product.description || "",
    price: product.price,
    images: product.images || [],
    stock: product.stock || 0,
    createdAt: new Date(product.createdAt).toISOString(),
    updatedAt: new Date(product.updatedAt).toISOString(),
  };

  // Handle populated category
  if (product.category) {
    if (typeof product.category === "object" && product.category.name) {
      dto.category = toCategoryRefDTO(product.category);
    } else {
      dto.category = null;
    }
  } else {
    dto.category = null;
  }

  // Include specs if present
  if (product.specs && Object.keys(product.specs).length > 0) {
    dto.specs = product.specs;
  }

  return dto;
}

/**
 * Transform a Product document to ProductListItemDTO
 */
export function toProductListItemDTO(product: IProduct | any): ProductListItemDTO {
  const dto: ProductListItemDTO = {
    id: product._id?.toString() || product.id,
    title: product.title,
    description: product.description || "",
    price: product.price,
    images: product.images || [],
    stock: product.stock || 0,
  };

  if (product.category) {
    if (typeof product.category === "object" && product.category.name) {
      dto.category = toCategoryRefDTO(product.category);
    } else {
      dto.category = null;
    }
  } else {
    dto.category = null;
  }

  return dto;
}

/**
 * Transform a Product document to ProductRefDTO (minimal)
 */
export function toProductRefDTO(product: IProduct | any): ProductRefDTO {
  return {
    id: product._id?.toString() || product.id,
    title: product.title,
    images: product.images || [],
    stock: product.stock || 0,
  };
}

/**
 * Transform a Product for cart display
 */
export function toCartProductDTO(product: IProduct | any): CartProductDTO {
  return {
    id: product._id?.toString() || product.id,
    title: product.title,
    images: product.images || [],
    stock: product.stock || 0,
  };
}

/**
 * Transform array of products to list DTOs
 */
export function toProductListDTO(products: (IProduct | any)[]): ProductListItemDTO[] {
  return products.map(toProductListItemDTO);
}
