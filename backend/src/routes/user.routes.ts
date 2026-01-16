import { Router } from "express";
import { auth, isAdmin } from "../middleware/auth";
import * as userController from "../controllers/user.controller";

const router = Router();

// All routes require admin authentication
router.use(auth, isAdmin);

// GET /api/users - Get all users with pagination and filters
router.get("/", userController.getAllUsers);

// GET /api/users/stats - Get user statistics
router.get("/stats", userController.getUserStats);

// GET /api/users/:id - Get a single user by ID
router.get("/:id", userController.getUserById);

export default router;
