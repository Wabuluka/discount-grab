import { Types } from "mongoose";
import { AppError, ErrorCode } from "../middleware/errorHandler";
import Cart from "../models/Cart";
import Product from "../models/Product";
import { CartDTO, toCartDTO } from "../dto";

export const getCart = async (userId: string): Promise<CartDTO> => {
  let cart = await Cart.findOne({ user: userId }).populate("items.product", "title images stock");
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [], totalAmount: 0 });
  }
  return toCartDTO(cart);
};

export const addToCart = async (
  userId: string,
  productId: string,
  quantity: number
): Promise<CartDTO> => {
  const product = await Product.findById(productId);
  if (!product) {
    throw new AppError("Product not found", ErrorCode.PRODUCT_NOT_FOUND);
  }
  if (product.stock < quantity) {
    throw new AppError(
      `Only ${product.stock} items available in stock`,
      ErrorCode.INSUFFICIENT_STOCK
    );
  }

  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [], totalAmount: 0 });
  }

  const existingItemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId
  );

  if (existingItemIndex >= 0) {
    const newQty = cart.items[existingItemIndex].quantity + quantity;
    if (product.stock < newQty) {
      throw new AppError(
        `Cannot add ${quantity} more. Only ${product.stock - cart.items[existingItemIndex].quantity} additional items available`,
        ErrorCode.INSUFFICIENT_STOCK
      );
    }
    cart.items[existingItemIndex].quantity = newQty;
    cart.items[existingItemIndex].price = product.price;
  } else {
    cart.items.push({
      product: product._id as Types.ObjectId,
      quantity,
      price: product.price,
    });
  }

  cart.totalAmount = cart.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  await cart.save();
  const populatedCart = await cart.populate("items.product", "title images stock");
  return toCartDTO(populatedCart);
};

export const updateCartItem = async (
  userId: string,
  productId: string,
  quantity: number
): Promise<CartDTO> => {
  if (quantity < 1) {
    throw new AppError("Quantity must be at least 1", ErrorCode.INVALID_QUANTITY);
  }

  const product = await Product.findById(productId);
  if (!product) {
    throw new AppError("Product not found", ErrorCode.PRODUCT_NOT_FOUND);
  }
  if (product.stock < quantity) {
    throw new AppError(
      `Only ${product.stock} items available in stock`,
      ErrorCode.INSUFFICIENT_STOCK
    );
  }

  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    throw new AppError("Cart not found", ErrorCode.CART_NOT_FOUND);
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId
  );

  if (itemIndex < 0) {
    throw new AppError("Item not found in cart", ErrorCode.NOT_FOUND);
  }

  cart.items[itemIndex].quantity = quantity;
  cart.items[itemIndex].price = product.price;

  cart.totalAmount = cart.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  await cart.save();
  const populatedCart = await cart.populate("items.product", "title images stock");
  return toCartDTO(populatedCart);
};

export const removeFromCart = async (
  userId: string,
  productId: string
): Promise<CartDTO> => {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    throw new AppError("Cart not found", ErrorCode.CART_NOT_FOUND);
  }

  cart.items = cart.items.filter(
    (item) => item.product.toString() !== productId
  );

  cart.totalAmount = cart.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  await cart.save();
  const populatedCart = await cart.populate("items.product", "title images stock");
  return toCartDTO(populatedCart);
};

export const clearCart = async (userId: string): Promise<CartDTO> => {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    throw new AppError("Cart not found", ErrorCode.CART_NOT_FOUND);
  }

  cart.items = [];
  cart.totalAmount = 0;

  await cart.save();
  return toCartDTO(cart);
};
