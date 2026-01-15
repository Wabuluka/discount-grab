import { Router } from "express";
import * as CategoryController from "../controllers/category.controller";
import { auth, isAdmin } from "../middleware/auth";

const categoryRouter = Router();

// Public routes
categoryRouter.get("/", CategoryController.list);
categoryRouter.get("/tree", CategoryController.tree);
categoryRouter.get("/slug/:slug", CategoryController.getBySlug);
categoryRouter.get("/:id", CategoryController.get);
categoryRouter.get("/:id/subcategories", CategoryController.subcategories);

// Admin routes
categoryRouter.post("/", auth, isAdmin, CategoryController.create);
categoryRouter.put("/:id", auth, isAdmin, CategoryController.update);
categoryRouter.delete("/:id", auth, isAdmin, CategoryController.remove);

export default categoryRouter;
