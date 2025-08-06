import { Router } from "express";
import * as authController from "../controllers/authController";
import { authMiddleware } from "../middleware/authMiddleware";
import { asyncHandler } from "../middleware/asyncHandler";
import { z } from "zod";
import { validateBody } from "../middleware/validation";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
  phone: z.string().optional(),
  address: z
    .object({
      label: z.string(),
      line1: z.string(),
      line2: z.string().optional(),
      city: z.string(),
      postal: z.string(),
      country: z.string(),
      phone: z.string().optional(),
    })
    .optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const addressSchema = z.object({
  label: z.string(),
  line1: z.string(),
  line2: z.string().optional(),
  city: z.string(),
  postal: z.string(),
  country: z.string(),
  phone: z.string().optional(),
});

const router = Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Yeni kullanıcı kaydı
 *     tags:
 *       - Auth / User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: object
 *                 properties:
 *                   label: { type: string }
 *                   line1: { type: string }
 *                   line2: { type: string }
 *                   city: { type: string }
 *                   postal: { type: string }
 *                   country: { type: string }
 *                   phone: { type: string }
 *     responses:
 *       201:
 *         description: Kullanıcı başarıyla kaydedildi
 *       400:
 *         description: Geçersiz giriş
 */
router.post(
  "/register",
  validateBody(registerSchema),
  asyncHandler(authController.register)
);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Kullanıcı girişi
 *     tags:
 *       - Auth / User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Başarılı giriş, JWT döner
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       400:
 *         description: Geçersiz kimlik bilgileri
 */
router.post(
  "/login",
  validateBody(loginSchema),
  asyncHandler(authController.login)
);

/**
 * @swagger
 * /api/auth/users/me:
 *   get:
 *     summary: Kullanıcının profil bilgilerini ve adreslerini getirir
 *     tags:
 *       - Auth / User
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Kullanıcı profili
 *       401:
 *         description: Yetkilendirme hatası
 *       404:
 *         description: Kullanıcı bulunamadı
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
 *       - Auth / User
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - label
 *               - line1
 *               - city
 *               - postal
 *               - country
 *             properties:
 *               label: { type: string, description: "Adres etiketi (Ev, İş vb.)" }
 *               line1: { type: string, description: "Adres satırı 1" }
 *               line2: { type: string, description: "Adres satırı 2 (opsiyonel)" }
 *               city: { type: string }
 *               postal: { type: string }
 *               country: { type: string }
 *               phone: { type: string, description: "Adres telefonu (opsiyonel)" }
 *     responses:
 *       201:
 *         description: Adres başarıyla eklendi
 *       401:
 *         description: Yetkilendirme hatası
 *       400:
 *         description: Geçersiz adres bilgileri
 */
router.post(
  "/users/me/address",
  authMiddleware,
  validateBody(addressSchema),
  asyncHandler(authController.addAddress)
);

/**
 * @swagger
 * /api/auth/guest:
 *   post:
 *     summary: Guest token oluşturur (kayıt olmadan kullanım için)
 *     tags:
 *       - Auth / Guest
 *     responses:
 *       201:
 *         description: Guest token başarıyla oluşturuldu
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: "Guest JWT token"
 *                 guestId:
 *                   type: string
 *                   description: "Unique guest identifier"
 *                 message:
 *                   type: string
 *                   description: "Success message"
 */
router.post("/guest", asyncHandler(authController.createGuest));

export default router;
