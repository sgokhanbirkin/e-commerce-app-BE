import { Request, Response } from "express";
import * as basketService from "../services/basketService";

export const list = async (_: Request, res: Response) => {
  const items = await basketService.getItems();
  res.json(items);
};

export const add = async (req: Request, res: Response) => {
  const { productId, quantity } = req.body;
  const item = await basketService.addItem(productId, quantity);
  res.status(201).json(item);
};

export const remove = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  await basketService.removeItem(id);
  res.sendStatus(204);
};
