export interface ProductCategory {
  _id: string;
  name: string;
  slug: string;
}

export interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  images?: string[];
  category?: ProductCategory | string;
  stock: number;
  specs?: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}
