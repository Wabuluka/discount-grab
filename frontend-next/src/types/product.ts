export interface ProductCategory {
  _id?: string;
  id?: string;
  name: string;
  slug: string;
}

export interface Product {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  price: number;
  salePrice?: number | null;
  discountPercent?: number;
  discountStartDate?: string | null;
  discountEndDate?: string | null;
  isOnSale?: boolean;
  images?: string[];
  category?: ProductCategory | string;
  stock: number;
  specs?: Record<string, string>;
  salesCount: number;
  createdAt: string;
  updatedAt: string;
}

// Helper to get product ID (handles both _id and id from backend)
export const getProductId = (product: Product): string => product.id || product._id || "";

// Helper to get the effective price (sale price if on sale, otherwise regular price)
export const getEffectivePrice = (product: Product): number => {
  if (product.isOnSale && product.salePrice != null) {
    return product.salePrice;
  }
  return product.price;
};
