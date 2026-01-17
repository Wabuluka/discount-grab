"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import * as yup from "yup";
import { useAppSelector } from "@/store/store";
import FormWrapper from "@/components/form/FormWrapper";
import Input from "@/components/form/Input";
import type { ShippingAddress } from "@/services/orderApi";
import { orderApi, getOrderId } from "@/services/orderApi";
import { formatAsCurrency } from "@/utils/formatCurrency";
import { getCartItemProductId } from "@/services/cartApi";

const shippingSchema = yup.object({
  fullName: yup.string().required("Full name is required"),
  address: yup.string().required("Address is required"),
  city: yup.string().required("City is required"),
  postalCode: yup.string().required("Postal code is required"),
  country: yup.string().required("Country is required"),
  phone: yup.string(),
});

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, itemCount } = useAppSelector((state) => state.cart);
  const { isAuthenticated, initializing } = useAppSelector((state) => state.auth);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "cash_on_delivery">(
    "cash_on_delivery"
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (initializing) return;
    if (!isAuthenticated) {
      router.push("/auth");
    } else if (itemCount === 0) {
      router.push("/cart");
    }
  }, [isAuthenticated, initializing, itemCount, router]);

  if (initializing) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 mt-20 flex items-center justify-center">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg text-cyan-600"></span>
          <p className="mt-4 text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || itemCount === 0) {
    return null;
  }

  const subtotal = cart?.totalAmount || 0;
  const shipping = subtotal > 100 ? 0 : 10;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

  const handleSubmit = async (data: ShippingAddress) => {
    setLoading(true);
    setError(null);

    try {
      const response = await orderApi.createOrder({
        shippingAddress: data,
        paymentMethod,
      });
      const order = response.data.order;
      const orderId = getOrderId(order);
      if (!orderId) {
        console.error("Order created but no ID returned:", response.data);
        setError("Order was created but we couldn't retrieve the order ID. Please check your orders.");
        return;
      }
      router.push(`/order-confirmation/${orderId}`);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Failed to create order");
    } finally {
      setLoading(false);
    }
  };

  const handleImageError = (productId: string) => {
    setImageErrors((prev) => ({ ...prev, [productId]: true }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 mt-20">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-2 text-cyan-100 text-sm mb-2">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <Link href="/cart" className="hover:text-white transition-colors">
              Cart
            </Link>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span>Checkout</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold">Checkout</h1>
              <p className="text-cyan-100 mt-1">Complete your order securely</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-cyan-600 text-white flex items-center justify-center text-sm font-semibold">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-cyan-600 font-medium">Cart</span>
            </div>
            <div className="w-16 h-0.5 bg-cyan-600"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-cyan-600 text-white flex items-center justify-center text-sm font-semibold">
                2
              </div>
              <span className="text-cyan-600 font-medium">Checkout</span>
            </div>
            <div className="w-16 h-0.5 bg-gray-300"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-500 flex items-center justify-center text-sm font-semibold">
                3
              </div>
              <span className="text-gray-500 font-medium">Confirmation</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-red-700">{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Information */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-cyan-100 rounded-lg">
                    <svg className="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Shipping Information</h2>
                </div>
              </div>
              <div className="p-6">
                <FormWrapper
                  onSubmit={handleSubmit}
                  schema={shippingSchema}
                  defaultValues={{
                    fullName: "",
                    address: "",
                    city: "",
                    postalCode: "",
                    country: "",
                    phone: "",
                  }}
                  submitLabel={loading ? "Processing Order..." : "Place Order"}
                >
                  <fieldset disabled={loading}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <Input
                        name="fullName"
                        label="Full Name"
                        placeholder="John Doe"
                        id="fullName"
                      />
                      <Input
                        name="phone"
                        label="Phone (optional)"
                        placeholder="+1 234 567 890"
                        id="phone"
                      />
                    </div>
                    <div className="mb-4">
                      <Input
                        name="address"
                        label="Street Address"
                        placeholder="123 Main Street, Apt 4"
                        id="address"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <Input name="city" label="City" placeholder="New York" id="city" />
                      <Input
                        name="postalCode"
                        label="Postal Code"
                        placeholder="10001"
                        id="postalCode"
                      />
                      <Input
                        name="country"
                        label="Country"
                        placeholder="United States"
                        id="country"
                      />
                    </div>

                    {/* Payment Method Section */}
                    <div className="pt-6 border-t border-gray-100">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Payment Method</h3>
                      </div>
                      <div className="space-y-3">
                        <label
                          className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                            paymentMethod === "cash_on_delivery"
                              ? "border-cyan-500 bg-cyan-50"
                              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          <input
                            type="radio"
                            name="paymentMethod"
                            className="radio radio-primary"
                            checked={paymentMethod === "cash_on_delivery"}
                            onChange={() => setPaymentMethod("cash_on_delivery")}
                          />
                          <div className="p-2 bg-amber-100 rounded-lg">
                            <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <span className="font-semibold text-gray-900">Cash on Delivery</span>
                            <p className="text-sm text-gray-500">
                              Pay when you receive your order
                            </p>
                          </div>
                          {paymentMethod === "cash_on_delivery" && (
                            <div className="p-1 bg-cyan-500 rounded-full">
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </label>
                        <label
                          className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-xl cursor-not-allowed opacity-60"
                        >
                          <input
                            type="radio"
                            name="paymentMethod"
                            className="radio"
                            checked={paymentMethod === "card"}
                            onChange={() => setPaymentMethod("card")}
                            disabled
                          />
                          <div className="p-2 bg-gray-100 rounded-lg">
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <span className="font-semibold text-gray-500">Credit/Debit Card</span>
                            <p className="text-sm text-gray-400">Coming soon</p>
                          </div>
                          <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs font-medium rounded-full">
                            Soon
                          </span>
                        </label>
                      </div>
                    </div>
                  </fieldset>
                </FormWrapper>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 sticky top-24 overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-cyan-100 rounded-lg">
                    <svg className="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Order Summary</h2>
                </div>
              </div>

              <div className="p-6">
                {/* Cart Items */}
                <div className="space-y-4 max-h-64 overflow-y-auto mb-6">
                  {cart?.items.map((item) => (
                    <div key={getCartItemProductId(item.product)} className="flex gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="relative w-16 h-16 flex-shrink-0">
                        {imageErrors[getCartItemProductId(item.product)] ? (
                          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        ) : (
                          <Image
                            src={item.product.images?.[0] || "https://via.placeholder.com/60"}
                            alt={item.product.title}
                            fill
                            className="object-cover rounded-lg"
                            onError={() => handleImageError(getCartItemProductId(item.product))}
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm line-clamp-1">
                          {item.product.title}
                        </p>
                        <p className="text-gray-500 text-xs mt-1">Qty: {item.quantity}</p>
                        <p className="font-semibold text-cyan-600 text-sm mt-1">
                          {formatAsCurrency(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 py-4 border-t border-gray-100">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-medium">{formatAsCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span className="flex items-center gap-1">
                      Shipping
                      {shipping === 0 && (
                        <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                          Free
                        </span>
                      )}
                    </span>
                    <span className="font-medium">
                      {formatAsCurrency(shipping)}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax (10%)</span>
                    <span className="font-medium">{formatAsCurrency(tax)}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-cyan-600">{formatAsCurrency(total)}</span>
                  </div>
                </div>

                {/* Security Badge */}
                <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Secure Checkout</p>
                      <p className="text-xs text-gray-500">Your information is protected</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
