import express from "express";
import cors from "cors";
import helmet from "helmet";
import { apiLimiter } from "./middleware/rateLimiter";
import { logger } from "./middleware/logger";
import { errorHandler } from "./middleware/errorHandler";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import { swaggerOptions } from "./swagger";

// Routes
import healthRoutes from "./routes/health";
import productsRoutes from "./routes/products";
import categoriesRoutes from "./routes/categories";
import basketRoutes from "./routes/basket";
import cartRoutes from "./routes/cart";
import ordersRoutes from "./routes/orders";
import reviewsRoutes from "./routes/reviews";
import authRoutes from "./routes/auth";
import usersRoutes from "./routes/users";

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  })
);
app.use(apiLimiter);
app.use(logger);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Static file serving
app.use("/images", express.static("public/images"));
app.use("/avatars", express.static("public/avatars"));

// Routes
app.use("/health", healthRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/basket", basketRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/reviews", reviewsRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);

// Swagger documentation
const specs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

// Error handling
app.use(errorHandler);

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down");
  process.exit(0);
});

// Only start server if not in test environment
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`BE running on http://localhost:${PORT}`);
  });
}

export { app };
