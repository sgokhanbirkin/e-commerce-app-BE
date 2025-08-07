import request from "supertest";
import { app } from "../main";
import { db } from "../db";
import bcrypt from "bcrypt";

describe("Update Cart Quantity API", () => {
  let authToken: string;
  let userId: number;
  const testEmail = `testupdatecartquantity${Date.now()}@example.com`;

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

  it("should update cart item quantity successfully", async () => {
    // First add an item to the cart
    const addResponse = await request(app)
      .post("/api/cart")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        variantId: 62, // iPhone 15 Pro 128GB
        quantity: 2,
      });

    expect(addResponse.status).toBe(201);
    const itemId = addResponse.body.id;

    // Update the quantity
    const updateResponse = await request(app)
      .patch(`/api/cart/${itemId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        quantity: 5,
      });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body).toMatchObject({
      id: itemId.toString(),
      productId: "30",
      quantity: 5,
      variantId: "62",
      product: {
        id: 30,
        title: "iPhone 15 Pro",
        description: "Latest iPhone with advanced camera system",
        imageUrl: expect.any(String),
        price: 999.99,
      },
    });
  });

  it("should return 404 for non-existent item", async () => {
    const response = await request(app)
      .patch("/api/cart/99999")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        quantity: 3,
      });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: "Cart item not found" });
  });

  it("should return 400 for invalid item ID", async () => {
    const response = await request(app)
      .patch("/api/cart/invalid")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        quantity: 3,
      });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "Invalid item ID" });
  });

  it("should return 400 for invalid quantity (zero)", async () => {
    // First add an item
    const addResponse = await request(app)
      .post("/api/cart")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        variantId: 62,
        quantity: 1,
      });

    const itemId = addResponse.body.id;

    const response = await request(app)
      .patch(`/api/cart/${itemId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        quantity: 0,
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBeDefined();
  });

  it("should return 400 for invalid quantity (negative)", async () => {
    // First add an item
    const addResponse = await request(app)
      .post("/api/cart")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        variantId: 62,
        quantity: 1,
      });

    const itemId = addResponse.body.id;

    const response = await request(app)
      .patch(`/api/cart/${itemId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        quantity: -1,
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBeDefined();
  });

  it("should return 400 for insufficient stock", async () => {
    // First add an item
    const addResponse = await request(app)
      .post("/api/cart")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        variantId: 62,
        quantity: 1,
      });

    const itemId = addResponse.body.id;

    const response = await request(app)
      .patch(`/api/cart/${itemId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        quantity: 25, // More than available stock (20)
      });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "Insufficient stock" });
  });

  it("should return 401 without authorization", async () => {
    const response = await request(app).patch("/api/cart/1").send({
      quantity: 3,
    });

    expect(response.status).toBe(401);
  });

  it("should only allow users to update their own items", async () => {
    // Create another user
    const anotherUser = await db.user.create({
      data: {
        email: `anotheruser${Date.now()}@example.com`,
        passwordHash: await bcrypt.hash("password123", 10),
        name: "Another User",
        phone: "+90 555 123 4567",
      },
    });

    // Login as another user
    const anotherLoginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email: anotherUser.email,
        password: "password123",
      });

    const anotherAuthToken = anotherLoginResponse.body.token;

    // Add item to another user's cart
    const anotherUserItem = await request(app)
      .post("/api/cart")
      .set("Authorization", `Bearer ${anotherAuthToken}`)
      .send({
        variantId: 62,
        quantity: 1,
      });

    // Try to update another user's item with first user's token
    const updateResponse = await request(app)
      .patch(`/api/cart/${anotherUserItem.body.id}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        quantity: 3,
      });

    expect(updateResponse.status).toBe(404);
    expect(updateResponse.body).toEqual({ error: "Cart item not found" });

    // Clean up another user
    await db.basketItem.deleteMany({
      where: { userId: anotherUser.id },
    });
    await db.user.delete({
      where: { id: anotherUser.id },
    });
  });

  it("should handle updating to minimum quantity", async () => {
    // First add an item
    const addResponse = await request(app)
      .post("/api/cart")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        variantId: 62,
        quantity: 5,
      });

    const itemId = addResponse.body.id;

    // Update to minimum quantity
    const updateResponse = await request(app)
      .patch(`/api/cart/${itemId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        quantity: 1,
      });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.quantity).toBe(1);
  });

  it("should handle updating to maximum available stock", async () => {
    // First add an item
    const addResponse = await request(app)
      .post("/api/cart")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        variantId: 62,
        quantity: 1,
      });

    const itemId = addResponse.body.id;

    // Update to maximum available stock (20)
    const updateResponse = await request(app)
      .patch(`/api/cart/${itemId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        quantity: 20,
      });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.quantity).toBe(20);
  });
});
