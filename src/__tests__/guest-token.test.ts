import request from "supertest";
import { app } from "../main";
import { db } from "../db";

describe("Guest Token System", () => {
  let guestToken: string;
  let guestId: string;

  beforeAll(async () => {
    // Test veritabanını temizle - doğru sırayla
    await db.basketItem.deleteMany();
    await db.orderItem.deleteMany();
    await db.order.deleteMany();
    await db.review.deleteMany();
    await db.productVariant.deleteMany();
    await db.product.deleteMany();
    await db.category.deleteMany();
  });

  afterAll(async () => {
    await db.$disconnect();
  });

  describe("POST /api/auth/guest", () => {
    it("should create a guest token", async () => {
      const response = await request(app).post("/api/auth/guest").expect(201);

      expect(response.body).toHaveProperty("token");
      expect(response.body).toHaveProperty("guestId");
      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toBe("Guest token created successfully");

      guestToken = response.body.token;
      guestId = response.body.guestId;
    });
  });

  describe("Cart operations with guest token", () => {
    let testVariantId: number;

    beforeAll(async () => {
      // Test için ürün ve variant oluştur
      const category = await db.category.create({
        data: { name: "Test Category" },
      });

      const product = await db.product.create({
        data: {
          title: "Test Product",
          description: "Test Description",
          price: 100,
          categoryId: category.id,
        },
      });

      const variant = await db.productVariant.create({
        data: {
          productId: product.id,
          sku: "TEST-SKU-001",
          attribute: "size",
          value: "M",
          stock: 10,
          priceDiff: 0,
        },
      });

      testVariantId = variant.id;
    });

    it("should add item to cart with guest token", async () => {
      const response = await request(app)
        .post("/api/cart")
        .set("Authorization", `Bearer ${guestToken}`)
        .send({
          variantId: testVariantId,
          quantity: 2,
        })
        .expect(201);

      expect(response.body).toHaveProperty("id");
      expect(response.body).toHaveProperty("variantId", testVariantId);
      expect(response.body).toHaveProperty("quantity", 2);
      expect(response.body).toHaveProperty("guestId", guestId);
    });

    it("should get cart items with guest token", async () => {
      const response = await request(app)
        .get("/api/cart")
        .set("Authorization", `Bearer ${guestToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty("guestId", guestId);
    });

    it("should remove item from cart with guest token", async () => {
      // Önce sepeti al
      const cartResponse = await request(app)
        .get("/api/cart")
        .set("Authorization", `Bearer ${guestToken}`);

      const itemId = cartResponse.body[0].id;

      await request(app)
        .delete(`/api/cart/${itemId}`)
        .set("Authorization", `Bearer ${guestToken}`)
        .expect(204);
    });

    it("should reject cart operations without token", async () => {
      await request(app)
        .post("/api/cart")
        .send({
          variantId: testVariantId,
          quantity: 1,
        })
        .expect(401);
    });
  });
});
