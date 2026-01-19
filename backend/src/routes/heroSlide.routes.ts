import { Router } from "express";
import * as HeroSlideController from "../controllers/heroSlide.controller";
import { auth, isAdmin } from "../middleware/auth";

const heroSlideRouter = Router();

// Public routes
heroSlideRouter.get("/active", HeroSlideController.listActive);

// Admin routes
heroSlideRouter.get("/", auth, isAdmin, HeroSlideController.list);
heroSlideRouter.get("/:id", auth, isAdmin, HeroSlideController.get);
heroSlideRouter.post("/", auth, isAdmin, HeroSlideController.create);
heroSlideRouter.put("/:id", auth, isAdmin, HeroSlideController.update);
heroSlideRouter.delete("/:id", auth, isAdmin, HeroSlideController.remove);
heroSlideRouter.post("/reorder", auth, isAdmin, HeroSlideController.reorder);
heroSlideRouter.patch("/:id/toggle-active", auth, isAdmin, HeroSlideController.toggleActive);

export default heroSlideRouter;
