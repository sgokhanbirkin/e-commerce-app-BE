import { Request, Response } from "express";
import { createReview, getProductReviews } from "../services/reviewService";

export const addReview = async (req: Request, res: Response) => {
  const productId = Number(req.params.id);
  const userId = (req as any).userId;
  const { rating, comment } = req.body;

  const review = await createReview(productId, userId, rating, comment);
  res.status(201).json(review);
};

export const listReviews = async (req: Request, res: Response) => {
  const productId = Number(req.params.id);
  const reviews = await getProductReviews(productId);
  res.json(reviews);
};
