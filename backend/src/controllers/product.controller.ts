import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { AppError, ErrorCode } from "../middleware/errorHandler";
import * as ProductService from "../service/product.service";
import Category from "../models/Category";

export const create = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const product = await ProductService.createProduct(req.body);
    res.status(201).json({ data: product });
  } catch (err) {
    next(err);
  }
};

export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, q, category } = req.query;
    const filter: any = {};
    if (q) filter.$text = { $search: String(q) };
    if (category) {
      const categoryStr = String(category);
      // Check if it's a valid ObjectId
      if (mongoose.Types.ObjectId.isValid(categoryStr)) {
        filter.category = categoryStr;
      } else {
        // Try to find category by slug or name
        const cat = await Category.findOne({
          $or: [{ slug: categoryStr.toLowerCase() }, { name: categoryStr }],
        });
        if (cat) {
          filter.category = cat._id;
        } else {
          // Return empty results if category not found
          return res.json({ products: [], total: 0, page: 1, limit: 20 });
        }
      }
    }
    const result = await ProductService.findProducts(filter, {
      page: Number(page) || 1,
      limit: Number(limit) || 20,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await ProductService.findProductById(req.params.id);
    if (!product) {
      throw new AppError("Product not found", ErrorCode.PRODUCT_NOT_FOUND);
    }
    res.json({ data: product });
  } catch (err) {
    next(err);
  }
};

export const update = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const product = await ProductService.updateProduct(req.params.id, req.body);
    if (!product) {
      throw new AppError("Product not found", ErrorCode.PRODUCT_NOT_FOUND);
    }
    res.json({ data: product });
  } catch (err) {
    next(err);
  }
};

export const remove = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const deleted = await ProductService.deleteProduct(req.params.id);
    if (!deleted) {
      throw new AppError("Product not found", ErrorCode.PRODUCT_NOT_FOUND);
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
