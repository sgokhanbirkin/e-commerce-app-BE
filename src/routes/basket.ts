import { Router } from "express";
import * as basketController from "../controllers/basketController";
import { authMiddleware } from "../middleware/authMiddleware";
import { asyncHandler } from "../middleware/asyncHandler";

const router = Router();

/**
 * @swagger
 * /api/basket:
 *   get:
 *     summary: Kullanıcının sepetini getirir
 *     tags:
 *       - Basket
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sepet içeriği
 */
router.get("/", authMiddleware, asyncHandler(basketController.list));

/**
 * @swagger
 * /api/basket:
 *   post:
 *     summary: Sepete ürün ekler
 *     tags:
 *       - Basket
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
 *         description: Sepete eklendi
 */
router.post("/", authMiddleware, asyncHandler(basketController.add));

/**
 * @swagger
 * /api/basket:
 *   delete:
 *     summary: Tüm sepeti temizler
 *     tags:
 *       - Basket
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: Sepet temizlendi
 */
router.delete("/", authMiddleware, asyncHandler(basketController.clearCart));

/**
 * @swagger
 * /api/basket/{id}:
 *   delete:
 *     summary: Sepetten ürün siler
 *     tags:
 *       - Basket
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Sepetten silindi
 */
router.delete("/:id", authMiddleware, asyncHandler(basketController.remove));

export default router;
