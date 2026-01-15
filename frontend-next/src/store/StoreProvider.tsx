"use client";

import { useRef, useEffect } from "react";
import { Provider } from "react-redux";
import { makeStore, AppStore } from "./store";
import { initializeAuth } from "./slices/authSlice";
import { fetchCart } from "./slices/cartSlice";

export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const storeRef = useRef<AppStore | null>(null);

  if (!storeRef.current) {
    storeRef.current = makeStore();
  }

  useEffect(() => {
    if (storeRef.current) {
      const store = storeRef.current;
      // Initialize auth - this will check for token and fetch user if exists
      store.dispatch(initializeAuth()).then((action) => {
        // If user is authenticated, also fetch their cart
        const payload = action.payload as { hasToken: boolean } | undefined;
        if (action.type === "auth/initialize/fulfilled" && payload?.hasToken) {
          store.dispatch(fetchCart());
        }
      });
    }
  }, []);

  return <Provider store={storeRef.current}>{children}</Provider>;
}
