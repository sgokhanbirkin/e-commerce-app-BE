import { NextFunction, Request, Response } from "express";
import { ZodObject, ZodEffects } from "zod";

export const validateBody =
  (schema: ZodObject<any> | ZodEffects<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.format() });
    }
    req.body = result.data;
    next();
  };
