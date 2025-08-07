import { db } from "../db";

export const createReview = async (
  productId: number,
  userId: number,
  rating: number,
  title: string,
  comment: string,
  images?: string[]
) => {
  return db.review.create({
    data: {
      productId,
      userId,
      rating,
      title,
      comment,
      images: images ? JSON.stringify(images) : null,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      },
    },
  });
};

interface GetProductReviewsParams {
  productId: number;
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
}

export const getProductReviews = async (params: GetProductReviewsParams) => {
  const {
    productId,
    page = 1,
    limit = 10,
    sort = "createdAt",
    order = "desc",
  } = params;

  // Calculate pagination
  const skip = (page - 1) * limit;

  // Get total count for pagination
  const total = await db.review.count({
    where: { productId },
  });

  // Get reviews with pagination and sorting
  const reviews = await db.review.findMany({
    where: { productId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      },
    },
    orderBy: { [sort]: order },
    skip,
    take: limit,
  });

  // Get rating statistics
  const ratingStats = await db.review.groupBy({
    by: ["rating"],
    where: { productId },
    _count: {
      rating: true,
    },
  });

  // Calculate average rating
  const avgRating = await db.review.aggregate({
    where: { productId },
    _avg: {
      rating: true,
    },
  });

  // Build rating distribution
  const ratingDistribution = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };

  ratingStats.forEach((stat) => {
    ratingDistribution[stat.rating as keyof typeof ratingDistribution] =
      stat._count.rating;
  });

  // Transform reviews to match specification
  const transformedReviews = reviews.map((review) => ({
    id: review.id.toString(),
    productId: review.productId.toString(),
    userId: review.userId.toString(),
    userName: review.user.name || "Anonymous",
    userAvatar: review.user.avatarUrl || null,
    rating: review.rating,
    title: review.title || null,
    comment: review.comment || null,
    images: review.images ? JSON.parse(review.images) : [],
    likes: review.likes,
    dislikes: review.dislikes,
    isVerified: review.isVerified,
    createdAt: review.createdAt.toISOString(),
    updatedAt: review.updatedAt.toISOString(),
  }));

  return {
    reviews: transformedReviews,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    averageRating: avgRating._avg.rating || 0,
    ratingDistribution,
  };
};
