"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/store";
import {
  fetchCart,
  removeFromCart,
  updateCartItem,
} from "@/store/slices/cartSlice";
import { formatAsCurrency } from "@/utils/formatCurrency";
import { getCartItemProductId } from "@/services/cartApi";

export default function CartPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { cart, loading, error, itemCount } = useAppSelector(
    (state) => state.cart
  );
  const { isAuthenticated, initializing } = useAppSelector(
    (state) => state.auth
  );
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart());
    }
  }, [dispatch, isAuthenticated]);

  const handleQuantityChange = (productId: string, quantity: number) => {
    if (quantity < 1) return;
    dispatch(updateCartItem({ productId, quantity }));
  };

  const handleRemove = (productId: string) => {
    dispatch(removeFromCart(productId));
  };

  const handleImageError = (productId: string) => {
    setImageErrors((prev) => ({ ...prev, [productId]: true }));
  };

  const subtotal = cart?.totalAmount || 0;
  const shipping = subtotal > 100 ? 0 : 10;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

  if (initializing) {
    return (
      <div className="min-h-screen bg-linear-to-b from-slate-50 to-slate-100 mt-20">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-500">Loading your cart...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-linear-to-b from-slate-50 to-slate-100 mt-20">
        {/* Header Banner */}
        <div className="bg-linear-to-r from-cyan-600 via-blue-600 to-indigo-700">
          <div className="max-w-7xl mx-auto px-4 py-10">
            <nav className="flex items-center gap-2 text-cyan-100 text-sm mb-3">
              <Link href="/" className="hover:text-white transition-colors">
                Home
              </Link>
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
              <span className="text-white">Cart</span>
            </nav>
            <h1 className="text-3xl sm:text-4xl font-bold text-white">
              Shopping Cart
            </h1>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
            <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Please login to view your cart
            </h2>
            <p className="text-slate-500 mb-6 max-w-md mx-auto">
              Sign in to your account to view items in your cart and proceed to
              checkout.
            </p>
            <Link
              href="/auth"
              className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 transition-colors font-medium"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                />
              </svg>
              Login to Continue
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading && !cart) {
    return (
      <div className="min-h-screen bg-linear-to-b from-slate-50 to-slate-100 mt-20">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-500">Loading your cart...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 to-slate-100 mt-20">
      {/* Header Banner */}
      <div className="bg-linear-to-r from-cyan-600 via-blue-600 to-indigo-700">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <nav className="flex items-center gap-2 text-cyan-100 text-sm mb-3">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
            <span className="text-white">Cart</span>
          </nav>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl sm:text-4xl font-bold text-white">
              Shopping Cart
            </h1>
            {itemCount > 0 && (
              <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white font-medium">
                {itemCount} {itemCount === 1 ? "item" : "items"}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
              <svg
                className="w-5 h-5 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {itemCount === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
            <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-12 h-12 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Your cart is empty
            </h2>
            <p className="text-slate-500 mb-6 max-w-md mx-auto">
              Looks like you haven&apos;t added any products to your cart yet.
              Start shopping to fill it up!
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 transition-colors font-medium"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-900">
                    Cart Items
                  </h2>
                  <span className="text-sm text-slate-500">
                    {itemCount} {itemCount === 1 ? "item" : "items"}
                  </span>
                </div>
                <div className="divide-y divide-slate-100">
                  {cart?.items.map((item) => (
                    <div
                      key={getCartItemProductId(item.product)}
                      className="p-6 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex gap-4">
                        {/* Product Image */}
                        <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                          <Image
                            src={
                              imageErrors[getCartItemProductId(item.product)] ||
                              !item.product.images?.[0]
                                ? "/placeholder-product.svg"
                                : item.product.images[0]
                            }
                            alt={item.product.title}
                            fill
                            className="object-cover"
                            onError={() => handleImageError(getCartItemProductId(item.product))}
                          />
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/product/${getCartItemProductId(item.product)}`}
                            className="text-lg font-semibold text-slate-900 hover:text-cyan-600 transition-colors line-clamp-1"
                          >
                            {item.product.title}
                          </Link>
                          <p className="text-slate-500 text-sm mt-1">
                            {formatAsCurrency(item.price)} each
                          </p>

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-3 mt-3">
                            <div className="flex items-center bg-slate-100 rounded-lg">
                              <button
                                className="w-9 h-9 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-l-lg transition-colors disabled:opacity-50"
                                onClick={() =>
                                  handleQuantityChange(
                                    getCartItemProductId(item.product),
                                    item.quantity - 1
                                  )
                                }
                                disabled={loading || item.quantity <= 1}
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M20 12H4"
                                  />
                                </svg>
                              </button>
                              <span className="w-12 text-center font-medium text-slate-900">
                                {item.quantity}
                              </span>
                              <button
                                className="w-9 h-9 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-r-lg transition-colors disabled:opacity-50"
                                onClick={() =>
                                  handleQuantityChange(
                                    getCartItemProductId(item.product),
                                    item.quantity + 1
                                  )
                                }
                                disabled={
                                  loading || item.quantity >= item.product.stock
                                }
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 4v16m8-8H4"
                                  />
                                </svg>
                              </button>
                            </div>
                            <button
                              className="flex items-center gap-1 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              onClick={() => handleRemove(getCartItemProductId(item.product))}
                              disabled={loading}
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                              Remove
                            </button>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="text-right shrink-0">
                          <p className="text-xl font-bold text-slate-900">
                            {formatAsCurrency(item.price * item.quantity)}
                          </p>
                          {item.quantity > 1 && (
                            <p className="text-sm text-slate-500 mt-1">
                              {formatAsCurrency(item.price)} x {item.quantity}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Continue Shopping Link */}
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 text-cyan-600 hover:text-cyan-700 font-medium transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Continue Shopping
              </Link>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden sticky top-24">
                <div className="px-6 py-4 border-b border-slate-100">
                  <h2 className="text-lg font-semibold text-slate-900">
                    Order Summary
                  </h2>
                </div>
                <div className="p-6">
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-slate-600">
                      <span>Subtotal ({itemCount} items)</span>
                      <span className="font-medium text-slate-900">
                        {formatAsCurrency(subtotal)}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Shipping</span>
                      <span
                        className={`font-medium ${shipping === 0 ? "text-emerald-600" : "text-slate-900"}`}
                      >
                        {shipping === 0 ? "Free" : formatAsCurrency(shipping)}
                      </span>
                    </div>
                    {shipping > 0 && (
                      <p className="text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2">
                        Free shipping on orders over {formatAsCurrency(100)}
                      </p>
                    )}
                    <div className="flex justify-between text-slate-600">
                      <span>Tax (10%)</span>
                      <span className="font-medium text-slate-900">
                        {formatAsCurrency(tax)}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-slate-200 pt-4 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-slate-900">
                        Total
                      </span>
                      <span className="text-2xl font-bold text-cyan-600">
                        {formatAsCurrency(total)}
                      </span>
                    </div>
                  </div>

                  <button
                    className="w-full py-3 px-4 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => router.push("/checkout")}
                    disabled={loading}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                    Proceed to Checkout
                  </button>

                  {/* Security Badge */}
                  <div className="mt-4 flex items-center justify-center gap-2 text-sm text-slate-500">
                    <svg
                      className="w-4 h-4 text-emerald-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                    Secure checkout
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
