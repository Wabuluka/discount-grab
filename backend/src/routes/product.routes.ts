import { Router } from "express";
import * as ProductController from "../controllers/product.controller";
import { auth, isAdmin } from "../middleware/auth";

const productRouter = Router();

productRouter.get("/", ProductController.list);
productRouter.get("/:id", ProductController.get);

productRouter.post("/", auth, isAdmin, ProductController.create);
productRouter.put("/:id", auth, isAdmin, ProductController.update);
productRouter.delete("/:id", auth, isAdmin, ProductController.remove);

export default productRouter;
