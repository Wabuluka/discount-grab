import api from "./api";

export interface CartItem {
  product: {
    _id: string;
    title: string;
    images: string[];
    stock: number;
  };
  quantity: number;
  price: number;
}

export interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
  totalAmount: number;
}

export const cartApi = {
  getCart: () => api.get<{ cart: Cart }>("/cart"),
  addToCart: (productId: string, quantity: number = 1) =>
    api.post<{ cart: Cart }>("/cart/add", { productId, quantity }),
  updateItem: (productId: string, quantity: number) =>
    api.put<{ cart: Cart }>(`/cart/item/${productId}`, { quantity }),
  removeItem: (productId: string) =>
    api.delete<{ cart: Cart }>(`/cart/item/${productId}`),
  clearCart: () => api.delete<{ cart: Cart }>("/cart/clear"),
};
