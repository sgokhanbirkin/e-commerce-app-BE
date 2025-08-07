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

const updateQuantitySchema = z.object({
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 productId:
 *                   type: string
 *                 quantity:
 *                   type: integer
 *                 product:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     title:
 *                       type: string
 *                     description:
 *                       type: string
 *                     imageUrl:
 *                       type: string
 *                     price:
 *                       type: number
 *                 variantId:
 *                   type: string
 *       400:
 *         description: Geçersiz veri veya yetersiz stok
 *       404:
 *         description: Variant bulunamadı
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
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   productId:
 *                     type: string
 *                   quantity:
 *                     type: integer
 *                   product:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       title:
 *                         type: string
 *                       description:
 *                         type: string
 *                       imageUrl:
 *                         type: string
 *                       price:
 *                         type: number
 *                   variantId:
 *                     type: string
 */
router.get("/", authMiddleware, asyncHandler(cartController.listItems));

/**
 * @swagger
 * /api/cart:
 *   delete:
 *     summary: Sepeti tamamen temizler
 *     tags:
 *       - Cart
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: Sepet başarıyla temizlendi
 */
router.delete("/", authMiddleware, asyncHandler(cartController.clearCartItems));

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

/**
 * @swagger
 * /api/cart/{itemId}:
 *   patch:
 *     summary: Sepet öğesi miktarını günceller
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *     responses:
 *       200:
 *         description: Miktar başarıyla güncellendi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 productId:
 *                   type: string
 *                 quantity:
 *                   type: integer
 *                 product:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     title:
 *                       type: string
 *                     description:
 *                       type: string
 *                     imageUrl:
 *                       type: string
 *                     price:
 *                       type: number
 *                 variantId:
 *                   type: string
 *       400:
 *         description: Geçersiz miktar veya yetersiz stok
 *       404:
 *         description: Sepet öğesi bulunamadı
 */
router.patch(
  "/:itemId",
  authMiddleware,
  validateBody(updateQuantitySchema),
  asyncHandler(cartController.updateItemQuantity)
);

export default router;
