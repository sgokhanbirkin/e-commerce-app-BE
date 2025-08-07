import { Router } from "express";
import * as orderController from "../controllers/orderController";
import { authMiddleware } from "../middleware/authMiddleware";
import { asyncHandler } from "../middleware/asyncHandler";
import { z } from "zod";
import { validateBody } from "../middleware/validation";

const cartItemSchema = z.object({
  variantId: z.number().int().positive(),
  quantity: z.number().int().positive(),
});

const addressSchema = z.object({
  label: z.string().min(1),
  line1: z.string().min(1),
  line2: z.string().optional(),
  city: z.string().min(1),
  postal: z.string().min(1),
  country: z.string().min(1),
  phone: z.string().optional(),
});

const paymentInfoSchema = z.object({
  method: z.string().min(1),
  cardNumber: z.string().optional(),
  expiryDate: z.string().optional(),
  cvv: z.string().optional(),
});

const orderSchema = z.object({
  items: z.array(cartItemSchema).min(1),
  shipping: addressSchema,
  payment: paymentInfoSchema,
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
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     variantId:
 *                       type: integer
 *                     quantity:
 *                       type: integer
 *               shipping:
 *                 type: object
 *                 properties:
 *                   label:
 *                     type: string
 *                   line1:
 *                     type: string
 *                   line2:
 *                     type: string
 *                   city:
 *                     type: string
 *                   postal:
 *                     type: string
 *                   country:
 *                     type: string
 *                   phone:
 *                     type: string
 *               payment:
 *                 type: object
 *                 properties:
 *                   method:
 *                     type: string
 *                   cardNumber:
 *                     type: string
 *                   expiryDate:
 *                     type: string
 *                   cvv:
 *                     type: string
 *     responses:
 *       201:
 *         description: Sipariş oluşturuldu
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 items:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       productId:
 *                         type: string
 *                       quantity:
 *                         type: integer
 *                       product:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           title:
 *                             type: string
 *                           description:
 *                             type: string
 *                           imageUrl:
 *                             type: string
 *                           price:
 *                             type: number
 *                       variantId:
 *                         type: string
 *                 total:
 *                   type: number
 *                 status:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *       400:
 *         description: Geçersiz istek
 *       404:
 *         description: Ürün bulunamadı
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 items:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       productId:
 *                         type: string
 *                       quantity:
 *                         type: integer
 *                       product:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           title:
 *                             type: string
 *                           description:
 *                             type: string
 *                           imageUrl:
 *                             type: string
 *                           price:
 *                             type: number
 *                       variantId:
 *                         type: string
 *                 total:
 *                   type: number
 *                 status:
 *                   type: string
 *                   enum: [pending, processing, shipped, delivered, cancelled]
 *                 shippingAddress:
 *                   type: object
 *                   nullable: true
 *                   properties:
 *                     id:
 *                       type: integer
 *                     label:
 *                       type: string
 *                     line1:
 *                       type: string
 *                     line2:
 *                       type: string
 *                       nullable: true
 *                     city:
 *                       type: string
 *                     postal:
 *                       type: string
 *                     country:
 *                       type: string
 *                     phone:
 *                       type: string
 *                       nullable: true
 *                 paymentMethod:
 *                   type: string
 *                 trackingNumber:
 *                   type: string
 *                   nullable: true
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Yetkilendirme hatası
 *       404:
 *         description: Sipariş bulunamadı
 */
router.get("/:id", authMiddleware, asyncHandler(orderController.getById));

export default router;
