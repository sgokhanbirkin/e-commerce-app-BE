import { Request, Response, NextFunction } from "express";

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Log the error (can be replaced with a logger like pino)
  console.error(err);
  const status = err.status || 500;
  res
    .status(status)
    .json({ status: "error", message: err.message || "Internal Server Error" });
}
