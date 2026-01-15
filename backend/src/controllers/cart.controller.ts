import { NextFunction, Request, Response } from "express";
import * as cartService from "../service/cart.service";

export const getCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const cart = await cartService.getCart(req.user!.id);
    res.json({ cart });
  } catch (err) {
    next(err);
  }
};

export const addToCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const cart = await cartService.addToCart(req.user!.id, productId, quantity);
    res.json({ cart });
  } catch (err) {
    next(err);
  }
};

export const updateCartItem = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    const cart = await cartService.updateCartItem(req.user!.id, productId, quantity);
    res.json({ cart });
  } catch (err) {
    next(err);
  }
};

export const removeFromCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { productId } = req.params;
    const cart = await cartService.removeFromCart(req.user!.id, productId);
    res.json({ cart });
  } catch (err) {
    next(err);
  }
};

export const clearCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const cart = await cartService.clearCart(req.user!.id);
    res.json({ cart });
  } catch (err) {
    next(err);
  }
};
