import { db } from "../db";

export const addItem = async (
  userId: number,
  variantId: number,
  qty: number
) => {
  return db.basketItem.create({
    data: { userId, variantId, quantity: qty },
    include: { variant: { include: { product: true } } },
  });
};

export const getItems = async (userId: number) => {
  return db.basketItem.findMany({
    where: { userId },
    include: { variant: { include: { product: true } } },
  });
};

export const removeItem = async (userId: number, id: number) => {
  return db.basketItem.delete({
    where: { id, userId },
  });
};
