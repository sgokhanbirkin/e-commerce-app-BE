import { Request, Response } from "express";
import { createReview, getProductReviews } from "../services/reviewService";

export const addReview = async (req: Request, res: Response) => {
  const productId = Number(req.params.id);
  const userId = (req as any).userId;
  const { rating, title, comment, images } = req.body;

  const review = await createReview(
    productId,
    userId,
    rating,
    title,
    comment,
    images
  );

  // Transform the response to match the specification
  const transformedReview = {
    id: review.id.toString(),
    productId: review.productId.toString(),
    userId: review.userId.toString(),
    userName: review.user.name || "Anonymous",
    userAvatar: review.user.avatarUrl || null,
    rating: review.rating,
    title: review.title,
    comment: review.comment,
    images: review.images ? JSON.parse(review.images) : [],
    likes: review.likes,
    dislikes: review.dislikes,
    isVerified: review.isVerified,
    createdAt: review.createdAt.toISOString(),
    updatedAt: review.updatedAt.toISOString(),
  };

  res.status(201).json(transformedReview);
};

export const listReviews = async (req: Request, res: Response) => {
  const productId = Number(req.params.id);

  // Parse query parameters
  const page = req.query.page ? Number(req.query.page) : 1;
  const limit = req.query.limit ? Number(req.query.limit) : 10;
  const sort = (req.query.sort as string) || "createdAt";
  const order = (req.query.order as "asc" | "desc") || "desc";

  // Validate parameters
  if (page < 1) {
    return res.status(400).json({ error: "Page must be greater than 0" });
  }
  if (limit < 1 || limit > 100) {
    return res.status(400).json({ error: "Limit must be between 1 and 100" });
  }
  if (!["createdAt", "rating", "likes"].includes(sort)) {
    return res.status(400).json({ error: "Invalid sort field" });
  }
  if (!["asc", "desc"].includes(order)) {
    return res.status(400).json({ error: "Order must be 'asc' or 'desc'" });
  }

  const result = await getProductReviews({
    productId,
    page,
    limit,
    sort,
    order,
  });

  res.json(result);
};
