import request from "supertest";
import { app } from "../main";
import { db } from "../db";
import bcrypt from "bcrypt";

describe("Product Reviews API", () => {
  let authToken: string;
  let userId: number;
  const testEmail = `testreviews${Date.now()}@example.com`;

  beforeAll(async () => {
    // Create a test user
    const password = "password123";
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await db.user.create({
      data: {
        email: testEmail,
        passwordHash: hashedPassword,
        name: "Test Reviewer",
      },
    });
    userId = user.id;

    // Login to get token
    const loginResponse = await request(app).post("/api/auth/login").send({
      email: testEmail,
      password: "password123",
    });

    authToken = loginResponse.body.token;
  });

  afterAll(async () => {
    // Clean up test data
    await db.review.deleteMany({
      where: { userId: userId },
    });
    await db.user.delete({
      where: { id: userId },
    });
  });

  describe("GET /api/products/{productId}/reviews", () => {
    it("should return empty reviews for product with no reviews", async () => {
      const response = await request(app).get("/api/products/999/reviews");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        reviews: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
        averageRating: 0,
        ratingDistribution: {
          "1": 0,
          "2": 0,
          "3": 0,
          "4": 0,
          "5": 0,
        },
      });
    });

    it("should return reviews with default parameters", async () => {
      // Create a test review first
      await request(app)
        .post("/api/products/1/reviews")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          rating: 5,
          comment: "Excellent product!",
        });

      const response = await request(app).get("/api/products/1/reviews");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("reviews");
      expect(response.body).toHaveProperty("total");
      expect(response.body).toHaveProperty("page");
      expect(response.body).toHaveProperty("limit");
      expect(response.body).toHaveProperty("totalPages");
      expect(response.body).toHaveProperty("averageRating");
      expect(response.body).toHaveProperty("ratingDistribution");

      // Check default values
      expect(response.body.page).toBe(1);
      expect(response.body.limit).toBe(10);
      expect(response.body.total).toBeGreaterThan(0);
      expect(response.body.averageRating).toBeGreaterThan(0);
    });

    it("should handle pagination correctly", async () => {
      // Create multiple reviews with new required fields
      await request(app)
        .post("/api/products/2/reviews")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          rating: 4,
          title: "Good product",
          comment: "Good quality product",
        });

      await request(app)
        .post("/api/products/2/reviews")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          rating: 3,
          title: "Average product",
          comment: "Average quality product",
        });

      await request(app)
        .post("/api/products/2/reviews")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          rating: 5,
          title: "Amazing product",
          comment: "Amazing quality product",
        });

      // Test first page
      const response1 = await request(app).get(
        "/api/products/2/reviews?page=1&limit=2"
      );

      expect(response1.status).toBe(200);
      expect(response1.body.reviews.length).toBe(2);
      expect(response1.body.page).toBe(1);
      expect(response1.body.limit).toBe(2);
      expect(response1.body.totalPages).toBe(2);

      // Test second page
      const response2 = await request(app).get(
        "/api/products/2/reviews?page=2&limit=2"
      );

      expect(response2.status).toBe(200);
      expect(response2.body.reviews.length).toBe(1);
      expect(response2.body.page).toBe(2);
    });

    it("should handle sorting by rating", async () => {
      const response = await request(app).get(
        "/api/products/2/reviews?sort=rating&order=desc"
      );

      expect(response.status).toBe(200);
      expect(response.body.reviews.length).toBeGreaterThan(0);

      // Check that reviews are sorted by rating (descending)
      for (let i = 0; i < response.body.reviews.length - 1; i++) {
        expect(response.body.reviews[i].rating).toBeGreaterThanOrEqual(
          response.body.reviews[i + 1].rating
        );
      }
    });

    it("should handle sorting by creation date", async () => {
      const response = await request(app).get(
        "/api/products/2/reviews?sort=createdAt&order=desc"
      );

      expect(response.status).toBe(200);
      expect(response.body.reviews.length).toBeGreaterThan(0);

      // Check that reviews are sorted by creation date (descending)
      for (let i = 0; i < response.body.reviews.length - 1; i++) {
        const currentDate = new Date(response.body.reviews[i].createdAt);
        const nextDate = new Date(response.body.reviews[i + 1].createdAt);
        expect(currentDate.getTime()).toBeGreaterThanOrEqual(
          nextDate.getTime()
        );
      }
    });

    it("should calculate average rating correctly", async () => {
      const response = await request(app).get("/api/products/2/reviews");

      expect(response.status).toBe(200);
      expect(response.body.averageRating).toBeGreaterThan(0);
      expect(response.body.averageRating).toBeLessThanOrEqual(5);
    });

    it("should calculate rating distribution correctly", async () => {
      const response = await request(app).get("/api/products/2/reviews");

      expect(response.status).toBe(200);
      expect(response.body.ratingDistribution).toHaveProperty("1");
      expect(response.body.ratingDistribution).toHaveProperty("2");
      expect(response.body.ratingDistribution).toHaveProperty("3");
      expect(response.body.ratingDistribution).toHaveProperty("4");
      expect(response.body.ratingDistribution).toHaveProperty("5");

      // Check that all values are numbers
      Object.values(response.body.ratingDistribution).forEach((value) => {
        expect(typeof value).toBe("number");
        expect(value).toBeGreaterThanOrEqual(0);
      });
    });

    it("should validate query parameters", async () => {
      // Test invalid page
      const response1 = await request(app).get(
        "/api/products/1/reviews?page=0"
      );

      expect(response1.status).toBe(400);
      expect(response1.body.error).toBe("Page must be greater than 0");

      // Test invalid limit
      const response2 = await request(app).get(
        "/api/products/1/reviews?limit=0"
      );

      expect(response2.status).toBe(400);
      expect(response2.body.error).toBe("Limit must be between 1 and 100");

      const response3 = await request(app).get(
        "/api/products/1/reviews?limit=101"
      );

      expect(response3.status).toBe(400);
      expect(response3.body.error).toBe("Limit must be between 1 and 100");

      // Test invalid sort field
      const response4 = await request(app).get(
        "/api/products/1/reviews?sort=invalid"
      );

      expect(response4.status).toBe(400);
      expect(response4.body.error).toBe("Invalid sort field");

      // Test invalid order
      const response5 = await request(app).get(
        "/api/products/1/reviews?order=invalid"
      );

      expect(response5.status).toBe(400);
      expect(response5.body.error).toBe("Order must be 'asc' or 'desc'");
    });

    it("should return reviews with correct data structure", async () => {
      const response = await request(app).get(
        "/api/products/2/reviews?limit=1"
      );

      expect(response.status).toBe(200);
      expect(response.body.reviews.length).toBeGreaterThan(0);

      const review = response.body.reviews[0];
      expect(review).toHaveProperty("id");
      expect(review).toHaveProperty("productId");
      expect(review).toHaveProperty("userId");
      expect(review).toHaveProperty("userName");
      expect(review).toHaveProperty("userAvatar");
      expect(review).toHaveProperty("rating");
      expect(review).toHaveProperty("title");
      expect(review).toHaveProperty("comment");
      expect(review).toHaveProperty("images");
      expect(review).toHaveProperty("likes");
      expect(review).toHaveProperty("dislikes");
      expect(review).toHaveProperty("isVerified");
      expect(review).toHaveProperty("createdAt");
      expect(review).toHaveProperty("updatedAt");

      // Check data types
      expect(typeof review.id).toBe("string");
      expect(typeof review.productId).toBe("string");
      expect(typeof review.userId).toBe("string");
      expect(typeof review.userName).toBe("string");
      expect(typeof review.rating).toBe("number");
      expect(typeof review.likes).toBe("number");
      expect(typeof review.dislikes).toBe("number");
      expect(typeof review.isVerified).toBe("boolean");
      expect(typeof review.createdAt).toBe("string");
      expect(typeof review.updatedAt).toBe("string");
      expect(Array.isArray(review.images)).toBe(true);
    });

    it("should handle non-existent product gracefully", async () => {
      const response = await request(app).get("/api/products/99999/reviews");

      expect(response.status).toBe(200);
      expect(response.body.reviews).toEqual([]);
      expect(response.body.total).toBe(0);
    });
  });

  describe("POST /api/products/{productId}/reviews", () => {
    it("should create a review successfully", async () => {
      const reviewData = {
        rating: 4,
        title: "Great Product",
        comment:
          "This is a great product with excellent quality. Highly recommended!",
        images: [
          "https://example.com/image1.jpg",
          "https://example.com/image2.jpg",
        ],
      };

      const response = await request(app)
        .post("/api/products/3/reviews")
        .set("Authorization", `Bearer ${authToken}`)
        .send(reviewData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id");
      expect(response.body).toHaveProperty("rating");
      expect(response.body).toHaveProperty("title");
      expect(response.body).toHaveProperty("comment");
      expect(response.body).toHaveProperty("images");
      expect(response.body.rating).toBe(reviewData.rating);
      expect(response.body.title).toBe(reviewData.title);
      expect(response.body.comment).toBe(reviewData.comment);
      expect(response.body.images).toEqual(reviewData.images);
      expect(response.body).toHaveProperty("userName");
      expect(response.body).toHaveProperty("userAvatar");
      expect(response.body).toHaveProperty("likes");
      expect(response.body).toHaveProperty("dislikes");
      expect(response.body).toHaveProperty("isVerified");
      expect(response.body).toHaveProperty("createdAt");
      expect(response.body).toHaveProperty("updatedAt");
    });

    it("should create a review without images", async () => {
      const reviewData = {
        rating: 5,
        title: "Amazing Product",
        comment: "This product exceeded my expectations!",
      };

      const response = await request(app)
        .post("/api/products/3/reviews")
        .set("Authorization", `Bearer ${authToken}`)
        .send(reviewData);

      expect(response.status).toBe(201);
      expect(response.body.images).toEqual([]);
    });

    it("should require authentication", async () => {
      const response = await request(app).post("/api/products/3/reviews").send({
        rating: 5,
        title: "Test",
        comment: "Test comment",
      });

      expect(response.status).toBe(401);
    });

    it("should validate required fields", async () => {
      // Test missing title
      const response1 = await request(app)
        .post("/api/products/3/reviews")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          rating: 5,
          comment: "Test comment",
        });

      expect(response1.status).toBe(400);
      expect(response1.body.error).toHaveProperty("title");

      // Test missing comment
      const response2 = await request(app)
        .post("/api/products/3/reviews")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          rating: 5,
          title: "Test title",
        });

      expect(response2.status).toBe(400);
      expect(response2.body.error).toHaveProperty("comment");

      // Test missing rating
      const response3 = await request(app)
        .post("/api/products/3/reviews")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "Test title",
          comment: "Test comment",
        });

      expect(response3.status).toBe(400);
      expect(response3.body.error).toHaveProperty("rating");
    });

    it("should validate rating range", async () => {
      const response = await request(app)
        .post("/api/products/3/reviews")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          rating: 6,
          title: "Test",
          comment: "Test comment",
        });

      expect(response.status).toBe(400);
      expect(response.body.error.rating._errors[0]).toContain(
        "less than or equal to 5"
      );
    });

    it("should validate title length", async () => {
      const longTitle = "a".repeat(101); // 101 characters
      const response = await request(app)
        .post("/api/products/3/reviews")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          rating: 5,
          title: longTitle,
          comment: "Test comment",
        });

      expect(response.status).toBe(400);
      expect(response.body.error.title._errors[0]).toContain(
        "at most 100 character(s)"
      );
    });

    it("should validate comment length", async () => {
      const longComment = "a".repeat(1001); // 1001 characters
      const response = await request(app)
        .post("/api/products/3/reviews")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          rating: 5,
          title: "Test",
          comment: longComment,
        });

      expect(response.status).toBe(400);
      expect(response.body.error.comment._errors[0]).toContain(
        "at most 1000 character(s)"
      );
    });

    it("should validate image URLs", async () => {
      const response = await request(app)
        .post("/api/products/3/reviews")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          rating: 5,
          title: "Test",
          comment: "Test comment",
          images: ["invalid-url", "https://example.com/valid.jpg"],
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toHaveProperty("images");
      expect(response.body.error.images["0"]._errors[0]).toContain(
        "Invalid url"
      );
    });
  });
});
