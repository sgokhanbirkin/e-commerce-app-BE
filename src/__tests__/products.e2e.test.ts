import request from "supertest";
import { app } from "../main";

describe("Products Endpoints", () => {
  describe("GET /api/products", () => {
    it("should return an array of products", async () => {
      const res = await request(app).get("/api/products");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it("should filter products by category", async () => {
      const res = await request(app)
        .get("/api/products")
        .query({ category: "1" });

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it("should search products", async () => {
      const res = await request(app)
        .get("/api/products")
        .query({ search: "test" });

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe("GET /api/products/:id", () => {
    it("should return a single product", async () => {
      const res = await request(app).get("/api/products/1");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("id");
    });

    it("should return 404 for non-existent product", async () => {
      const res = await request(app).get("/api/products/999");
      expect(res.status).toBe(404);
    });
  });

  describe("GET /api/products/:id/variants", () => {
    it("should return product variants", async () => {
      const res = await request(app).get("/api/products/1/variants");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });
});
