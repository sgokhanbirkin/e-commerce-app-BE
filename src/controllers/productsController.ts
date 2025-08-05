import { Request, Response } from "express";
import { ProductRepo } from "../repositories/product.repository";

export const list = async (_: Request, res: Response) => {
  const items = await ProductRepo.findAll();
  res.json(items);
};

export const detail = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const item = await ProductRepo.findById(id);
  if (!item) return res.status(404).json({ error: "Not found" });
  res.json(item);
};

export const create = async (req: Request, res: Response) => {
  const data = req.body;
  const newItem = await ProductRepo.create(data);
  res.status(201).json(newItem);
};

export const update = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const data = req.body;
  const updated = await ProductRepo.update(id, data);
  res.json(updated);
};

export const remove = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  await ProductRepo.remove(id);
  res.status(204).send();
};
