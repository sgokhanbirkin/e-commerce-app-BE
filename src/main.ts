import express from "express";
import cors from "cors";
import helmet from "helmet";
import productsRouter from "./routes/products";
import basketRouter from "./routes/basket";
import authRouter from "./routes/auth";
import healthRouter from "./routes/health";
import reviewsRouter from "./routes/reviews";
import cartRouter from "./routes/cart";
import ordersRouter from "./routes/orders";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import { swaggerOptions } from "./swagger";
import { errorHandler } from "./middleware/errorHandler";
import { logger } from "./middleware/logger";
import { apiLimiter } from "./middleware/rateLimiter";
import { db } from "./db"; // Added for graceful shutdown

dotenv.config();

const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(logger);
app.use(express.json());
app.use(apiLimiter);

// API Routes
app.use("/api/products", productsRouter);
app.use("/api/products", reviewsRouter); // Reviews are nested under products
app.use("/api/basket", basketRouter);
app.use("/api/auth", authRouter);
app.use("/api/cart", cartRouter);
app.use("/api/orders", ordersRouter);
app.use("/health", healthRouter);

// Swagger Documentation
const specs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

const PORT = process.env.PORT || 8080;

// Only start server if not in test environment
if (process.env.NODE_ENV !== "test") {
  const server = app.listen(PORT, () => {
    console.log(`BE running on http://localhost:${PORT}`);
  });

  // Graceful shutdown
  process.on("SIGTERM", () => {
    logger.logger.info("SIGTERM received, shutting down");
    server.close(() => db.$disconnect());
  });
  process.on("SIGINT", () => {
    logger.logger.info("SIGINT received, shutting down");
    server.close(() => db.$disconnect());
  });
}

app.use(errorHandler);

export { app };
