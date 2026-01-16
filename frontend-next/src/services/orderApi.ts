import api from "./api";

export interface OrderItem {
  product: string;
  productId?: string;
  title: string;
  quantity: number;
  price: number;
  subtotal?: number;
  image?: string;
}

export interface ShippingAddress {
  fullName: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface Order {
  id: string;
  _id?: string; // Keep for backwards compatibility
  orderNumber: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: "card" | "cash_on_delivery";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  orderStatus: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
  subtotal: number;
  shippingCost: number;
  tax: number;
  totalAmount: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
  confirmedAt?: string;
  processingAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
}

export interface CreateOrderPayload {
  shippingAddress: ShippingAddress;
  paymentMethod: "card" | "cash_on_delivery";
  notes?: string;
}

export const orderApi = {
  createOrder: (data: CreateOrderPayload) =>
    api.post<{ order: Order }>("/orders", data),
  getOrders: (page = 1, limit = 10) =>
    api.get<{ orders: Order[]; total: number; pages: number }>("/orders", {
      params: { page, limit },
    }),
  getOrder: (id: string) => api.get<{ order: Order }>(`/orders/${id}`),
  getOrderByNumber: (orderNumber: string) =>
    api.get<{ order: Order }>(`/orders/number/${orderNumber}`),
  cancelOrder: (id: string) => api.post<{ order: Order }>(`/orders/${id}/cancel`),
};
