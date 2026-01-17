/**
 * Cart DTOs
 */

import { ICart, ICartItem } from "../models/Cart";
import { CartProductDTO, toCartProductDTO } from "./product.dto";

// Cart item DTO
export interface CartItemDTO {
  product: CartProductDTO;
  quantity: number;
  price: number;
  subtotal: number;
}

// Full cart DTO
export interface CartDTO {
  id: string;
  items: CartItemDTO[];
  totalAmount: number;
  itemCount: number;
  updatedAt: string;
}

/**
 * Transform a cart item to CartItemDTO
 */
export function toCartItemDTO(item: ICartItem | any): CartItemDTO {
  const product =
    typeof item.product === "object"
      ? toCartProductDTO(item.product)
      : { id: item.product.toString(), title: "", images: [], stock: 0 };

  return {
    product,
    quantity: item.quantity,
    price: item.price,
    subtotal: item.price * item.quantity,
  };
}

/**
 * Transform a Cart document to CartDTO
 */
export function toCartDTO(cart: ICart | any): CartDTO {
  const items = (cart.items || []).map(toCartItemDTO);
  const itemCount = items.reduce((sum: number, item: CartItemDTO) => sum + item.quantity, 0);

  return {
    id: cart._id?.toString?.() || cart._id || cart.id || "",
    items,
    totalAmount: cart.totalAmount || 0,
    itemCount,
    updatedAt: new Date(cart.updatedAt).toISOString(),
  };
}
