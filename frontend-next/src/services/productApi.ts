import api from "./api";

export const productApi = {
  getProducts: () => api.get("/products"),
  getProduct: (id: string) => api.get(`/products/${id}`),
};
