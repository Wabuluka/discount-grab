/**
 * Product DTOs
 */

import { IProduct } from "../models/Product";
import { CategoryRefDTO, toCategoryRefDTO } from "./category.dto";

/**
 * Check if a discount is currently active based on dates
 */
function isDiscountActive(
  discountPercent?: number,
  startDate?: Date | string,
  endDate?: Date | string
): boolean {
  if (!discountPercent || discountPercent <= 0) return false;

  const now = new Date();

  if (startDate && new Date(startDate) > now) return false;
  if (endDate && new Date(endDate) < now) return false;

  return true;
}

/**
 * Calculate sale price based on discount
 */
function calculateSalePrice(
  price: number,
  discountPercent?: number,
  startDate?: Date | string,
  endDate?: Date | string
): number | null {
  if (!isDiscountActive(discountPercent, startDate, endDate)) return null;

  const discount = discountPercent || 0;
  return Math.round((price * (1 - discount / 100)) * 100) / 100;
}

// Product DTO (full details)
export interface ProductDTO {
  id: string;
  title: string;
  description: string;
  price: number;
  salePrice: number | null;
  discountPercent: number;
  discountStartDate: string | null;
  discountEndDate: string | null;
  isOnSale: boolean;
  images: string[];
  stock: number;
  category?: CategoryRefDTO | null;
  specs?: Record<string, string>;
  salesCount: number;
  createdAt: string;
  updatedAt: string;
}

// Product list item DTO (for listings)
export interface ProductListItemDTO {
  id: string;
  title: string;
  description: string;
  price: number;
  salePrice: number | null;
  discountPercent: number;
  isOnSale: boolean;
  images: string[];
  stock: number;
  category?: CategoryRefDTO | null;
  salesCount: number;
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
  const discountPercent = product.discountPercent || 0;
  const discountStartDate = product.discountStartDate;
  const discountEndDate = product.discountEndDate;
  const onSale = isDiscountActive(discountPercent, discountStartDate, discountEndDate);
  const salePrice = calculateSalePrice(product.price, discountPercent, discountStartDate, discountEndDate);

  const dto: ProductDTO = {
    id: product._id?.toString?.() || product._id || product.id || "",
    title: product.title,
    description: product.description || "",
    price: product.price,
    salePrice,
    discountPercent,
    discountStartDate: discountStartDate ? new Date(discountStartDate).toISOString() : null,
    discountEndDate: discountEndDate ? new Date(discountEndDate).toISOString() : null,
    isOnSale: onSale,
    images: product.images || [],
    stock: product.stock || 0,
    salesCount: product.salesCount || 0,
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
  const discountPercent = product.discountPercent || 0;
  const discountStartDate = product.discountStartDate;
  const discountEndDate = product.discountEndDate;
  const onSale = isDiscountActive(discountPercent, discountStartDate, discountEndDate);
  const salePrice = calculateSalePrice(product.price, discountPercent, discountStartDate, discountEndDate);

  const dto: ProductListItemDTO = {
    id: product._id?.toString?.() || product._id || product.id || "",
    title: product.title,
    description: product.description || "",
    price: product.price,
    salePrice,
    discountPercent,
    isOnSale: onSale,
    images: product.images || [],
    stock: product.stock || 0,
    salesCount: product.salesCount || 0,
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
    id: product._id?.toString?.() || product._id || product.id || "",
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
    id: product._id?.toString?.() || product._id || product.id || "",
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
