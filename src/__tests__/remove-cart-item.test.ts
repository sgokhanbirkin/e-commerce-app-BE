import request from "supertest";
import { app } from "../main";
import { db } from "../db";
import bcrypt from "bcrypt";

describe("Remove Cart Item API", () => {
  let authToken: string;
  let userId: number;
  const testEmail = `testremovecartitem${Date.now()}@example.com`;

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

  it("should remove cart item successfully", async () => {
    // First add items to the cart
    const addItem1Response = await request(app)
      .post("/api/cart")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        variantId: 62, // iPhone 15 Pro 128GB
        quantity: 2,
      });

    const addItem2Response = await request(app)
      .post("/api/cart")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        variantId: 65, // MacBook Air M3 8GB
        quantity: 1,
      });

    expect(addItem1Response.status).toBe(201);
    expect(addItem2Response.status).toBe(201);

    const item1Id = addItem1Response.body.id;
    const item2Id = addItem2Response.body.id;

    // Verify cart has items
    const cartBeforeResponse = await request(app)
      .get("/api/cart")
      .set("Authorization", `Bearer ${authToken}`);

    expect(cartBeforeResponse.status).toBe(200);
    expect(cartBeforeResponse.body).toHaveLength(2);

    // Remove the first item
    const removeResponse = await request(app)
      .delete(`/api/cart/${item1Id}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(removeResponse.status).toBe(204);

    // Verify item was removed
    const cartAfterResponse = await request(app)
      .get("/api/cart")
      .set("Authorization", `Bearer ${authToken}`);

    expect(cartAfterResponse.status).toBe(200);
    expect(cartAfterResponse.body).toHaveLength(1);
    expect(cartAfterResponse.body[0].id).toBe(item2Id);
  });

  it("should return 404 for non-existent item", async () => {
    const response = await request(app)
      .delete("/api/cart/99999")
      .set("Authorization", `Bearer ${authToken}`);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: "Cart item not found" });
  });

  it("should return 400 for invalid item ID", async () => {
    const response = await request(app)
      .delete("/api/cart/invalid")
      .set("Authorization", `Bearer ${authToken}`);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "Invalid item ID" });
  });

  it("should return 401 without authorization", async () => {
    const response = await request(app).delete("/api/cart/1");

    expect(response.status).toBe(401);
  });

  it("should only allow users to remove their own items", async () => {
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

    // Add items to both users' carts
    const firstUserItem = await request(app)
      .post("/api/cart")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        variantId: 62,
        quantity: 1,
      });

    const secondUserItem = await request(app)
      .post("/api/cart")
      .set("Authorization", `Bearer ${anotherAuthToken}`)
      .send({
        variantId: 65,
        quantity: 1,
      });

    // Try to remove second user's item with first user's token
    const removeResponse = await request(app)
      .delete(`/api/cart/${secondUserItem.body.id}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(removeResponse.status).toBe(404);
    expect(removeResponse.body).toEqual({ error: "Cart item not found" });

    // Verify second user's item still exists
    const secondUserCart = await request(app)
      .get("/api/cart")
      .set("Authorization", `Bearer ${anotherAuthToken}`);

    expect(secondUserCart.body).toHaveLength(1);

    // Clean up another user
    await db.basketItem.deleteMany({
      where: { userId: anotherUser.id },
    });
    await db.user.delete({
      where: { id: anotherUser.id },
    });
  });

  it("should handle removing the last item from cart", async () => {
    // First clear any existing items
    await request(app)
      .delete("/api/basket")
      .set("Authorization", `Bearer ${authToken}`);

    // Add one item
    const addResponse = await request(app)
      .post("/api/cart")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        variantId: 62,
        quantity: 1,
      });

    expect(addResponse.status).toBe(201);
    const itemId = addResponse.body.id;

    // Remove the item
    const removeResponse = await request(app)
      .delete(`/api/cart/${itemId}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(removeResponse.status).toBe(204);

    // Verify cart is empty
    const cartResponse = await request(app)
      .get("/api/cart")
      .set("Authorization", `Bearer ${authToken}`);

    expect(cartResponse.status).toBe(200);
    expect(cartResponse.body).toHaveLength(0);
  });
});
