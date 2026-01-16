import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { Cart } from "@/services/cartApi";
import { cartApi } from "@/services/cartApi";
import { parseApiError, getErrorMessage, ErrorCode } from "@/types/error";

interface CartState {
  cart: Cart | null;
  loading: boolean;
  error: string | null;
  errorCode: ErrorCode | null;
  itemCount: number;
}

const initialState: CartState = {
  cart: null,
  loading: false,
  error: null,
  errorCode: null,
  itemCount: 0,
};

interface CartErrorPayload {
  message: string;
  code: ErrorCode;
}

export const fetchCart = createAsyncThunk(
  "cart/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const res = await cartApi.getCart();
      return res.data.cart;
    } catch (err: unknown) {
      const apiError = parseApiError(err);
      return rejectWithValue({
        message: getErrorMessage(apiError),
        code: apiError.code,
      });
    }
  }
);

export const addToCart = createAsyncThunk(
  "cart/add",
  async (
    { productId, quantity = 1 }: { productId: string; quantity?: number },
    { rejectWithValue }
  ) => {
    try {
      const res = await cartApi.addToCart(productId, quantity);
      return res.data.cart;
    } catch (err: unknown) {
      const apiError = parseApiError(err);
      return rejectWithValue({
        message: getErrorMessage(apiError),
        code: apiError.code,
      });
    }
  }
);

export const updateCartItem = createAsyncThunk(
  "cart/update",
  async (
    { productId, quantity }: { productId: string; quantity: number },
    { rejectWithValue }
  ) => {
    try {
      const res = await cartApi.updateItem(productId, quantity);
      return res.data.cart;
    } catch (err: unknown) {
      const apiError = parseApiError(err);
      return rejectWithValue({
        message: getErrorMessage(apiError),
        code: apiError.code,
      });
    }
  }
);

export const removeFromCart = createAsyncThunk(
  "cart/remove",
  async (productId: string, { rejectWithValue }) => {
    try {
      const res = await cartApi.removeItem(productId);
      return res.data.cart;
    } catch (err: unknown) {
      const apiError = parseApiError(err);
      return rejectWithValue({
        message: getErrorMessage(apiError),
        code: apiError.code,
      });
    }
  }
);

export const clearCart = createAsyncThunk(
  "cart/clear",
  async (_, { rejectWithValue }) => {
    try {
      const res = await cartApi.clearCart();
      return res.data.cart;
    } catch (err: unknown) {
      const apiError = parseApiError(err);
      return rejectWithValue({
        message: getErrorMessage(apiError),
        code: apiError.code,
      });
    }
  }
);

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    resetCart: (state) => {
      state.cart = null;
      state.itemCount = 0;
      state.error = null;
      state.errorCode = null;
    },
    clearCartError: (state) => {
      state.error = null;
      state.errorCode = null;
    },
  },
  extraReducers: (builder) => {
    const setCartState = (state: CartState, cart: Cart) => {
      state.cart = cart;
      state.itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
      state.loading = false;
      state.error = null;
      state.errorCode = null;
    };

    const setErrorState = (state: CartState, payload: unknown) => {
      state.loading = false;
      const errorPayload = payload as CartErrorPayload | undefined;
      if (errorPayload) {
        state.error = errorPayload.message;
        state.errorCode = errorPayload.code;
      } else {
        state.error = "An unexpected error occurred";
        state.errorCode = ErrorCode.INTERNAL_ERROR;
      }
    };

    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        setCartState(state, action.payload);
      })
      .addCase(fetchCart.rejected, (state, action) => {
        setErrorState(state, action.payload);
      })
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        setCartState(state, action.payload);
      })
      .addCase(addToCart.rejected, (state, action) => {
        setErrorState(state, action.payload);
      })
      .addCase(updateCartItem.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        setCartState(state, action.payload);
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        setErrorState(state, action.payload);
      })
      .addCase(removeFromCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        setCartState(state, action.payload);
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        setErrorState(state, action.payload);
      })
      .addCase(clearCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(clearCart.fulfilled, (state, action) => {
        setCartState(state, action.payload);
      })
      .addCase(clearCart.rejected, (state, action) => {
        setErrorState(state, action.payload);
      });
  },
});

export const { resetCart, clearCartError } = cartSlice.actions;
export default cartSlice.reducer;
