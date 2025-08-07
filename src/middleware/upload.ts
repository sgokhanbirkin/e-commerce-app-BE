import multer from "multer";
import path from "path";
import fs from "fs";
import { Request } from "express";

// Ensure avatars directory exists
const avatarsDir = path.join(process.cwd(), "public", "avatars");
if (!fs.existsSync(avatarsDir)) {
  fs.mkdirSync(avatarsDir, { recursive: true });
}

// Configure multer for avatar uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, avatarsDir);
  },
  filename: (req: any, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `user-${req.userId || "unknown"}-${uniqueSuffix}${ext}`);
  },
});

// File filter to only allow images
const fileFilter = (req: any, file: any, cb: multer.FileFilterCallback) => {
  // Check file type
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"));
  }
};

// Configure multer
export const uploadAvatar = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Middleware to handle multer errors
export const handleUploadError = (err: any, req: any, res: any, next: any) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res
        .status(400)
        .json({ error: "File size too large. Maximum size is 5MB" });
    }
    return res.status(400).json({ error: "File upload error" });
  }

  if (err.message === "Only image files are allowed") {
    return res.status(400).json({ error: "Only image files are allowed" });
  }

  next(err);
};
