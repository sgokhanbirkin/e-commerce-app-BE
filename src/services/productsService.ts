import { db } from "../db";

export const getAllProducts = async (filters: any = {}) => {
  const { category, search, isNew, page = 1, limit = 10 } = filters;

  const where: any = {};
  if (category) where.categoryId = parseInt(category);
  if (search) where.title = { contains: search };
  if (isNew)
    where.createdAt = { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) };

  const skip = (page - 1) * limit;

  return db.product.findMany({
    where,
    include: {
      category: true,
      variants: true,
      reviews: true,
    },
    skip,
    take: limit,
  });
};

export const getProductById = async (id: number) => {
  return db.product.findUnique({
    where: { id },
    include: {
      category: true,
      variants: true,
      reviews: {
        include: {
          user: {
            select: { name: true, email: true },
          },
        },
      },
    },
  });
};

export const getProductVariants = async (productId: number) => {
  return db.productVariant.findMany({
    where: { productId },
  });
};
