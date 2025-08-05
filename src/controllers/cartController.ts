import { Request, Response } from "express";
import { addToCart, getCart, removeFromCart } from "../services/cartService";

export const addItem = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { variantId, quantity } = req.body;

  const item = await addToCart(userId, variantId, quantity);
  res.status(201).json(item);
};

export const listItems = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const items = await getCart(userId);
  res.json(items);
};

export const removeItem = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const itemId = Number(req.params.itemId);

  await removeFromCart(userId, itemId);
  res.sendStatus(204);
};
