import { db } from "../db";

export const createReview = async (
  productId: number,
  userId: number,
  rating: number,
  comment?: string
) => {
  return db.review.create({
    data: {
      productId,
      userId,
      rating,
      comment,
    },
    include: {
      user: {
        select: { name: true, email: true },
      },
    },
  });
};

export const getProductReviews = async (productId: number) => {
  return db.review.findMany({
    where: { productId },
    include: {
      user: {
        select: { name: true, email: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};
