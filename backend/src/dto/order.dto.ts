/**
 * Order DTOs
 */

import { IOrder, IOrderItem, IShippingAddress } from "../models/Order";
import { UserPublicDTO, toUserPublicDTO } from "./user.dto";

// Shipping address DTO (masks phone number partially for privacy)
export interface ShippingAddressDTO {
  fullName: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  phone?: string;
}

// Order item DTO
export interface OrderItemDTO {
  productId: string;
  title: string;
  quantity: number;
  price: number;
  subtotal: number;
}

// Order DTO (for order owner)
export interface OrderDTO {
  id: string;
  orderNumber: string;
  items: OrderItemDTO[];
  shippingAddress: ShippingAddressDTO;
  paymentMethod: "card" | "cash_on_delivery";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  orderStatus: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
  subtotal: number;
  shippingCost: number;
  tax: number;
  totalAmount: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  // Status timestamps
  paidAt?: string;
  confirmedAt?: string;
  processingAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
}

// Order list item DTO (summary for lists)
export interface OrderListItemDTO {
  id: string;
  orderNumber: string;
  itemCount: number;
  totalAmount: number;
  paymentStatus: string;
  orderStatus: string;
  createdAt: string;
}

// Admin order DTO (includes user info)
export interface AdminOrderDTO extends OrderDTO {
  user: UserPublicDTO;
}

// Admin order list item DTO
export interface AdminOrderListItemDTO extends OrderListItemDTO {
  user: UserPublicDTO;
}

/**
 * Transform shipping address to DTO
 * Optionally masks phone number for privacy
 */
export function toShippingAddressDTO(
  address: IShippingAddress | any,
  maskPhone = false
): ShippingAddressDTO {
  const dto: ShippingAddressDTO = {
    fullName: address.fullName,
    address: address.address,
    city: address.city,
    postalCode: address.postalCode,
    country: address.country,
  };

  if (address.phone) {
    if (maskPhone && address.phone.length > 4) {
      // Mask phone: show only last 4 digits
      dto.phone = "*".repeat(address.phone.length - 4) + address.phone.slice(-4);
    } else {
      dto.phone = address.phone;
    }
  }

  return dto;
}

/**
 * Transform an order item to OrderItemDTO
 */
export function toOrderItemDTO(item: IOrderItem | any): OrderItemDTO {
  return {
    productId: item.product?.toString() || item.productId,
    title: item.title,
    quantity: item.quantity,
    price: item.price,
    subtotal: item.price * item.quantity,
  };
}

/**
 * Transform an Order document to OrderDTO
 */
export function toOrderDTO(order: IOrder | any): OrderDTO {
  const dto: OrderDTO = {
    id: order._id?.toString() || order.id,
    orderNumber: order.orderNumber,
    items: (order.items || []).map(toOrderItemDTO),
    shippingAddress: toShippingAddressDTO(order.shippingAddress),
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    orderStatus: order.orderStatus,
    subtotal: order.subtotal,
    shippingCost: order.shippingCost,
    tax: order.tax,
    totalAmount: order.totalAmount,
    createdAt: new Date(order.createdAt).toISOString(),
    updatedAt: new Date(order.updatedAt).toISOString(),
  };

  // Include notes if present
  if (order.notes) dto.notes = order.notes;

  // Include status timestamps if present
  if (order.paidAt) dto.paidAt = new Date(order.paidAt).toISOString();
  if (order.confirmedAt) dto.confirmedAt = new Date(order.confirmedAt).toISOString();
  if (order.processingAt) dto.processingAt = new Date(order.processingAt).toISOString();
  if (order.shippedAt) dto.shippedAt = new Date(order.shippedAt).toISOString();
  if (order.deliveredAt) dto.deliveredAt = new Date(order.deliveredAt).toISOString();
  if (order.cancelledAt) dto.cancelledAt = new Date(order.cancelledAt).toISOString();

  return dto;
}

/**
 * Transform an Order document to OrderListItemDTO (summary)
 */
export function toOrderListItemDTO(order: IOrder | any): OrderListItemDTO {
  const itemCount = (order.items || []).reduce(
    (sum: number, item: any) => sum + (item.quantity || 0),
    0
  );

  return {
    id: order._id?.toString() || order.id,
    orderNumber: order.orderNumber,
    itemCount,
    totalAmount: order.totalAmount,
    paymentStatus: order.paymentStatus,
    orderStatus: order.orderStatus,
    createdAt: new Date(order.createdAt).toISOString(),
  };
}

/**
 * Transform an Order document to AdminOrderDTO (includes user)
 */
export function toAdminOrderDTO(order: IOrder | any): AdminOrderDTO {
  const baseDTO = toOrderDTO(order);

  let user: UserPublicDTO;
  if (order.user && typeof order.user === "object" && order.user.email) {
    user = toUserPublicDTO(order.user);
  } else {
    user = {
      id: order.user?.toString() || "unknown",
      name: "Unknown",
      email: "unknown",
    };
  }

  return {
    ...baseDTO,
    user,
  };
}

/**
 * Transform an Order document to AdminOrderListItemDTO
 */
export function toAdminOrderListItemDTO(order: IOrder | any): AdminOrderListItemDTO {
  const baseDTO = toOrderListItemDTO(order);

  let user: UserPublicDTO;
  if (order.user && typeof order.user === "object" && order.user.email) {
    user = toUserPublicDTO(order.user);
  } else {
    user = {
      id: order.user?.toString() || "unknown",
      name: "Unknown",
      email: "unknown",
    };
  }

  return {
    ...baseDTO,
    user,
  };
}

/**
 * Transform array of orders to list DTOs
 */
export function toOrderListDTO(orders: (IOrder | any)[]): OrderListItemDTO[] {
  return orders.map(toOrderListItemDTO);
}

/**
 * Transform array of orders to admin list DTOs
 */
export function toAdminOrderListDTO(orders: (IOrder | any)[]): AdminOrderListItemDTO[] {
  return orders.map(toAdminOrderListItemDTO);
}
