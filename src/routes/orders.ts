import { Router } from "express";
import * as orderController from "../controllers/orderController";
import { authMiddleware } from "../middleware/authMiddleware";
import { asyncHandler } from "../middleware/asyncHandler";
import { z } from "zod";
import { validateBody } from "../middleware/validation";

const orderSchema = z.object({
  addressId: z.number().int().positive(),
});

const router = Router();

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Yeni sipariş oluşturur
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               addressId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Sipariş oluşturuldu
 */
router.post(
  "/",
  authMiddleware,
  validateBody(orderSchema),
  asyncHandler(orderController.create)
);

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Sipariş detayını getirir
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Sipariş detayı
 *       404:
 *         description: Sipariş bulunamadı
 */
router.get("/:id", authMiddleware, asyncHandler(orderController.getById));

/**
 * @swagger
 * /api/users/me/orders:
 *   get:
 *     summary: Kullanıcının sipariş geçmişini getirir
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sipariş geçmişi
 */
router.get(
  "/users/me/orders",
  authMiddleware,
  asyncHandler(orderController.getUserOrderHistory)
);

export default router;
