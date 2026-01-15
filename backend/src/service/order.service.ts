import crypto from "crypto";
import { AppError } from "../middleware/errorHandler";
import Cart from "../models/Cart";
import Order, { IOrder, IShippingAddress } from "../models/Order";
import Product from "../models/Product";

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
): Promise<IOrder> => {
  const cart = await Cart.findOne({ user: userId }).populate("items.product");
  if (!cart || cart.items.length === 0) {
    throw new AppError("Cart is empty", 400);
  }

  const orderItems = [];
  for (const item of cart.items) {
    const product = await Product.findById(item.product);
    if (!product) {
      throw new AppError(`Product not found: ${item.product}`, 404);
    }
    if (product.stock < item.quantity) {
      throw new AppError(`Insufficient stock for ${product.title}`, 400);
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

  return order;
};

export const getOrderById = async (
  userId: string,
  orderId: string
): Promise<IOrder> => {
  const order = await Order.findOne({ _id: orderId, user: userId });
  if (!order) throw new AppError("Order not found", 404);
  return order;
};

export const getOrderByNumber = async (
  userId: string,
  orderNumber: string
): Promise<IOrder> => {
  const order = await Order.findOne({ orderNumber, user: userId });
  if (!order) throw new AppError("Order not found", 404);
  return order;
};

export const getUserOrders = async (
  userId: string,
  page = 1,
  limit = 10
): Promise<{ orders: IOrder[]; total: number; pages: number }> => {
  const skip = (page - 1) * limit;
  const [orders, total] = await Promise.all([
    Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Order.countDocuments({ user: userId }),
  ]);

  return {
    orders,
    total,
    pages: Math.ceil(total / limit),
  };
};

export const cancelOrder = async (
  userId: string,
  orderId: string
): Promise<IOrder> => {
  const order = await Order.findOne({ _id: orderId, user: userId });
  if (!order) throw new AppError("Order not found", 404);

  if (!["pending", "confirmed"].includes(order.orderStatus)) {
    throw new AppError("Order cannot be cancelled at this stage", 400);
  }

  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: item.quantity },
    });
  }

  order.orderStatus = "cancelled";
  order.cancelledAt = new Date();
  await order.save();
  return order;
};

export const updateOrderStatus = async (
  orderId: string,
  status: IOrder["orderStatus"]
): Promise<IOrder> => {
  const order = await Order.findById(orderId);
  if (!order) throw new AppError("Order not found", 404);

  order.orderStatus = status;
  const now = new Date();

  // Set appropriate timestamp based on status
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
  return order;
};

export const updatePaymentStatus = async (
  orderId: string,
  status: IOrder["paymentStatus"]
): Promise<IOrder> => {
  const order = await Order.findById(orderId);
  if (!order) throw new AppError("Order not found", 404);

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
  return order;
};

export const getAllOrders = async (
  page = 1,
  limit = 20,
  status?: string
): Promise<{ orders: IOrder[]; total: number; pages: number }> => {
  const skip = (page - 1) * limit;
  const query = status ? { orderStatus: status } : {};

  const [orders, total] = await Promise.all([
    Order.find(query)
      .populate("user", "email name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Order.countDocuments(query),
  ]);

  return {
    orders,
    total,
    pages: Math.ceil(total / limit),
  };
};
