/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         price:
 *           type: number
 *         image:
 *           type: string
 *         category:
 *           type: string
 *         isNew:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */
import { Router } from "express";
import * as productsController from "../controllers/productsController";
import { asyncHandler } from "../middleware/asyncHandler";
import { z } from "zod";
import { validateBody } from "../middleware/validation";

const productSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  price: z.number().positive(),
  imageUrl: z.string().url().optional(),
  categoryId: z.number().int().positive(),
});

const router = Router();

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Tüm ürünleri listeler
 *     tags:
 *       - Products
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: isNew
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Ürün listesi
 */
router.get("/", asyncHandler(productsController.list));

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Tek bir ürünü getirir
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Ürün detayı
 *       404:
 *         description: Ürün bulunamadı
 */
router.get("/:id", asyncHandler(productsController.detail));

/**
 * @swagger
 * /api/products/{id}/variants:
 *   get:
 *     summary: Ürün varyantlarını getirir
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Varyant listesi
 */
router.get("/:id/variants", asyncHandler(productsController.variants));

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Yeni ürün oluşturur
 *     tags:
 *       - Products
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       201:
 *         description: Oluşturulan ürün
 */
router.post(
  "/",
  validateBody(productSchema),
  asyncHandler(productsController.create)
);

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Ürünü günceller
 *     tags:
 *       - Products
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
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       200:
 *         description: Güncellenen ürün
 */
router.put(
  "/:id",
  validateBody(productSchema.partial()),
  asyncHandler(productsController.update)
);

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Ürünü siler
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Başarıyla silindi
 */
router.delete("/:id", asyncHandler(productsController.remove));

export default router;
