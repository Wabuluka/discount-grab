import { NextFunction, Request, Response } from "express";
import * as orderService from "../service/order.service";

export const createOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { shippingAddress, paymentMethod, notes } = req.body;
    const order = await orderService.createOrder(
      req.user!.id,
      shippingAddress,
      paymentMethod,
      notes
    );
    res.status(201).json({ order });
  } catch (err) {
    next(err);
  }
};

export const getOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const order = await orderService.getOrderById(req.user!.id, id);
    res.json({ order });
  } catch (err) {
    next(err);
  }
};

export const getOrderByNumber = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { orderNumber } = req.params;
    const order = await orderService.getOrderByNumber(req.user!.id, orderNumber);
    res.json({ order });
  } catch (err) {
    next(err);
  }
};

export const getUserOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const result = await orderService.getUserOrders(req.user!.id, page, limit);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const cancelOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const order = await orderService.cancelOrder(req.user!.id, id);
    res.json({ order });
  } catch (err) {
    next(err);
  }
};

export const updateOrderStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const order = await orderService.updateOrderStatus(id, status);
    res.json({ order });
  } catch (err) {
    next(err);
  }
};

export const updatePaymentStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const order = await orderService.updatePaymentStatus(id, status);
    res.json({ order });
  } catch (err) {
    next(err);
  }
};

export const getAllOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as string | undefined;
    const result = await orderService.getAllOrders(page, limit, status);
    res.json(result);
  } catch (err) {
    next(err);
  }
};
