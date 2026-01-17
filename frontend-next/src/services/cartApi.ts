import api from "./api";

export interface CartItemProduct {
  _id?: string; // Frontend convention
  id?: string; // Backend returns 'id'
  title: string;
  images: string[];
  stock: number;
}

// Helper to get cart item product ID (handles both _id and id)
export const getCartItemProductId = (product: CartItemProduct): string =>
  product.id || product._id || "";

export interface CartItem {
  product: CartItemProduct;
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
