import { db } from "../db";

export const getAllProducts = async () => {
  return db.product.findMany();
};

export const getProductById = async (id: number) => {
  return db.product.findUnique({ where: { id } });
};
