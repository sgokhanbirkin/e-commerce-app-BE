import { db } from "../db";

export const addItem = async (productId: number, qty: number) => {
  return db.basketItem.create({ data: { productId, quantity: qty } });
};

export const getItems = async () => {
  return db.basketItem.findMany({ include: { Product: true } });
};

export const removeItem = async (id: number) => {
  return db.basketItem.delete({ where: { id } });
};
