import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { validateGuestToken } from "../services/authService";

const JWT_SECRET = process.env.JWT_SECRET as string;

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return res.sendStatus(401);
  const token = auth.split(" ")[1];

  try {
    const payload = jwt.verify(token, JWT_SECRET) as {
      userId?: number;
      guestId?: string;
      type?: string;
    };

    if (payload.userId) {
      (req as any).userId = payload.userId;
      (req as any).userType = "user";
    } else if (payload.guestId && payload.type === "guest") {
      (req as any).guestId = payload.guestId;
      (req as any).userType = "guest";
    } else {
      return res.sendStatus(401);
    }

    next();
  } catch {
    return res.sendStatus(401);
  }
}

export function optionalAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    (req as any).userType = "anonymous";
    return next();
  }

  const token = auth.split(" ")[1];

  try {
    const payload = jwt.verify(token, JWT_SECRET) as {
      userId?: number;
      guestId?: string;
      type?: string;
    };

    if (payload.userId) {
      (req as any).userId = payload.userId;
      (req as any).userType = "user";
    } else if (payload.guestId && payload.type === "guest") {
      (req as any).guestId = payload.guestId;
      (req as any).userType = "guest";
    } else {
      (req as any).userType = "anonymous";
    }

    next();
  } catch {
    (req as any).userType = "anonymous";
    next();
  }
}
