import request from "supertest";
import { app } from "../main";
import { db } from "../db";
import bcrypt from "bcrypt";

describe("Add to Cart API", () => {
  let authToken: string;
  let userId: number;
  const testEmail = `testaddtocart${Date.now()}@example.com`;

  beforeAll(async () => {
    // Create a test user with properly hashed password
    const password = "password123";
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await db.user.create({
      data: {
        email: testEmail,
        passwordHash: hashedPassword,
        name: "Test User",
        phone: "+90 555 123 4567",
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
    await db.basketItem.deleteMany({
      where: { userId: userId },
    });
    await db.user.delete({
      where: { id: userId },
    });
  });

  it("should add new item to cart successfully", async () => {
    const response = await request(app)
      .post("/api/cart")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        variantId: 62, // iPhone 15 Pro 128GB
        quantity: 2,
      });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      id: expect.any(String),
      productId: "30",
      quantity: 2,
      product: {
        id: 30,
        title: "iPhone 15 Pro",
        description: "Latest iPhone with advanced camera system",
        imageUrl: expect.any(String),
        price: 999.99,
      },
      variantId: "62",
    });
  });

  it("should update quantity when adding existing item", async () => {
    // Add the same item again
    const response = await request(app)
      .post("/api/cart")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        variantId: 62,
        quantity: 3,
      });

    expect(response.status).toBe(201);
    expect(response.body.quantity).toBe(5); // 2 + 3 = 5
    expect(response.body.productId).toBe("30");
    expect(response.body.variantId).toBe("62");
  });

  it("should add different product to cart", async () => {
    const response = await request(app)
      .post("/api/cart")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        variantId: 65, // MacBook Air M3 8GB
        quantity: 1,
      });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      id: expect.any(String),
      productId: "31",
      quantity: 1,
      product: {
        id: 31,
        title: "MacBook Air M3",
        description: "Ultra-thin laptop with M3 chip",
        imageUrl: expect.any(String),
        price: 1199.99,
      },
      variantId: "65",
    });
  });

  it("should return 404 for invalid variant ID", async () => {
    const response = await request(app)
      .post("/api/cart")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        variantId: 999,
        quantity: 1,
      });

    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({
      status: "error",
      message: "Variant not found",
    });
  });

  it("should return 400 for insufficient stock", async () => {
    const response = await request(app)
      .post("/api/cart")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        variantId: 62,
        quantity: 25, // More than available stock
      });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      status: "error",
      message: "Insufficient stock",
    });
  });

  it("should return 401 without authorization", async () => {
    const response = await request(app).post("/api/cart").send({
      variantId: 62,
      quantity: 1,
    });

    expect(response.status).toBe(401);
  });

  it("should return 400 for invalid quantity", async () => {
    const response = await request(app)
      .post("/api/cart")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        variantId: 62,
        quantity: 0,
      });

    expect(response.status).toBe(400);
  });

  it("should return 400 for missing variantId", async () => {
    const response = await request(app)
      .post("/api/cart")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        quantity: 1,
      });

    expect(response.status).toBe(400);
  });

  it("should return 400 for missing quantity", async () => {
    const response = await request(app)
      .post("/api/cart")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        variantId: 62,
      });

    expect(response.status).toBe(400);
  });

  it("should handle negative quantity", async () => {
    const response = await request(app)
      .post("/api/cart")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        variantId: 62,
        quantity: -1,
      });

    expect(response.status).toBe(400);
  });

  it("should handle decimal quantity", async () => {
    const response = await request(app)
      .post("/api/cart")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        variantId: 62,
        quantity: 1.5,
      });

    expect(response.status).toBe(400);
  });

  it("should verify cart contents after adding items", async () => {
    // Clear cart first
    await request(app)
      .delete("/api/basket")
      .set("Authorization", `Bearer ${authToken}`);

    // Add items
    await request(app)
      .post("/api/cart")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        variantId: 62,
        quantity: 2,
      });

    await request(app)
      .post("/api/cart")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        variantId: 65,
        quantity: 1,
      });

    // Get cart and verify
    const getCartResponse = await request(app)
      .get("/api/cart")
      .set("Authorization", `Bearer ${authToken}`);

    expect(getCartResponse.status).toBe(200);
    expect(getCartResponse.body).toHaveLength(2);

    const iphoneItem = getCartResponse.body.find(
      (item: any) => item.product.title === "iPhone 15 Pro"
    );
    expect(iphoneItem).toBeDefined();
    expect(iphoneItem.quantity).toBe(2);

    const macbookItem = getCartResponse.body.find(
      (item: any) => item.product.title === "MacBook Air M3"
    );
    expect(macbookItem).toBeDefined();
    expect(macbookItem.quantity).toBe(1);
  });
});
