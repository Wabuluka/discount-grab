import { NextFunction, Request, Response } from "express";
import { AppError, ErrorCode } from "../middleware/errorHandler";
import * as HeroSlideService from "../service/heroSlide.service";

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const slide = await HeroSlideService.createHeroSlide(req.body);
    res.status(201).json({ data: slide });
  } catch (err) {
    next(err);
  }
};

export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { activeOnly } = req.query;
    const result = await HeroSlideService.findAllHeroSlides({
      activeOnly: activeOnly === "true",
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const listActive = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const slides = await HeroSlideService.findActiveHeroSlides();
    res.json({ slides });
  } catch (err) {
    next(err);
  }
};

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const slide = await HeroSlideService.findHeroSlideById(req.params.id);
    if (!slide) {
      throw new AppError("Hero slide not found", ErrorCode.NOT_FOUND);
    }
    res.json({ data: slide });
  } catch (err) {
    next(err);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const slide = await HeroSlideService.updateHeroSlide(req.params.id, req.body);
    if (!slide) {
      throw new AppError("Hero slide not found", ErrorCode.NOT_FOUND);
    }
    res.json({ data: slide });
  } catch (err) {
    next(err);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deleted = await HeroSlideService.deleteHeroSlide(req.params.id);
    if (!deleted) {
      throw new AppError("Hero slide not found", ErrorCode.NOT_FOUND);
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export const reorder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds)) {
      throw new AppError("orderedIds must be an array", ErrorCode.VALIDATION_ERROR);
    }
    const slides = await HeroSlideService.reorderHeroSlides(orderedIds);
    res.json({ slides });
  } catch (err) {
    next(err);
  }
};

export const toggleActive = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const slide = await HeroSlideService.toggleHeroSlideActive(req.params.id);
    if (!slide) {
      throw new AppError("Hero slide not found", ErrorCode.NOT_FOUND);
    }
    res.json({ data: slide });
  } catch (err) {
    next(err);
  }
};
