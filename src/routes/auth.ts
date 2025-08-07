import { Router } from "express";
import * as authController from "../controllers/authController";
import { authMiddleware } from "../middleware/authMiddleware";
import { asyncHandler } from "../middleware/asyncHandler";
import { z } from "zod";
import { validateBody } from "../middleware/validation";
import { uploadAvatar, handleUploadError } from "../middleware/upload";

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

const updateProfileSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
});

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(6, "New password must be at least 6 characters long"),
});

const updateAddressSchema = z
  .object({
    label: z.string().min(1, "Label is required"),
    line1: z.string().min(1, "Address line 1 is required"),
    line2: z.string().optional(),
    city: z.string().min(1, "City is required"),
    postal: z.string().min(1, "Postal code is required"),
    country: z.string().min(1, "Country is required"),
    phone: z.string().optional(),
  })
  .partial()
  .refine(
    (data) => {
      // At least one field must be provided
      return Object.keys(data).length > 0;
    },
    {
      message: "At least one field must be provided",
    }
  );

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
 * /api/auth/users/me:
 *   put:
 *     summary: Kullanıcı profil bilgilerini günceller
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
 *             properties:
 *               name: { type: string, description: "Kullanıcı adı" }
 *               email: { type: string, format: email, description: "E-posta adresi" }
 *               phone: { type: string, description: "Telefon numarası" }
 *     responses:
 *       200:
 *         description: Profil başarıyla güncellendi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id: { type: integer }
 *                 name: { type: string }
 *                 email: { type: string }
 *                 phone: { type: string }
 *                 createdAt: { type: string, format: date-time }
 *       400:
 *         description: Geçersiz veri veya email zaten mevcut
 *       401:
 *         description: Yetkilendirme hatası
 */
router.put(
  "/users/me",
  authMiddleware,
  validateBody(updateProfileSchema),
  asyncHandler(authController.updateProfile)
);

/**
 * @swagger
 * /api/auth/users/me/password:
 *   put:
 *     summary: Kullanıcı şifresini günceller
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
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword: { type: string, description: "Mevcut şifre" }
 *               newPassword: { type: string, description: "Yeni şifre (en az 6 karakter)" }
 *     responses:
 *       200:
 *         description: Şifre başarıyla güncellendi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, description: "Başarı mesajı" }
 *       400:
 *         description: Geçersiz veri, şifreler eşleşmiyor veya mevcut şifre yanlış
 *       401:
 *         description: Yetkilendirme hatası
 */
router.put(
  "/users/me/password",
  authMiddleware,
  validateBody(updatePasswordSchema),
  asyncHandler(authController.updatePassword)
);

/**
 * @swagger
 * /api/auth/users/me/avatar:
 *   post:
 *     summary: Kullanıcı avatar yükler
 *     tags:
 *       - Auth / User
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: "Avatar resim dosyası (maksimum 5MB)"
 *     responses:
 *       200:
 *         description: Avatar başarıyla yüklendi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id: { type: integer }
 *                 name: { type: string }
 *                 email: { type: string }
 *                 avatar: { type: string, format: uri }
 *                 createdAt: { type: string, format: date-time }
 *       400:
 *         description: Geçersiz dosya veya dosya boyutu çok büyük
 *       401:
 *         description: Yetkilendirme hatası
 */
router.post(
  "/users/me/avatar",
  authMiddleware,
  uploadAvatar.single("file"),
  handleUploadError,
  asyncHandler(authController.uploadAvatar)
);

/**
 * @swagger
 * /api/auth/users/me/address/{addressId}:
 *   put:
 *     summary: Kullanıcı adresini günceller
 *     tags:
 *       - Auth / User
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: addressId
 *         required: true
 *         schema:
 *           type: integer
 *         description: "Adres ID'si"
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
 *       200:
 *         description: Adres başarıyla güncellendi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id: { type: integer }
 *                 label: { type: string }
 *                 line1: { type: string }
 *                 line2: { type: string }
 *                 city: { type: string }
 *                 postal: { type: string }
 *                 country: { type: string }
 *                 phone: { type: string }
 *                 userId: { type: integer }
 *       400:
 *         description: Geçersiz adres bilgileri
 *       401:
 *         description: Yetkilendirme hatası
 *       404:
 *         description: Adres bulunamadı veya kullanıcıya ait değil
 *   delete:
 *     summary: Kullanıcı adresini siler
 *     tags:
 *       - Auth / User
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: addressId
 *         required: true
 *         schema:
 *           type: integer
 *         description: "Adres ID'si"
 *     responses:
 *       200:
 *         description: Adres başarıyla silindi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, description: "Success message" }
 *       400:
 *         description: Geçersiz adres ID'si
 *       401:
 *         description: Yetkilendirme hatası
 *       404:
 *         description: Adres bulunamadı veya kullanıcıya ait değil
 */
router.put(
  "/users/me/address/:addressId",
  authMiddleware,
  validateBody(updateAddressSchema),
  asyncHandler(authController.updateAddress)
);

router.delete(
  "/users/me/address/:addressId",
  authMiddleware,
  asyncHandler(authController.deleteAddress)
);

/**
 * @swagger
 * /api/auth/guest:
 *   post:
 *     summary: Guest token oluşturur
 *     tags:
 *       - Auth
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
 */
router.post("/guest", asyncHandler(authController.createGuest));

export default router;
