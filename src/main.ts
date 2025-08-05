import express from "express";
import cors from "cors";
import helmet from "helmet";
import productsRouter from "./routes/products";
import basketRouter from "./routes/basket";
import authRouter from "./routes/auth";
import healthRouter from "./routes/health";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import { swaggerOptions } from "./swagger";
import { errorHandler } from "./middleware/errorHandler";
import { logger } from "./middleware/logger";
import { apiLimiter } from "./middleware/rateLimiter";
import { db } from "./db";

dotenv.config();

const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(logger);
app.use(express.json());
app.use(apiLimiter);

app.use("/api/products", productsRouter);
app.use("/api/basket", basketRouter);
app.use("/api/auth", authRouter);
app.use("/health", healthRouter);

const specs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

const PORT = process.env.PORT || 8080;
const server = app.listen(PORT, () => {
  console.log(`BE running on http://localhost:${PORT}`);
});

app.use(errorHandler);

process.on("SIGTERM", () => {
  logger.logger.info("SIGTERM received, shutting down");
  server.close(() => db.$disconnect());
});
process.on("SIGINT", () => {
  logger.logger.info("SIGINT received, shutting down");
  server.close(() => db.$disconnect());
});

export { app };
