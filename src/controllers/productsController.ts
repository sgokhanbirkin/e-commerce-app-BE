import { Request, Response } from "express";
import { ProductRepo } from "../repositories/product.repository";
import {
  getAllProducts,
  getProductById,
  getProductVariants,
} from "../services/productsService";

export const list = async (req: Request, res: Response) => {
  const filters = {
    category: req.query.category as string,
    search: req.query.search as string,
    isNew: req.query.isNew === "true",
    page: parseInt(req.query.page as string) || 1,
    limit: parseInt(req.query.limit as string) || 10,
  };

  const items = await getAllProducts(filters);
  res.json(items);
};

export const detail = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const item = await getProductById(id);
  if (!item) return res.status(404).json({ error: "Not found" });
  res.json(item);
};

export const variants = async (req: Request, res: Response) => {
  const productId = Number(req.params.id);
  const variants = await getProductVariants(productId);
  res.json(variants);
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
