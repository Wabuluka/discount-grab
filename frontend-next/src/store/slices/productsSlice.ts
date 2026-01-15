import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { productApi } from "@/services/productApi";
import type { Product } from "@/types/product";

interface ProductsState {
  items: Product[];
  total: number;
  loading: boolean;
  page: number;
}

const initialState: ProductsState = {
  items: [],
  total: 0,
  loading: false,
  page: 1,
};

export const fetchProducts = createAsyncThunk("products/fetch", async () => {
  const res = await productApi.getProducts();
  return res.data;
});

const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchProducts.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchProducts.fulfilled, (state, action) => {
      state.loading = false;
      state.items = action.payload.docs;
      state.total = action.payload.total;
    });
    builder.addCase(fetchProducts.rejected, (state) => {
      state.loading = false;
    });
  },
});

export default productsSlice.reducer;
