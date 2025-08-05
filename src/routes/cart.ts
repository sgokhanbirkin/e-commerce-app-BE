import { Router } from "express";
import * as cartController from "../controllers/cartController";
import { authMiddleware } from "../middleware/authMiddleware";
import { asyncHandler } from "../middleware/asyncHandler";
import { z } from "zod";
import { validateBody } from "../middleware/validation";

const cartItemSchema = z.object({
  variantId: z.number().int().positive(),
  quantity: z.number().int().positive(),
});

const router = Router();

/**
 * @swagger
 * /api/cart:
 *   post:
 *     summary: Sepete ürün ekler
 *     tags:
 *       - Cart
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               variantId:
 *                 type: integer
 *               quantity:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Ürün sepete eklendi
 */
router.post(
  "/",
  authMiddleware,
  validateBody(cartItemSchema),
  asyncHandler(cartController.addItem)
);

/**
 * @swagger
 * /api/cart:
 *   get:
 *     summary: Sepet içeriğini getirir
 *     tags:
 *       - Cart
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sepet içeriği
 */
router.get("/", authMiddleware, asyncHandler(cartController.listItems));

/**
 * @swagger
 * /api/cart/{itemId}:
 *   delete:
 *     summary: Sepetten ürün siler
 *     tags:
 *       - Cart
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Ürün sepetten silindi
 */
router.delete(
  "/:itemId",
  authMiddleware,
  asyncHandler(cartController.removeItem)
);

export default router;
