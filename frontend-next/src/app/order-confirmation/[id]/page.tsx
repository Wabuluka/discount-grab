"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import type { Order } from "@/services/orderApi";
import { orderApi } from "@/services/orderApi";
import { formatAsCurrency } from "@/utils/formatCurrency";

export default function OrderConfirmationPage() {
  const params = useParams();
  const id = params.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) return;
      try {
        const response = await orderApi.getOrder(id);
        setOrder(response.data.order);
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } } };
        setError(error.response?.data?.message || "Failed to load order");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50/30 to-slate-100 mt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-cyan-100"></div>
            <div className="absolute inset-0 rounded-full border-4 border-cyan-500 border-t-transparent animate-spin"></div>
            <div className="absolute inset-3 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 animate-pulse"></div>
          </div>
          <p className="text-gray-600 font-medium">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50/30 to-slate-100 mt-20">
        <div className="max-w-3xl mx-auto px-4 py-16">
          <div className="bg-white rounded-3xl shadow-xl shadow-red-100/50 border border-red-100 p-12 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
              <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Order Not Found</h2>
            <p className="text-gray-500 mb-8 text-lg">We couldn&apos;t find the order you&apos;re looking for.</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-2xl hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg shadow-cyan-200 hover:shadow-xl hover:shadow-cyan-300 hover:-translate-y-0.5"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Go Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "processing":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "shipped":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "delivered":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "cancelled":
        return "bg-red-100 text-red-700 border-red-200";
      case "paid":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "processing":
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        );
      case "shipped":
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
          </svg>
        );
      case "delivered":
      case "paid":
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case "cancelled":
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const orderSteps = [
    { key: "pending", label: "Order Placed", icon: "clipboard" },
    { key: "confirmed", label: "Confirmed", icon: "check" },
    { key: "processing", label: "Processing", icon: "cog" },
    { key: "shipped", label: "Shipped", icon: "truck" },
    { key: "delivered", label: "Delivered", icon: "home" },
  ];

  const getCurrentStepIndex = () => {
    const statusOrder = ["pending", "confirmed", "processing", "shipped", "delivered"];
    const currentIndex = statusOrder.indexOf(order.orderStatus.toLowerCase());
    return currentIndex >= 0 ? currentIndex : 0;
  };

  const getStepIcon = (icon: string, isActive: boolean, isCompleted: boolean) => {
    const baseClass = `w-5 h-5 ${isCompleted ? "text-white" : isActive ? "text-cyan-600" : "text-gray-400"}`;
    switch (icon) {
      case "clipboard":
        return (
          <svg className={baseClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        );
      case "check":
        return (
          <svg className={baseClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case "cog":
        return (
          <svg className={baseClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      case "truck":
        return (
          <svg className={baseClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
          </svg>
        );
      case "home":
        return (
          <svg className={baseClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        );
      default:
        return null;
    }
  };

  const currentStepIndex = getCurrentStepIndex();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/20 to-slate-100 mt-20">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`,
              }}
            >
              <div
                className={`w-3 h-3 ${
                  ["bg-emerald-500", "bg-cyan-500", "bg-amber-500", "bg-purple-500", "bg-pink-500"][
                    Math.floor(Math.random() * 5)
                  ]
                }`}
                style={{
                  transform: `rotate(${Math.random() * 360}deg)`,
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
          <div className="flex items-center gap-2 text-emerald-100 text-sm mb-3">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-white font-medium">Order Confirmation</span>
          </div>
          <div className="flex items-center gap-5">
            <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm shadow-lg">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold">Order Confirmed!</h1>
              <p className="text-emerald-100 mt-1 text-lg">Thank you for your purchase</p>
            </div>
          </div>
        </div>
      </div>

      {/* Order Tracking Timeline */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between relative">
            {/* Progress Line Background */}
            <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 mx-12 hidden sm:block"></div>
            {/* Progress Line Fill */}
            <div
              className="absolute top-5 left-0 h-1 bg-gradient-to-r from-emerald-500 to-cyan-500 mx-12 hidden sm:block transition-all duration-500"
              style={{ width: `${(currentStepIndex / (orderSteps.length - 1)) * 100}%`, maxWidth: "calc(100% - 6rem)" }}
            ></div>

            {orderSteps.map((step, index) => {
              const isCompleted = index < currentStepIndex;
              const isActive = index === currentStepIndex;
              const isCancelled = order.orderStatus.toLowerCase() === "cancelled";

              return (
                <div key={step.key} className="flex flex-col items-center relative z-10">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isCancelled && index > 0
                        ? "bg-gray-100 border-2 border-gray-200"
                        : isCompleted
                        ? "bg-gradient-to-br from-emerald-500 to-cyan-500 shadow-lg shadow-emerald-200"
                        : isActive
                        ? "bg-white border-3 border-cyan-500 shadow-lg shadow-cyan-100"
                        : "bg-gray-100 border-2 border-gray-200"
                    }`}
                  >
                    {getStepIcon(step.icon, isActive, isCompleted)}
                  </div>
                  <span
                    className={`mt-2 text-xs sm:text-sm font-medium transition-colors ${
                      isCompleted || isActive ? "text-gray-900" : "text-gray-400"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Message Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-emerald-100/50 border border-emerald-100 p-8 sm:p-10 text-center mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-emerald-100 to-cyan-100 rounded-full -translate-y-1/2 translate-x-1/2 opacity-50"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-amber-100 to-yellow-100 rounded-full translate-y-1/2 -translate-x-1/2 opacity-50"></div>

          <div className="relative">
            <div className="w-28 h-28 bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-emerald-300 animate-pulse">
              <svg className="h-14 w-14 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Your Order is Confirmed!</h2>
            <p className="text-gray-500 mb-8 max-w-lg mx-auto text-lg">
              Thank you for shopping with us. We&apos;ve received your order and will begin processing it shortly.
            </p>
            <div className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl border border-slate-200">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
              </svg>
              <div className="text-left">
                <span className="text-gray-500 text-sm block">Order Number</span>
                <span className="font-bold text-gray-900 text-xl">{order.orderNumber}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Order Status */}
          <div className="bg-white rounded-3xl shadow-lg shadow-slate-100 border border-slate-100 overflow-hidden hover:shadow-xl transition-shadow">
            <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-cyan-50/30">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl shadow-lg shadow-cyan-200">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Order Details</h3>
              </div>
            </div>
            <div className="p-6 space-y-5">
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                <span className="text-gray-600 font-medium">Order Status</span>
                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border ${getStatusColor(order.orderStatus)}`}>
                  {getStatusIcon(order.orderStatus)}
                  <span className="capitalize">{order.orderStatus}</span>
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                <span className="text-gray-600 font-medium">Payment Status</span>
                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border ${getStatusColor(order.paymentStatus)}`}>
                  {getStatusIcon(order.paymentStatus)}
                  <span className="capitalize">{order.paymentStatus}</span>
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                <span className="text-gray-600 font-medium">Payment Method</span>
                <span className="font-semibold text-gray-900 capitalize flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  {order.paymentMethod.replace("_", " ")}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                <span className="text-gray-600 font-medium">Order Date</span>
                <span className="font-semibold text-gray-900 flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {new Date(order.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-3xl shadow-lg shadow-slate-100 border border-slate-100 overflow-hidden hover:shadow-xl transition-shadow">
            <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-purple-50/30">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-xl shadow-lg shadow-purple-200">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Shipping Address</h3>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-4 bg-gradient-to-br from-slate-100 to-slate-50 rounded-2xl">
                  <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900 text-lg">{order.shippingAddress.fullName}</p>
                  <div className="mt-3 space-y-1 text-gray-600">
                    <p>{order.shippingAddress.address}</p>
                    <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                    <p className="font-medium text-gray-700">{order.shippingAddress.country}</p>
                  </div>
                  {order.shippingAddress.phone && (
                    <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-xl text-gray-700">
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span className="font-medium">{order.shippingAddress.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-3xl shadow-lg shadow-slate-100 border border-slate-100 overflow-hidden mb-8">
          <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-amber-50/30">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl shadow-lg shadow-amber-200">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Order Items</h3>
              <span className="ml-auto px-4 py-2 bg-gradient-to-r from-slate-100 to-slate-50 text-gray-700 text-sm font-semibold rounded-xl border border-slate-200">
                {order.items?.length || 0} {(order.items?.length || 0) === 1 ? "item" : "items"}
              </span>
            </div>
          </div>
          <div className="divide-y divide-slate-100">
            {order.items?.map((item, index) => (
              <div key={index} className="p-6 flex justify-between items-center hover:bg-gradient-to-r hover:from-slate-50 hover:to-transparent transition-all group">
                <div className="flex items-center gap-5">
                  <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center group-hover:shadow-lg transition-shadow overflow-hidden">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.title}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-lg group-hover:text-cyan-700 transition-colors">{item.title}</p>
                    <p className="text-gray-500 mt-1">
                      <span className="font-medium text-gray-700">{formatAsCurrency(item.price)}</span>
                      <span className="mx-2 text-gray-300">×</span>
                      <span className="bg-slate-100 px-2 py-0.5 rounded-lg text-sm">{item.quantity}</span>
                    </p>
                  </div>
                </div>
                <p className="font-bold text-gray-900 text-xl">
                  {formatAsCurrency(item.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>

          {/* Price Summary */}
          <div className="p-6 bg-gradient-to-br from-slate-50 to-cyan-50/30 border-t border-slate-100">
            <div className="max-w-sm ml-auto space-y-4">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-semibold text-gray-800">{formatAsCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span className="flex items-center gap-2">
                  Shipping
                  {order.shippingCost === 0 && (
                    <span className="px-2 py-1 bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 text-xs font-semibold rounded-lg">
                      FREE
                    </span>
                  )}
                </span>
                <span className="font-semibold text-gray-800">
                  {formatAsCurrency(order.shippingCost)}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax</span>
                <span className="font-semibold text-gray-800">{formatAsCurrency(order.tax)}</span>
              </div>
              <div className="pt-4 border-t-2 border-dashed border-slate-200">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-gray-900">Total</span>
                  <span className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                    {formatAsCurrency(order.totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/dashboard/orders"
            className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white border-2 border-slate-200 text-gray-700 font-semibold rounded-2xl hover:bg-slate-50 hover:border-slate-300 hover:shadow-lg transition-all group"
          >
            <svg className="w-5 h-5 text-gray-500 group-hover:text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            View All Orders
          </Link>
          <Link
            href="/shop"
            className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-2xl hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg shadow-cyan-200 hover:shadow-xl hover:shadow-cyan-300 hover:-translate-y-0.5 group"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            Continue Shopping
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Help Section */}
        <div className="mt-8 p-6 sm:p-8 bg-white rounded-3xl shadow-lg shadow-slate-100 border border-slate-100">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="p-4 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-center sm:text-left flex-1">
              <h4 className="font-bold text-gray-900 text-lg">Need Help with Your Order?</h4>
              <p className="text-gray-500 mt-1">
                Our support team is here to assist you with any questions about your order.
              </p>
            </div>
            <Link
              href="/contact"
              className="px-6 py-3 text-cyan-600 font-semibold hover:bg-cyan-50 rounded-xl transition-colors border border-cyan-200 hover:border-cyan-300"
            >
              Contact Support
            </Link>
          </div>
        </div>

        {/* Email Confirmation Note */}
        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm flex items-center justify-center gap-2">
            <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            A confirmation email has been sent to your registered email address
          </p>
        </div>
      </div>

      {/* CSS for confetti animation */}
      <style jsx>{`
        @keyframes confetti {
          0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-confetti {
          animation: confetti 3s ease-in-out forwards;
        }
      `}</style>
    </div>
  );
}
