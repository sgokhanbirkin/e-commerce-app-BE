import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const ProductRepo = {
  findAll: () => prisma.product.findMany(),
  findById: (id: number) => prisma.product.findUnique({ where: { id } }),
  create: (data: {
    title: string;
    description?: string;
    price: number;
    imageUrl?: string;
    categoryId: number;
  }) => prisma.product.create({ data }),
  update: (
    id: number,
    data: Partial<{
      title: string;
      description?: string;
      price: number;
      imageUrl?: string;
      categoryId: number;
    }>
  ) => prisma.product.update({ where: { id }, data }),
  remove: (id: number) => prisma.product.delete({ where: { id } }),
};
