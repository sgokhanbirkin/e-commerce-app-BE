import { db } from "../db";

export const getAllProducts = async (filters: any = {}) => {
  const { category, search, isNew, page = 1, limit = 10 } = filters;

  const where: any = {};
  if (category) where.categoryId = parseInt(category);
  if (search) where.title = { contains: search };
  if (isNew)
    where.createdAt = { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) };

  const skip = (page - 1) * limit;

  const products = await db.product.findMany({
    where,
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
    skip,
    take: limit,
  });

  // Her ürün için averageRating ve reviewCount hesapla
  return products.map((product) => {
    const averageRating =
      product.reviews.length > 0
        ? product.reviews.reduce((sum, review) => sum + review.rating, 0) /
          product.reviews.length
        : 0;

    return {
      ...product,
      averageRating: Math.round(averageRating * 10) / 10, // 1 ondalık basamak
      reviewCount: product.reviews.length,
    };
  });
};

export const getProductById = async (id: number) => {
  const product = await db.product.findUnique({
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
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!product) return null;

  // averageRating ve reviewCount hesapla
  const averageRating =
    product.reviews.length > 0
      ? product.reviews.reduce((sum, review) => sum + review.rating, 0) /
        product.reviews.length
      : 0;

  return {
    ...product,
    averageRating: Math.round(averageRating * 10) / 10, // 1 ondalık basamak
    reviewCount: product.reviews.length,
    longDescription: product.description, // Şimdilik description'ı longDescription olarak kullan
  };
};

export const getProductVariants = async (productId: number) => {
  return db.productVariant.findMany({
    where: { productId },
  });
};
