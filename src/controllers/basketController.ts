import { Request, Response } from "express";
import * as basketService from "../services/basketService";

export const list = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const items = await basketService.getItems(userId);
  res.json(items);
};

export const add = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { variantId, quantity } = req.body;
  const item = await basketService.addItem(userId, variantId, quantity);
  res.status(201).json(item);
};

export const remove = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const id = Number(req.params.id);
  await basketService.removeItem(userId, id);
  res.sendStatus(204);
};

export const clearCart = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  await basketService.clearCart(userId);
  res.sendStatus(204);
};
