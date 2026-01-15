import { Types } from "mongoose";
import { AppError } from "../middleware/errorHandler";
import Cart, { ICart } from "../models/Cart";
import Product from "../models/Product";

export const getCart = async (userId: string): Promise<ICart> => {
  let cart = await Cart.findOne({ user: userId }).populate("items.product", "title images stock");
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [], totalAmount: 0 });
  }
  return cart;
};

export const addToCart = async (
  userId: string,
  productId: string,
  quantity: number
): Promise<ICart> => {
  const product = await Product.findById(productId);
  if (!product) throw new AppError("Product not found", 404);
  if (product.stock < quantity) throw new AppError("Insufficient stock", 400);

  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [], totalAmount: 0 });
  }

  const existingItemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId
  );

  if (existingItemIndex >= 0) {
    const newQty = cart.items[existingItemIndex].quantity + quantity;
    if (product.stock < newQty) throw new AppError("Insufficient stock", 400);
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
  return cart.populate("items.product", "title images stock");
};

export const updateCartItem = async (
  userId: string,
  productId: string,
  quantity: number
): Promise<ICart> => {
  if (quantity < 1) throw new AppError("Quantity must be at least 1", 400);

  const product = await Product.findById(productId);
  if (!product) throw new AppError("Product not found", 404);
  if (product.stock < quantity) throw new AppError("Insufficient stock", 400);

  const cart = await Cart.findOne({ user: userId });
  if (!cart) throw new AppError("Cart not found", 404);

  const itemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId
  );

  if (itemIndex < 0) throw new AppError("Item not in cart", 404);

  cart.items[itemIndex].quantity = quantity;
  cart.items[itemIndex].price = product.price;

  cart.totalAmount = cart.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  await cart.save();
  return cart.populate("items.product", "title images stock");
};

export const removeFromCart = async (
  userId: string,
  productId: string
): Promise<ICart> => {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) throw new AppError("Cart not found", 404);

  cart.items = cart.items.filter(
    (item) => item.product.toString() !== productId
  );

  cart.totalAmount = cart.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  await cart.save();
  return cart.populate("items.product", "title images stock");
};

export const clearCart = async (userId: string): Promise<ICart> => {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) throw new AppError("Cart not found", 404);

  cart.items = [];
  cart.totalAmount = 0;

  await cart.save();
  return cart;
};
