import pino from "pino";
import pinoHttp from "pino-http";

export const logger = pinoHttp({
  logger: pino({ level: process.env.LOG_LEVEL || "info" }),
});
