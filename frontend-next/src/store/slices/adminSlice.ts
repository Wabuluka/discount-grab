import {
  adminOrderApi,
  adminProductApi,
  getOrderId,
  getProductId,
  Order,
  Product,
  ProductFormData,
} from "@/lib/adminApi";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

interface AdminState {
  products: Product[];
  orders: Order[];
  totalOrders: number;
  totalPages: number;
  currentPage: number;
  loading: boolean;
  error: string | null;
  productLoading: boolean;
  orderLoading: boolean;
}

const initialState: AdminState = {
  products: [],
  orders: [],
  totalOrders: 0,
  totalPages: 0,
  currentPage: 1,
  loading: false,
  error: null,
  productLoading: false,
  orderLoading: false,
};

// Product Thunks
export const fetchAdminProducts = createAsyncThunk(
  "admin/products",
  async (_, { rejectWithValue }) => {
    try {
      return await adminProductApi.getAll();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch products"
      );
    }
  }
);

export const createProduct = createAsyncThunk(
  "admin/createProduct",
  async (data: ProductFormData, { rejectWithValue }) => {
    try {
      return await adminProductApi.create(data);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        err.response?.data?.message || "Failed to create product"
      );
    }
  }
);

export const updateProduct = createAsyncThunk(
  "admin/updateProduct",
  async (
    { id, data }: { id: string; data: Partial<ProductFormData> },
    { rejectWithValue }
  ) => {
    try {
      return await adminProductApi.update(id, data);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        err.response?.data?.message || "Failed to update product"
      );
    }
  }
);

export const deleteProduct = createAsyncThunk(
  "admin/deleteProduct",
  async (id: string, { rejectWithValue }) => {
    try {
      await adminProductApi.delete(id);
      return id;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        err.response?.data?.message || "Failed to delete product"
      );
    }
  }
);

// Order Thunks
export const fetchAdminOrders = createAsyncThunk(
  "admin/fetchOrders",
  async (
    params: { page?: number; limit?: number; status?: string } = {},
    { rejectWithValue }
  ) => {
    try {
      return await adminOrderApi.getAll(params);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch orders"
      );
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  "admin/updateOrderStatus",
  async (
    { id, status }: { id: string; status: Order["orderStatus"] },
    { rejectWithValue }
  ) => {
    try {
      return await adminOrderApi.updateOrderStatus(id, status);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        err.response?.data?.message || "Failed to update order status"
      );
    }
  }
);

export const updatePaymentStatus = createAsyncThunk(
  "admin/updatePaymentStatus",
  async (
    { id, status }: { id: string; status: Order["paymentStatus"] },
    { rejectWithValue }
  ) => {
    try {
      return await adminOrderApi.updatePaymentStatus(id, status);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        err.response?.data?.message || "Failed to update payment status"
      );
    }
  }
);

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch Products
    builder
      .addCase(fetchAdminProducts.pending, (state) => {
        state.productLoading = true;
        state.error = null;
      })
      .addCase(fetchAdminProducts.fulfilled, (state, action) => {
        state.productLoading = false;
        state.products = action.payload;
      })
      .addCase(fetchAdminProducts.rejected, (state, action) => {
        state.productLoading = false;
        state.error = action.payload as string;
      });

    // Create Product
    builder
      .addCase(createProduct.pending, (state) => {
        state.productLoading = true;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.productLoading = false;
        state.products.unshift(action.payload);
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.productLoading = false;
        state.error = action.payload as string;
      });

    // Update Product
    builder
      .addCase(updateProduct.pending, (state) => {
        state.productLoading = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.productLoading = false;
        const payloadId = getProductId(action.payload);
        const index = state.products.findIndex(
          (p) => getProductId(p) === payloadId
        );
        if (index !== -1) {
          state.products[index] = action.payload;
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.productLoading = false;
        state.error = action.payload as string;
      });

    // Delete Product
    builder
      .addCase(deleteProduct.pending, (state) => {
        state.productLoading = true;
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.productLoading = false;
        state.products = state.products.filter((p) => getProductId(p) !== action.payload);
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.productLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Orders
    builder
      .addCase(fetchAdminOrders.pending, (state) => {
        state.orderLoading = true;
        state.error = null;
      })
      .addCase(fetchAdminOrders.fulfilled, (state, action) => {
        state.orderLoading = false;
        state.orders = action.payload.orders;
        state.totalOrders = action.payload.total;
        state.totalPages = action.payload.pages;
      })
      .addCase(fetchAdminOrders.rejected, (state, action) => {
        state.orderLoading = false;
        state.error = action.payload as string;
      });

    // Update Order Status
    builder
      .addCase(updateOrderStatus.pending, (state) => {
        state.orderLoading = true;
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.orderLoading = false;
        const payloadId = getOrderId(action.payload);
        const index = state.orders.findIndex(
          (o) => getOrderId(o) === payloadId
        );
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.orderLoading = false;
        state.error = action.payload as string;
      });

    // Update Payment Status
    builder
      .addCase(updatePaymentStatus.pending, (state) => {
        state.orderLoading = true;
        state.error = null;
      })
      .addCase(updatePaymentStatus.fulfilled, (state, action) => {
        state.orderLoading = false;
        const payloadId = getOrderId(action.payload);
        const index = state.orders.findIndex(
          (o) => getOrderId(o) === payloadId
        );
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
      })
      .addCase(updatePaymentStatus.rejected, (state, action) => {
        state.orderLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setCurrentPage } = adminSlice.actions;
export default adminSlice.reducer;
