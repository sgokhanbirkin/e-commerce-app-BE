import request from "supertest";
import { app } from "../main";
import { db } from "../db";
import bcrypt from "bcrypt";

describe("Clear Cart API", () => {
  let authToken: string;
  let userId: number;
  const testEmail = `testclearcart${Date.now()}@example.com`;

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

  it("should clear cart successfully", async () => {
    // First add some items to the cart
    await request(app)
      .post("/api/basket")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        variantId: 62, // iPhone 15 Pro 128GB
        quantity: 2,
      });

    await request(app)
      .post("/api/basket")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        variantId: 65, // MacBook Air M3 8GB
        quantity: 1,
      });

    // Verify cart has items
    const cartBeforeResponse = await request(app)
      .get("/api/basket")
      .set("Authorization", `Bearer ${authToken}`);

    expect(cartBeforeResponse.status).toBe(200);
    expect(cartBeforeResponse.body).toHaveLength(2);

    // Clear the cart
    const clearResponse = await request(app)
      .delete("/api/basket")
      .set("Authorization", `Bearer ${authToken}`);

    expect(clearResponse.status).toBe(204);

    // Verify cart is empty
    const cartAfterResponse = await request(app)
      .get("/api/basket")
      .set("Authorization", `Bearer ${authToken}`);

    expect(cartAfterResponse.status).toBe(200);
    expect(cartAfterResponse.body).toHaveLength(0);
  });

  it("should return 204 even when cart is already empty", async () => {
    // Clear an already empty cart
    const response = await request(app)
      .delete("/api/basket")
      .set("Authorization", `Bearer ${authToken}`);

    expect(response.status).toBe(204);
  });

  it("should return 401 without authorization", async () => {
    const response = await request(app).delete("/api/basket");

    expect(response.status).toBe(401);
  });

  it("should clear only the user's own cart", async () => {
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
    await request(app)
      .post("/api/basket")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        variantId: 62,
        quantity: 1,
      });

    await request(app)
      .post("/api/basket")
      .set("Authorization", `Bearer ${anotherAuthToken}`)
      .send({
        variantId: 65,
        quantity: 1,
      });

    // Clear first user's cart
    await request(app)
      .delete("/api/basket")
      .set("Authorization", `Bearer ${authToken}`);

    // Check that first user's cart is empty
    const firstUserCart = await request(app)
      .get("/api/basket")
      .set("Authorization", `Bearer ${authToken}`);

    expect(firstUserCart.body).toHaveLength(0);

    // Check that second user's cart still has items
    const secondUserCart = await request(app)
      .get("/api/basket")
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
});
