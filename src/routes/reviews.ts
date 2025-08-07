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
 *     summary: Ürün yorumlarını getirir
 *     tags:
 *       - Reviews
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Ürün ID'si
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Sayfa numarası
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           minimum: 1
 *           maximum: 100
 *         description: Sayfa başına yorum sayısı
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [createdAt, rating, likes]
 *           default: createdAt
 *         description: Sıralama alanı
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sıralama yönü
 *     responses:
 *       200:
 *         description: Ürün yorumları
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 reviews:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       productId:
 *                         type: string
 *                       userId:
 *                         type: string
 *                       userName:
 *                         type: string
 *                       userAvatar:
 *                         type: string
 *                         nullable: true
 *                       rating:
 *                         type: integer
 *                         minimum: 1
 *                         maximum: 5
 *                       title:
 *                         type: string
 *                         nullable: true
 *                       comment:
 *                         type: string
 *                         nullable: true
 *                       images:
 *                         type: array
 *                         items:
 *                           type: string
 *                       likes:
 *                         type: integer
 *                       dislikes:
 *                         type: integer
 *                       isVerified:
 *                         type: boolean
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                 total:
 *                   type: integer
 *                   description: Toplam yorum sayısı
 *                 page:
 *                   type: integer
 *                   description: Mevcut sayfa numarası
 *                 limit:
 *                   type: integer
 *                   description: Sayfa başına yorum sayısı
 *                 totalPages:
 *                   type: integer
 *                   description: Toplam sayfa sayısı
 *                 averageRating:
 *                   type: number
 *                   description: Ortalama puan
 *                 ratingDistribution:
 *                   type: object
 *                   properties:
 *                     "1":
 *                       type: integer
 *                       description: 1 yıldız sayısı
 *                     "2":
 *                       type: integer
 *                       description: 2 yıldız sayısı
 *                     "3":
 *                       type: integer
 *                       description: 3 yıldız sayısı
 *                     "4":
 *                       type: integer
 *                       description: 4 yıldız sayısı
 *                     "5":
 *                       type: integer
 *                       description: 5 yıldız sayısı
 *       400:
 *         description: Geçersiz parametreler
 *       404:
 *         description: Ürün bulunamadı
 */
router.get("/:id/reviews", asyncHandler(reviewController.listReviews));

export default router;
