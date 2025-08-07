import { Request, Response } from "express";
import {
  addToCart,
  getCart,
  removeFromCart,
  updateCartItemQuantity,
  clearCart,
} from "../services/cartService";

export const addItem = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const guestId = (req as any).guestId;
  const userType = (req as any).userType;
  const { variantId, quantity } = req.body;

  try {
    let item;
    if (userType === "guest") {
      item = await addToCart(null, variantId, quantity, guestId);
    } else {
      item = await addToCart(userId, variantId, quantity);
    }
    res.status(201).json(item);
  } catch (error: any) {
    if (error.message === "Variant not found") {
      return res.status(404).json({
        status: "error",
        message: "Variant not found",
      });
    }
    if (error.message === "Insufficient stock") {
      return res.status(400).json({
        status: "error",
        message: "Insufficient stock",
      });
    }
    throw error;
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

  if (isNaN(itemId)) {
    return res.status(400).json({ error: "Invalid item ID" });
  }

  try {
    if (userType === "guest") {
      await removeFromCart(null, itemId, guestId);
    } else {
      await removeFromCart(userId, itemId);
    }

    res.sendStatus(204);
  } catch (error: any) {
    if (error.message === "Cart item not found") {
      return res.status(404).json({ error: "Cart item not found" });
    }
    throw error;
  }
};

export const updateItemQuantity = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const guestId = (req as any).guestId;
  const userType = (req as any).userType;
  const itemId = Number(req.params.itemId);
  const { quantity } = req.body;

  if (isNaN(itemId)) {
    return res.status(400).json({ error: "Invalid item ID" });
  }

  if (!quantity || typeof quantity !== "number" || quantity <= 0) {
    return res
      .status(400)
      .json({ error: "Quantity must be a positive number" });
  }

  try {
    let updatedItem;
    if (userType === "guest") {
      updatedItem = await updateCartItemQuantity(
        null,
        itemId,
        quantity,
        guestId
      );
    } else {
      updatedItem = await updateCartItemQuantity(userId, itemId, quantity);
    }

    res.status(200).json(updatedItem);
  } catch (error: any) {
    if (error.message === "Cart item not found") {
      return res.status(404).json({ error: "Cart item not found" });
    }
    if (error.message === "Insufficient stock") {
      return res.status(400).json({ error: "Insufficient stock" });
    }
    throw error;
  }
};

export const clearCartItems = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const guestId = (req as any).guestId;
  const userType = (req as any).userType;

  if (userType === "guest") {
    await clearCart(null, guestId);
  } else {
    await clearCart(userId);
  }

  res.sendStatus(204);
};
