import { Request, Response } from "express";
import {
  createOrder,
  getOrderById,
  getUserOrders,
} from "../services/orderService";

export const create = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { items, shipping, payment } = req.body;

  try {
    const order = await createOrder(userId, items, shipping, payment);
    res.status(201).json(order);
  } catch (error: any) {
    if (error.message === "Order must contain at least one item") {
      return res.status(400).json({
        status: "error",
        message: "Order must contain at least one item",
      });
    }
    if (
      error.message.includes("Variant") &&
      error.message.includes("not found")
    ) {
      return res.status(404).json({
        status: "error",
        message: error.message,
      });
    }
    if (error.message.includes("Insufficient stock")) {
      return res.status(400).json({
        status: "error",
        message: error.message,
      });
    }
    throw error;
  }
};

export const getById = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const orderId = Number(req.params.id);

  if (isNaN(orderId)) {
    return res.status(400).json({ error: "Invalid order ID" });
  }

  const order = await getOrderById(orderId, userId);
  if (!order) return res.status(404).json({ error: "Order not found" });

  res.json(order);
};

export const getUserOrderHistory = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const orders = await getUserOrders(userId);
  res.json(orders);
};
