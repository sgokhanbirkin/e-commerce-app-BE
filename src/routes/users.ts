import { Router } from "express";
import * as authController from "../controllers/authController";
import * as orderController from "../controllers/orderController";
import { authMiddleware } from "../middleware/authMiddleware";
import { asyncHandler } from "../middleware/asyncHandler";
import { z } from "zod";
import { validateBody } from "../middleware/validation";

const updateProfileSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  dateOfBirth: z.string().datetime().optional(),
});

const router = Router();

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Kullanıcı profilini getirir
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Kullanıcı profili
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 email:
 *                   type: string
 *                 firstName:
 *                   type: string
 *                 lastName:
 *                   type: string
 *                 avatar:
 *                   type: string
 *                   nullable: true
 *                 phone:
 *                   type: string
 *                   nullable: true
 *                 dateOfBirth:
 *                   type: string
 *                   format: date-time
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
 *         description: Kullanıcı bulunamadı
 *   put:
 *     summary: Kullanıcı profilini günceller
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 description: "Kullanıcının adı"
 *               lastName:
 *                 type: string
 *                 description: "Kullanıcının soyadı"
 *               phone:
 *                 type: string
 *                 description: "Telefon numarası"
 *               dateOfBirth:
 *                 type: string
 *                 format: date-time
 *                 description: "Doğum tarihi (ISO 8601 formatında)"
 *     responses:
 *       200:
 *         description: Profil başarıyla güncellendi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 email:
 *                   type: string
 *                 firstName:
 *                   type: string
 *                 lastName:
 *                   type: string
 *                 avatar:
 *                   type: string
 *                   nullable: true
 *                 phone:
 *                   type: string
 *                   nullable: true
 *                 dateOfBirth:
 *                   type: string
 *                   format: date-time
 *                   nullable: true
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Geçersiz veri
 *       401:
 *         description: Yetkilendirme hatası
 */
router.get("/me", authMiddleware, asyncHandler(authController.getProfile));

router.put(
  "/me",
  authMiddleware,
  validateBody(updateProfileSchema),
  asyncHandler(authController.updateProfileWithDetails)
);

/**
 * @swagger
 * /api/users/me/orders:
 *   get:
 *     summary: Kullanıcının sipariş geçmişini getirir
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sipariş geçmişi
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   items:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         productId:
 *                           type: string
 *                         quantity:
 *                           type: integer
 *                         product:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                             title:
 *                               type: string
 *                             description:
 *                               type: string
 *                             imageUrl:
 *                               type: string
 *                             price:
 *                               type: number
 *                         variantId:
 *                           type: string
 *                   total:
 *                     type: number
 *                   status:
 *                     type: string
 *                     enum: [pending, processing, shipped, delivered, cancelled]
 *                   shippingAddress:
 *                     type: object
 *                     nullable: true
 *                     properties:
 *                       id:
 *                         type: integer
 *                       label:
 *                         type: string
 *                       line1:
 *                         type: string
 *                       line2:
 *                         type: string
 *                         nullable: true
 *                       city:
 *                         type: string
 *                       postal:
 *                         type: string
 *                       country:
 *                         type: string
 *                       phone:
 *                         type: string
 *                         nullable: true
 *                   paymentMethod:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: Yetkilendirme hatası
 */
router.get(
  "/me/orders",
  authMiddleware,
  asyncHandler(orderController.getUserOrderHistory)
);

export default router;
