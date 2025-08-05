import { Router } from "express";
import * as authController from "../controllers/authController";
import { authMiddleware } from "../middleware/authMiddleware";
import { asyncHandler } from "../middleware/asyncHandler";

const router = Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Yeni kullanıcı kaydı
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: object
 *     responses:
 *       201:
 *         description: Kullanıcı oluşturuldu
 */
router.post("/register", asyncHandler(authController.register));

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Kullanıcı girişi
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: JWT token
 */
router.post("/login", asyncHandler(authController.login));

/**
 * @swagger
 * /api/auth/users/me:
 *   get:
 *     summary: Kullanıcı profilini getirir
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Kullanıcı profili
 */
router.get(
  "/users/me",
  authMiddleware,
  asyncHandler(authController.getProfile)
);

/**
 * @swagger
 * /api/auth/users/me/address:
 *   post:
 *     summary: Kullanıcıya yeni adres ekler
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               label:
 *                 type: string
 *               line1:
 *                 type: string
 *               line2:
 *                 type: string
 *               city:
 *                 type: string
 *               postal:
 *                 type: string
 *               country:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       201:
 *         description: Adres eklendi
 */
router.post(
  "/users/me/address",
  authMiddleware,
  asyncHandler(authController.addAddress)
);

export default router;
