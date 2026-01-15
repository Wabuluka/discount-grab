import { Router } from "express";
import * as CartController from "../controllers/cart.controller";
import { auth } from "../middleware/auth";

const cartRouter = Router();

cartRouter.use(auth);

cartRouter.get("/", CartController.getCart);
cartRouter.post("/add", CartController.addToCart);
cartRouter.put("/item/:productId", CartController.updateCartItem);
cartRouter.delete("/item/:productId", CartController.removeFromCart);
cartRouter.delete("/clear", CartController.clearCart);

export default cartRouter;
