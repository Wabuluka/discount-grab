import api from "@/services/api";

// Types
export interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  stock: number;
  category?: {
    _id: string;
    name: string;
    slug: string;
  } | string;
  specs?: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  product: string;
  title: string;
  quantity: number;
  price: number;
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
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
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
  paidAt?: string;
  confirmedAt?: string;
  processingAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductFormData {
  title: string;
  description: string;
  price: number;
  images: string[];
  stock: number;
  category?: string;
  specs?: Record<string, string>;
}

// Product Management APIs
export const adminProductApi = {
  create: async (data: ProductFormData): Promise<Product> => {
    const response = await api.post("/products", data);
    return response.data.data;
  },

  update: async (id: string, data: Partial<ProductFormData>): Promise<Product> => {
    const response = await api.put(`/products/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/products/${id}`);
  },

  getAll: async (): Promise<Product[]> => {
    const response = await api.get("/products");
    return response.data.docs;
  },

  getById: async (id: string): Promise<Product> => {
    const response = await api.get(`/products/${id}`);
    return response.data.data;
  },
};

// Order Management APIs
export const adminOrderApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<{ orders: Order[]; total: number; pages: number }> => {
    const response = await api.get("/orders/admin/all", { params });
    return response.data;
  },

  updateOrderStatus: async (
    id: string,
    status: Order["orderStatus"]
  ): Promise<Order> => {
    const response = await api.put(`/orders/admin/${id}/status`, { status });
    return response.data.order;
  },

  updatePaymentStatus: async (
    id: string,
    status: Order["paymentStatus"]
  ): Promise<Order> => {
    const response = await api.put(`/orders/admin/${id}/payment`, { status });
    return response.data.order;
  },
};
