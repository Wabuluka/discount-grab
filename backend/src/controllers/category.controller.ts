import { NextFunction, Request, Response } from "express";
import { AppError, ErrorCode } from "../middleware/errorHandler";
import * as CategoryService from "../service/category.service";

export const create = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const category = await CategoryService.createCategory(req.body);
    res.status(201).json({ data: category });
  } catch (err: any) {
    if (err.code === 11000) {
      next(new AppError("Category with this slug already exists", ErrorCode.SLUG_EXISTS));
    } else {
      next(err);
    }
  }
};

export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, parent, active } = req.query;
    const filter: any = {};

    if (parent === "null" || parent === "") {
      filter.parent = null;
    } else if (parent) {
      filter.parent = String(parent);
    }

    if (active !== undefined) {
      filter.isActive = active === "true";
    }

    const result = await CategoryService.findCategories(filter, {
      page: Number(page) || 1,
      limit: Number(limit) || 100,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const tree = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await CategoryService.getCategoryTree();
    res.json({ data: categories });
  } catch (err) {
    next(err);
  }
};

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = await CategoryService.findCategoryById(req.params.id);
    res.json({ data: category });
  } catch (err) {
    next(err);
  }
};

export const getBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const category = await CategoryService.findCategoryBySlug(req.params.slug);
    res.json({ data: category });
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
    const category = await CategoryService.updateCategory(
      req.params.id,
      req.body
    );
    res.json({ data: category });
  } catch (err: any) {
    if (err.code === 11000) {
      next(new AppError("Category with this slug already exists", ErrorCode.SLUG_EXISTS));
    } else {
      next(err);
    }
  }
};

export const remove = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await CategoryService.deleteCategory(req.params.id);
    res.status(204).send();
  } catch (err: any) {
    if (err.message === "Cannot delete category with subcategories") {
      next(new AppError(err.message, ErrorCode.BUSINESS_ERROR));
    } else {
      next(err);
    }
  }
};

export const subcategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const subs = await CategoryService.getSubcategories(req.params.id);
    res.json({ data: subs });
  } catch (err) {
    next(err);
  }
};
