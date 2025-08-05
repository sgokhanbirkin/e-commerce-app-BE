import { Request, Response } from "express";
import {
  createOrder,
  getOrderById,
  getUserOrders,
} from "../services/orderService";

export const create = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { addressId } = req.body;

  const order = await createOrder(userId, addressId);
  res.status(201).json(order);
};

export const getById = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const orderId = Number(req.params.id);

  const order = await getOrderById(orderId, userId);
  if (!order) return res.status(404).json({ error: "Order not found" });

  res.json(order);
};

export const getUserOrderHistory = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const orders = await getUserOrders(userId);
  res.json(orders);
};
