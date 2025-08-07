import request from "supertest";
import { app } from "../main";
import { db } from "../db";
import bcrypt from "bcrypt";

describe("Get Cart API", () => {
  let authToken: string;
  let userId: number;
  const testEmail = `testgetcart${Date.now()}@example.com`;

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

  it("should return empty cart when no items", async () => {
    const response = await request(app)
      .get("/api/cart")
      .set("Authorization", `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  it("should return cart items in correct format", async () => {
    // Add items to cart
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

    // Get cart
    const getCartResponse = await request(app)
      .get("/api/cart")
      .set("Authorization", `Bearer ${authToken}`);

    expect(getCartResponse.status).toBe(200);
    expect(Array.isArray(getCartResponse.body)).toBe(true);
    expect(getCartResponse.body).toHaveLength(2);

    // Check first item format
    const firstItem = getCartResponse.body[0];
    expect(firstItem).toMatchObject({
      id: expect.any(String),
      productId: expect.any(String),
      quantity: expect.any(Number),
      product: {
        id: expect.any(Number),
        title: expect.any(String),
        description: expect.any(String),
        imageUrl: expect.any(String),
        price: expect.any(Number),
      },
      variantId: expect.any(String),
    });

    // Check second item format
    const secondItem = getCartResponse.body[1];
    expect(secondItem).toMatchObject({
      id: expect.any(String),
      productId: expect.any(String),
      quantity: expect.any(Number),
      product: {
        id: expect.any(Number),
        title: expect.any(String),
        description: expect.any(String),
        imageUrl: expect.any(String),
        price: expect.any(Number),
      },
      variantId: expect.any(String),
    });

    // Verify specific values
    const iphoneItem = getCartResponse.body.find(
      (item: any) => item.product.title === "iPhone 15 Pro"
    );
    expect(iphoneItem).toBeDefined();
    expect(iphoneItem.quantity).toBe(2);
    expect(iphoneItem.product.price).toBe(999.99);

    const macbookItem = getCartResponse.body.find(
      (item: any) => item.product.title === "MacBook Air M3"
    );
    expect(macbookItem).toBeDefined();
    expect(macbookItem.quantity).toBe(1);
    expect(macbookItem.product.price).toBe(1199.99);
  });

  it("should return 401 without authorization", async () => {
    const response = await request(app).get("/api/cart");

    expect(response.status).toBe(401);
  });

  it("should only return user's own cart items", async () => {
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
    await request(app)
      .post("/api/cart")
      .set("Authorization", `Bearer ${anotherAuthToken}`)
      .send({
        variantId: 62,
        quantity: 3,
      });

    // Get cart with first user's token
    const getCartResponse = await request(app)
      .get("/api/cart")
      .set("Authorization", `Bearer ${authToken}`);

    expect(getCartResponse.status).toBe(200);

    // Should not contain the other user's items
    const otherUserItems = getCartResponse.body.filter(
      (item: any) => item.quantity === 3
    );
    expect(otherUserItems).toHaveLength(0);

    // Clean up another user
    await db.basketItem.deleteMany({
      where: { userId: anotherUser.id },
    });
    await db.user.delete({
      where: { id: anotherUser.id },
    });
  });

  it("should handle cart with single item", async () => {
    // Clear cart first
    await request(app)
      .delete("/api/basket")
      .set("Authorization", `Bearer ${authToken}`);

    // Add single item
    await request(app)
      .post("/api/cart")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        variantId: 62,
        quantity: 1,
      });

    // Get cart
    const response = await request(app)
      .get("/api/cart")
      .set("Authorization", `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toMatchObject({
      id: expect.any(String),
      productId: "30",
      quantity: 1,
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

  it("should handle cart with multiple items of same product", async () => {
    // Clear cart first
    await request(app)
      .delete("/api/basket")
      .set("Authorization", `Bearer ${authToken}`);

    // Add same product multiple times
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
        variantId: 62,
        quantity: 3,
      });

    // Get cart
    const response = await request(app)
      .get("/api/cart")
      .set("Authorization", `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1); // Should be combined into one item
    expect(response.body[0].quantity).toBe(5); // 2 + 3 = 5
  });
});
