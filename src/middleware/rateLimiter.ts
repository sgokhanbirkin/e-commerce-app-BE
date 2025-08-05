import rateLimit from "express-rate-limit";

export const apiLimiter = rateLimit({
  windowMs: 60_000, // 1 dakika
  max: 100, // aynı IP’den 100 istek
  message: { error: "Too many requests, please try again later." },
});
