import { Router } from "express";
import * as ctrl from "../controllers/auth.controller";
import { auth } from "../middleware/auth";
import { authLimiter } from "../middleware/rateLimiter";
import { validateBody } from "../middleware/validate";
import { loginSchema, registerSchema } from "../validators/auth";

const authRouter = Router();

authRouter.post("/register", authLimiter, validateBody(registerSchema), ctrl.register);
authRouter.post("/login", authLimiter, validateBody(loginSchema), ctrl.login);
authRouter.post("/logout", ctrl.logout);
authRouter.get("/me", auth, ctrl.me);
authRouter.post("/refresh", auth, ctrl.refresh);

export default authRouter;
