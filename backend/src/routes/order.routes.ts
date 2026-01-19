import { Router } from "express";
import * as OrderController from "../controllers/order.controller";
import { auth, isAdmin } from "../middleware/auth";

const orderRouter = Router();

orderRouter.use(auth);

orderRouter.post("/", OrderController.createOrder);
orderRouter.get("/", OrderController.getUserOrders);
orderRouter.get("/:id", OrderController.getOrder);
orderRouter.get("/number/:orderNumber", OrderController.getOrderByNumber);
orderRouter.post("/:id/cancel", OrderController.cancelOrder);

orderRouter.get("/admin/all", isAdmin, OrderController.getAllOrders);
orderRouter.get("/admin/:id", isAdmin, OrderController.getAdminOrderById);
orderRouter.put("/admin/:id/status", isAdmin, OrderController.updateOrderStatus);
orderRouter.put("/admin/:id/payment", isAdmin, OrderController.updatePaymentStatus);

export default orderRouter;
