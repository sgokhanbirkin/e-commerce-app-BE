import { Request, Response } from "express";
import { addToCart, getCart, removeFromCart } from "../services/cartService";

export const addItem = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const guestId = (req as any).guestId;
  const userType = (req as any).userType;
  const { variantId, quantity } = req.body;

  if (userType === "guest") {
    const item = await addToCart(null, variantId, quantity, guestId);
    res.status(201).json(item);
  } else {
    const item = await addToCart(userId, variantId, quantity);
    res.status(201).json(item);
  }
};

export const listItems = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const guestId = (req as any).guestId;
  const userType = (req as any).userType;

  if (userType === "guest") {
    const items = await getCart(null, guestId);
    res.json(items);
  } else {
    const items = await getCart(userId);
    res.json(items);
  }
};

export const removeItem = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const guestId = (req as any).guestId;
  const userType = (req as any).userType;
  const itemId = Number(req.params.itemId);

  if (userType === "guest") {
    await removeFromCart(null, itemId, guestId);
  } else {
    await removeFromCart(userId, itemId);
  }

  res.sendStatus(204);
};
