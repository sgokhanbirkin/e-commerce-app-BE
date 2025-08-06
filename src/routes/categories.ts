import { Router } from "express";
import * as categoryController from "../controllers/categoryController";
import { asyncHandler } from "../middleware/asyncHandler";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Category management endpoints
 */

router.get("/", asyncHandler(categoryController.getAllCategories));
router.get(
  "/:categoryId/products",
  asyncHandler(categoryController.getProductsByCategory)
);

export default router;
