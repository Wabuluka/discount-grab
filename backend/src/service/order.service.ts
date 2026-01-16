import crypto from "crypto";
import { AppError, ErrorCode } from "../middleware/errorHandler";
import Cart from "../models/Cart";
import Order, { IOrder, IShippingAddress } from "../models/Order";
import Product from "../models/Product";
import {
  OrderDTO,
  OrderListItemDTO,
  AdminOrderDTO,
  AdminOrderListItemDTO,
  toOrderDTO,
  toOrderListDTO,
  toAdminOrderDTO,
  toAdminOrderListDTO,
} from "../dto";

const generateOrderNumber = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `ORD-${timestamp}-${random}`;
};

export const createOrder = async (
  userId: string,
  shippingAddress: IShippingAddress,
  paymentMethod: "card" | "cash_on_delivery",
  notes?: string
): Promise<OrderDTO> => {
  const cart = await Cart.findOne({ user: userId }).populate("items.product");
  if (!cart || cart.items.length === 0) {
    throw new AppError("Your cart is empty. Add items before placing an order", ErrorCode.CART_EMPTY);
  }

  const orderItems = [];
  for (const item of cart.items) {
    const product = await Product.findById(item.product);
    if (!product) {
      throw new AppError(
        `Product is no longer available: ${item.product}`,
        ErrorCode.PRODUCT_NOT_FOUND
      );
    }
    if (product.stock < item.quantity) {
      throw new AppError(
        `Insufficient stock for "${product.title}". Only ${product.stock} available`,
        ErrorCode.INSUFFICIENT_STOCK
      );
    }
    orderItems.push({
      product: product._id,
      title: product.title,
      quantity: item.quantity,
      price: item.price,
    });
  }

  const subtotal = orderItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shippingCost = subtotal > 100 ? 0 : 10;
  const tax = subtotal * 0.1;
  const totalAmount = subtotal + shippingCost + tax;

  const order = await Order.create({
    user: userId,
    orderNumber: generateOrderNumber(),
    items: orderItems,
    shippingAddress,
    paymentMethod,
    subtotal,
    shippingCost,
    tax,
    totalAmount,
    notes,
    paymentStatus: paymentMethod === "cash_on_delivery" ? "pending" : "pending",
    orderStatus: "pending",
  });

  for (const item of orderItems) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: -item.quantity },
    });
  }

  cart.items = [];
  cart.totalAmount = 0;
  await cart.save();

  return toOrderDTO(order);
};

export const getOrderById = async (
  userId: string,
  orderId: string
): Promise<OrderDTO> => {
  const order = await Order.findOne({ _id: orderId, user: userId });
  if (!order) {
    throw new AppError("Order not found", ErrorCode.ORDER_NOT_FOUND);
  }
  return toOrderDTO(order);
};

export const getOrderByNumber = async (
  userId: string,
  orderNumber: string
): Promise<OrderDTO> => {
  const order = await Order.findOne({ orderNumber, user: userId });
  if (!order) {
    throw new AppError("Order not found", ErrorCode.ORDER_NOT_FOUND);
  }
  return toOrderDTO(order);
};

export interface OrderListResult {
  orders: OrderListItemDTO[];
  total: number;
  pages: number;
}

export const getUserOrders = async (
  userId: string,
  page = 1,
  limit = 10
): Promise<OrderListResult> => {
  const skip = (page - 1) * limit;
  const [orders, total] = await Promise.all([
    Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Order.countDocuments({ user: userId }),
  ]);

  return {
    orders: toOrderListDTO(orders),
    total,
    pages: Math.ceil(total / limit),
  };
};

export const cancelOrder = async (
  userId: string,
  orderId: string
): Promise<OrderDTO> => {
  const order = await Order.findOne({ _id: orderId, user: userId });
  if (!order) {
    throw new AppError("Order not found", ErrorCode.ORDER_NOT_FOUND);
  }

  if (!["pending", "confirmed"].includes(order.orderStatus)) {
    throw new AppError(
      `Order cannot be cancelled. Current status: ${order.orderStatus}`,
      ErrorCode.ORDER_CANNOT_CANCEL
    );
  }

  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: item.quantity },
    });
  }

  order.orderStatus = "cancelled";
  order.cancelledAt = new Date();
  await order.save();
  return toOrderDTO(order);
};

export const updateOrderStatus = async (
  orderId: string,
  status: IOrder["orderStatus"]
): Promise<AdminOrderDTO> => {
  const order = await Order.findById(orderId).populate("user", "email name");
  if (!order) {
    throw new AppError("Order not found", ErrorCode.ORDER_NOT_FOUND);
  }

  order.orderStatus = status;
  const now = new Date();

  switch (status) {
    case "confirmed":
      order.confirmedAt = now;
      break;
    case "processing":
      order.processingAt = now;
      break;
    case "shipped":
      order.shippedAt = now;
      break;
    case "delivered":
      order.deliveredAt = now;
      break;
    case "cancelled":
      order.cancelledAt = now;
      break;
  }

  await order.save();
  return toAdminOrderDTO(order);
};

export const updatePaymentStatus = async (
  orderId: string,
  status: IOrder["paymentStatus"]
): Promise<AdminOrderDTO> => {
  const order = await Order.findById(orderId).populate("user", "email name");
  if (!order) {
    throw new AppError("Order not found", ErrorCode.ORDER_NOT_FOUND);
  }

  order.paymentStatus = status;
  const now = new Date();

  if (status === "paid") {
    order.paidAt = now;
    if (order.orderStatus === "pending") {
      order.orderStatus = "confirmed";
      order.confirmedAt = now;
    }
  }
  await order.save();
  return toAdminOrderDTO(order);
};

export interface AdminOrderListResult {
  orders: AdminOrderListItemDTO[];
  total: number;
  pages: number;
}

export const getAllOrders = async (
  page = 1,
  limit = 20,
  status?: string
): Promise<AdminOrderListResult> => {
  const skip = (page - 1) * limit;
  const query = status ? { orderStatus: status } : {};

  const [orders, total] = await Promise.all([
    Order.find(query)
      .populate("user", "email name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Order.countDocuments(query),
  ]);

  return {
    orders: toAdminOrderListDTO(orders),
    total,
    pages: Math.ceil(total / limit),
  };
};
