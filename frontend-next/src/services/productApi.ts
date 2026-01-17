import api from "./api";

export interface PopularProductsParams {
  page?: number;
  limit?: number;
  category?: string;
}

export interface LatestProductsParams {
  page?: number;
  limit?: number;
  category?: string;
}

export const productApi = {
  getProducts: () => api.get("/products"),
  getProduct: (id: string) => api.get(`/products/${id}`),
  getPopularProducts: (params?: PopularProductsParams) =>
    api.get("/products/popular", { params }),
  getLatestProducts: (params?: LatestProductsParams) =>
    api.get("/products/latest", { params }),
};
