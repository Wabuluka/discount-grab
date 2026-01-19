"use client";

import type { Order } from "@/lib/adminApi";
import { adminOrderApi, getOrderId } from "@/lib/adminApi";
import {
  fetchAdminOrders,
  updateOrderStatus,
  updatePaymentStatus,
} from "@/store/slices/adminSlice";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { formatAsCurrency } from "@/utils/formatCurrency";
import { useEffect, useState } from "react";

const ORDER_STATUSES = [
  {
    value: "pending",
    label: "Pending",
    color: "bg-amber-50 text-amber-700 border-amber-200",
    icon: "clock",
  },
  {
    value: "confirmed",
    label: "Confirmed",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    icon: "check",
  },
  {
    value: "processing",
    label: "Processing",
    color: "bg-purple-50 text-purple-700 border-purple-200",
    icon: "cog",
  },
  {
    value: "shipped",
    label: "Shipped",
    color: "bg-indigo-50 text-indigo-700 border-indigo-200",
    icon: "truck",
  },
  {
    value: "delivered",
    label: "Delivered",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: "check-circle",
  },
  {
    value: "cancelled",
    label: "Cancelled",
    color: "bg-red-50 text-red-700 border-red-200",
    icon: "x",
  },
];

const PAYMENT_STATUSES = [
  {
    value: "pending",
    label: "Pending",
    color: "bg-amber-50 text-amber-700 border-amber-200",
  },
  {
    value: "paid",
    label: "Paid",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  {
    value: "failed",
    label: "Failed",
    color: "bg-red-50 text-red-700 border-red-200",
  },
  {
    value: "refunded",
    label: "Refunded",
    color: "bg-slate-50 text-slate-700 border-slate-200",
  },
];

export default function AdminOrdersPage() {
  const dispatch = useAppDispatch();
  const { orders, totalOrders, totalPages, currentPage, orderLoading, error } =
    useAppSelector((state) => state.admin);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [modalLoading, setModalLoading] = useState(false);

  console.log("These are my orders: ", orders);

  useEffect(() => {
    dispatch(
      fetchAdminOrders({
        page: currentPage,
        limit: 20,
        status: filterStatus || undefined,
      }),
    );
  }, [dispatch, currentPage, filterStatus]);

  const filteredOrders = (orders || []).filter(
    (order) =>
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleStatusChange = async (
    orderId: string,
    status: Order["orderStatus"],
  ) => {
    await dispatch(updateOrderStatus({ id: orderId, status }));
  };

  const handlePaymentStatusChange = async (
    orderId: string,
    status: Order["paymentStatus"],
  ) => {
    await dispatch(updatePaymentStatus({ id: orderId, status }));
  };

  const handleViewOrder = async (order: Order) => {
    setModalLoading(true);
    setSelectedOrder(order); // Show modal immediately with basic data
    try {
      const fullOrderData = await adminOrderApi.getById(getOrderId(order));
      setSelectedOrder(fullOrderData); // Update with full data
    } catch (error) {
      console.error("Failed to fetch order details:", error);
      // Keep showing basic data if fetch fails
    } finally {
      setModalLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    return (
      ORDER_STATUSES.find((s) => s.value === status)?.color ||
      "bg-gray-50 text-gray-700 border-gray-200"
    );
  };

  const getPaymentStatusColor = (status: string) => {
    return (
      PAYMENT_STATUSES.find((s) => s.value === status)?.color ||
      "bg-gray-50 text-gray-700 border-gray-200"
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      case "confirmed":
        return (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      case "processing":
        return (
          <svg
            className="w-4 h-4 animate-spin"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        );
      case "shipped":
        return (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
            />
          </svg>
        );
      case "delivered":
        return (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        );
      case "cancelled":
        return (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  // Calculate stats
  const pendingOrders = (orders || []).filter(
    (o) => o.orderStatus === "pending",
  ).length;
  const processingOrders = (orders || []).filter(
    (o) => o.orderStatus === "processing",
  ).length;
  const shippedOrders = (orders || []).filter(
    (o) => o.orderStatus === "shipped",
  ).length;
  const deliveredOrders = (orders || []).filter(
    (o) => o.orderStatus === "delivered",
  ).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-500 mt-1">
            Manage and track all customer orders
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-linear-to-r from-cyan-50 to-blue-50 rounded-xl border border-cyan-100">
            <span className="text-cyan-600 font-semibold text-lg">
              {totalOrders}
            </span>
            <span className="text-gray-500 ml-2 text-sm">Total Orders</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-lg hover:shadow-amber-100/50 transition-all group">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-linear-to-br from-amber-100 to-amber-50 rounded-xl group-hover:scale-110 transition-transform">
              <svg
                className="w-6 h-6 text-amber-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {pendingOrders}
              </p>
              <p className="text-sm text-gray-500">Pending</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-lg hover:shadow-purple-100/50 transition-all group">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-linear-to-br from-purple-100 to-purple-50 rounded-xl group-hover:scale-110 transition-transform">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {processingOrders}
              </p>
              <p className="text-sm text-gray-500">Processing</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-lg hover:shadow-indigo-100/50 transition-all group">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-linear-to-br from-indigo-100 to-indigo-50 rounded-xl group-hover:scale-110 transition-transform">
              <svg
                className="w-6 h-6 text-indigo-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
                />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {shippedOrders}
              </p>
              <p className="text-sm text-gray-500">Shipped</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-lg hover:shadow-emerald-100/50 transition-all group">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-linear-to-br from-emerald-100 to-emerald-50 rounded-xl group-hover:scale-110 transition-transform">
              <svg
                className="w-6 h-6 text-emerald-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {deliveredOrders}
              </p>
              <p className="text-sm text-gray-500">Delivered</p>
            </div>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-xl">
            <svg
              className="w-5 h-5 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 p-1.5 bg-slate-100 rounded-lg">
              <svg
                className="w-4 h-4 text-slate-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by order number, customer name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all bg-slate-50 focus:bg-white text-gray-900 placeholder:text-gray-400"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="appearance-none px-5 py-3 pr-12 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none bg-slate-50 focus:bg-white font-medium text-gray-700 cursor-pointer min-w-[180px]"
            >
              <option value="">All Statuses</option>
              {ORDER_STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-linear-to-r from-slate-50 to-slate-100 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orderLoading ? (
                <tr key="loading">
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="relative w-12 h-12">
                        <div className="absolute inset-0 rounded-full border-4 border-cyan-100"></div>
                        <div className="absolute inset-0 rounded-full border-4 border-cyan-500 border-t-transparent animate-spin"></div>
                      </div>
                      <span className="text-gray-500 font-medium">
                        Loading orders...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr key="empty">
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center">
                        <svg
                          className="w-8 h-8 text-slate-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                          />
                        </svg>
                      </div>
                      <p className="text-gray-500 font-medium">
                        No orders found
                      </p>
                      <p className="text-gray-400 text-sm">
                        Try adjusting your search or filter
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order, idx) => (
                  <tr
                    key={getOrderId(order)}
                    className="hover:bg-linear-to-r hover:from-slate-50 hover:to-transparent transition-all group"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm ${
                            idx % 4 === 0
                              ? "bg-linear-to-br from-cyan-400 to-blue-500"
                              : idx % 4 === 1
                                ? "bg-linear-to-br from-purple-400 to-indigo-500"
                                : idx % 4 === 2
                                  ? "bg-linear-to-br from-amber-400 to-orange-500"
                                  : "bg-linear-to-br from-emerald-400 to-teal-500"
                          }`}
                        >
                          {order.orderNumber.slice(-3)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 group-hover:text-cyan-600 transition-colors">
                            {order.orderNumber}
                          </p>
                          <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                            <svg
                              className="w-3.5 h-3.5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                              />
                            </svg>
                            {order.items?.length || 0} item
                            {(order.items?.length || 0) !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-linear-to-br from-slate-200 to-slate-100 flex items-center justify-center text-slate-600 font-semibold text-sm">
                          {order.user?.name?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {order.user?.name || "Unknown"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {order.user?.email || "-"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="relative inline-block">
                        <select
                          value={order.orderStatus}
                          onChange={(e) =>
                            handleStatusChange(
                              getOrderId(order),
                              e.target.value as Order["orderStatus"],
                            )
                          }
                          className={`appearance-none text-xs font-semibold pl-8 pr-8 py-2 rounded-xl border cursor-pointer transition-all hover:shadow-md ${getStatusColor(order.orderStatus)}`}
                        >
                          {ORDER_STATUSES.map((status) => (
                            <option key={status.value} value={status.value}>
                              {status.label}
                            </option>
                          ))}
                        </select>
                        <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                          {getStatusIcon(order.orderStatus)}
                        </div>
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                          <svg
                            className="w-3.5 h-3.5 opacity-50"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="relative inline-block">
                        <select
                          value={order.paymentStatus}
                          onChange={(e) =>
                            handlePaymentStatusChange(
                              getOrderId(order),
                              e.target.value as Order["paymentStatus"],
                            )
                          }
                          className={`appearance-none text-xs font-semibold px-4 pr-8 py-2 rounded-xl border cursor-pointer transition-all hover:shadow-md ${getPaymentStatusColor(order.paymentStatus)}`}
                        >
                          {PAYMENT_STATUSES.map((status) => (
                            <option key={status.value} value={status.value}>
                              {status.label}
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                          <svg
                            className="w-3.5 h-3.5 opacity-50"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-sm font-bold text-gray-900">
                        {formatAsCurrency(order.totalAmount)}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <svg
                          className="w-4 h-4 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        {formatDate(order.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button
                        onClick={() => handleViewOrder(order)}
                        className="inline-flex items-center gap-2 px-4 py-2 text-cyan-600 bg-cyan-50 hover:bg-cyan-100 rounded-xl transition-all font-medium text-sm group-hover:shadow-md"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-100 bg-linear-to-r from-slate-50 to-transparent flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Page{" "}
              <span className="font-semibold text-gray-700">{currentPage}</span>{" "}
              of{" "}
              <span className="font-semibold text-gray-700">{totalPages}</span>
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  dispatch(
                    fetchAdminOrders({
                      page: currentPage - 1,
                      limit: 20,
                      status: filterStatus || undefined,
                    }),
                  )
                }
                disabled={currentPage === 1}
                className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Previous
              </button>
              <button
                onClick={() =>
                  dispatch(
                    fetchAdminOrders({
                      page: currentPage + 1,
                      limit: 20,
                      status: filterStatus || undefined,
                    }),
                  )
                }
                disabled={currentPage === totalPages}
                className="inline-flex items-center gap-2 px-4 py-2 bg-linear-to-r from-cyan-500 to-blue-600 text-white rounded-xl text-sm font-medium hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
              >
                Next
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div
            className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 bg-linear-to-r from-slate-50 to-cyan-50/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-linear-to-br from-cyan-400 to-blue-500 rounded-2xl shadow-lg shadow-cyan-200">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Order Details
                    </h2>
                    <p className="text-gray-500 mt-0.5 flex items-center gap-2">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                        />
                      </svg>
                      {selectedOrder.orderNumber}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-3 text-gray-400 hover:text-gray-600 hover:bg-slate-100 rounded-xl transition-all"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)] space-y-6">
              {/* Status Badges */}
              <div className="flex flex-wrap gap-3">
                <span
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border ${getStatusColor(selectedOrder.orderStatus)}`}
                >
                  {getStatusIcon(selectedOrder.orderStatus)}
                  <span className="capitalize">
                    {selectedOrder.orderStatus}
                  </span>
                </span>
                <span
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border ${getPaymentStatusColor(selectedOrder.paymentStatus)}`}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                  Payment: {selectedOrder.paymentStatus}
                </span>
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-slate-50 text-slate-700 border border-slate-200">
                  {selectedOrder.paymentMethod === "card" ? (
                    <>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                        />
                      </svg>
                      Card Payment
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                      Cash on Delivery
                    </>
                  )}
                </span>
              </div>

              {/* Customer & Shipping */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-linear-to-br from-slate-50 to-blue-50/30 rounded-2xl p-5 border border-slate-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-100 rounded-xl">
                      <svg
                        className="w-5 h-5 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-gray-900">Customer</h3>
                  </div>
                  {modalLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-linear-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-bold text-lg">
                        {selectedOrder.user?.name?.charAt(0)?.toUpperCase() ||
                          "?"}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {selectedOrder.user?.name || "Unknown"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {selectedOrder.user?.email || "-"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-linear-to-br from-slate-50 to-purple-50/30 rounded-2xl p-5 border border-slate-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-purple-100 rounded-xl">
                      <svg
                        className="w-5 h-5 text-purple-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-gray-900">
                      Shipping Address
                    </h3>
                  </div>
                  {modalLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="w-6 h-6 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                    </div>
                  ) : selectedOrder.shippingAddress ? (
                    <div className="space-y-1 text-sm">
                      <p className="font-semibold text-gray-900">
                        {selectedOrder.shippingAddress.fullName}
                      </p>
                      <p className="text-gray-600">
                        {selectedOrder.shippingAddress.address}
                      </p>
                      <p className="text-gray-600">
                        {selectedOrder.shippingAddress.city},{" "}
                        {selectedOrder.shippingAddress.postalCode}
                      </p>
                      <p className="text-gray-600">
                        {selectedOrder.shippingAddress.country}
                      </p>
                      {selectedOrder.shippingAddress.phone && (
                        <p className="text-gray-600 pt-1 flex items-center gap-1">
                          <svg
                            className="w-4 h-4 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                            />
                          </svg>
                          {selectedOrder.shippingAddress.phone}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">
                      No shipping address available
                    </p>
                  )}
                </div>
              </div>

              {/* Items */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="p-4 bg-linear-to-r from-slate-50 to-amber-50/30 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 rounded-xl">
                      <svg
                        className="w-5 h-5 text-amber-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                        />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-gray-900">Order Items</h3>
                    <span className="ml-auto px-3 py-1 bg-slate-100 text-slate-600 text-sm font-medium rounded-lg">
                      {selectedOrder.items?.length || 0} item
                      {(selectedOrder.items?.length || 0) !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                        Item
                      </th>
                      <th className="px-5 py-3 text-center text-xs font-semibold text-slate-600 uppercase">
                        Qty
                      </th>
                      <th className="px-5 py-3 text-right text-xs font-semibold text-slate-600 uppercase">
                        Price
                      </th>
                      <th className="px-5 py-3 text-right text-xs font-semibold text-slate-600 uppercase">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {modalLoading ? (
                      <tr>
                        <td colSpan={4} className="px-5 py-8">
                          <div className="flex items-center justify-center">
                            <div className="w-6 h-6 border-2 border-amber-200 border-t-amber-600 rounded-full animate-spin"></div>
                          </div>
                        </td>
                      </tr>
                    ) : selectedOrder.items &&
                      selectedOrder.items.length > 0 ? (
                      selectedOrder.items.map((item, index) => (
                        <tr
                          key={index}
                          className="hover:bg-slate-50 transition-colors"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-linear-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center">
                                <svg
                                  className="w-5 h-5 text-slate-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                                  />
                                </svg>
                              </div>
                              <span className="font-medium text-gray-900">
                                {item.title}
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-center">
                            <span className="px-3 py-1 bg-slate-100 rounded-lg text-sm font-medium text-gray-700">
                              {item.quantity}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right text-gray-600">
                            {formatAsCurrency(item.price)}
                          </td>
                          <td className="px-5 py-4 text-right font-semibold text-gray-900">
                            {formatAsCurrency(item.price * item.quantity)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-5 py-8 text-center text-gray-500 italic"
                        >
                          No items found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Order Summary */}
              <div className="bg-linear-to-br from-slate-50 to-emerald-50/30 rounded-2xl p-5 border border-slate-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-emerald-100 rounded-xl">
                    <svg
                      className="w-5 h-5 text-emerald-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900">Order Summary</h3>
                </div>
                {modalLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-6 h-6 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <div className="max-w-xs ml-auto space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium text-gray-900">
                        {formatAsCurrency(selectedOrder.subtotal)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 flex items-center gap-2">
                        Shipping
                        {selectedOrder.shippingCost === 0 && (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-lg">
                            FREE
                          </span>
                        )}
                      </span>
                      <span className="font-medium text-gray-900">
                        {selectedOrder.shippingCost === 0
                          ? "Free"
                          : formatAsCurrency(selectedOrder.shippingCost)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tax</span>
                      <span className="font-medium text-gray-900">
                        {formatAsCurrency(selectedOrder.tax)}
                      </span>
                    </div>
                    <div className="border-t-2 border-dashed border-slate-200 pt-3 mt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-gray-900">
                          Total
                        </span>
                        <span className="text-2xl font-bold text-cyan-600">
                          {formatAsCurrency(selectedOrder.totalAmount)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Timeline */}
              <div className="bg-linear-to-br from-slate-50 to-indigo-50/30 rounded-2xl p-5 border border-slate-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-indigo-100 rounded-xl">
                    <svg
                      className="w-5 h-5 text-indigo-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900">
                    Order Timeline
                  </h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  <div className="bg-white rounded-xl p-3 border border-slate-100">
                    <p className="text-xs text-gray-500 mb-1">Created</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {formatDate(selectedOrder.createdAt)}
                    </p>
                  </div>
                  {selectedOrder.paidAt && (
                    <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
                      <p className="text-xs text-emerald-600 mb-1">Paid</p>
                      <p className="text-sm font-semibold text-emerald-700">
                        {formatDate(selectedOrder.paidAt)}
                      </p>
                    </div>
                  )}
                  {selectedOrder.confirmedAt && (
                    <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                      <p className="text-xs text-blue-600 mb-1">Confirmed</p>
                      <p className="text-sm font-semibold text-blue-700">
                        {formatDate(selectedOrder.confirmedAt)}
                      </p>
                    </div>
                  )}
                  {selectedOrder.processingAt && (
                    <div className="bg-purple-50 rounded-xl p-3 border border-purple-100">
                      <p className="text-xs text-purple-600 mb-1">Processing</p>
                      <p className="text-sm font-semibold text-purple-700">
                        {formatDate(selectedOrder.processingAt)}
                      </p>
                    </div>
                  )}
                  {selectedOrder.shippedAt && (
                    <div className="bg-indigo-50 rounded-xl p-3 border border-indigo-100">
                      <p className="text-xs text-indigo-600 mb-1">Shipped</p>
                      <p className="text-sm font-semibold text-indigo-700">
                        {formatDate(selectedOrder.shippedAt)}
                      </p>
                    </div>
                  )}
                  {selectedOrder.deliveredAt && (
                    <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
                      <p className="text-xs text-emerald-600 mb-1">Delivered</p>
                      <p className="text-sm font-semibold text-emerald-700">
                        {formatDate(selectedOrder.deliveredAt)}
                      </p>
                    </div>
                  )}
                  {selectedOrder.cancelledAt && (
                    <div className="bg-red-50 rounded-xl p-3 border border-red-100">
                      <p className="text-xs text-red-600 mb-1">Cancelled</p>
                      <p className="text-sm font-semibold text-red-700">
                        {formatDate(selectedOrder.cancelledAt)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              {selectedOrder.notes && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-amber-100 rounded-xl">
                      <svg
                        className="w-5 h-5 text-amber-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-amber-800">
                      Order Notes
                    </h3>
                  </div>
                  <p className="text-amber-700">{selectedOrder.notes}</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-100 bg-linear-to-r from-slate-50 to-transparent flex justify-end gap-3">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-6 py-3 bg-slate-100 text-gray-700 rounded-xl hover:bg-slate-200 transition-all font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
