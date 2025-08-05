import { Router } from "express";
import * as reviewController from "../controllers/reviewController";
import { authMiddleware } from "../middleware/authMiddleware";
import { asyncHandler } from "../middleware/asyncHandler";
import { z } from "zod";
import { validateBody } from "../middleware/validation";

const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
});

const router = Router();

/**
 * @swagger
 * /api/products/{id}/reviews:
 *   post:
 *     summary: Ürün için yorum ekler
 *     tags:
 *       - Reviews
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *     responses:
 *       201:
 *         description: Yorum oluşturuldu
 */
router.post(
  "/:id/reviews",
  authMiddleware,
  validateBody(reviewSchema),
  asyncHandler(reviewController.addReview)
);

/**
 * @swagger
 * /api/products/{id}/reviews:
 *   get:
 *     summary: Ürün yorumlarını listeler
 *     tags:
 *       - Reviews
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Yorum listesi
 */
router.get("/:id/reviews", asyncHandler(reviewController.listReviews));

export default router;
