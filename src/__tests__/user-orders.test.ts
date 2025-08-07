import request from "supertest";
import { app } from "../main";
import { db } from "../db";
import bcrypt from "bcrypt";

// Declare setTimeout for test environment
declare const setTimeout: (
  callback: (...args: any[]) => void,
  ms: number
) => number;

describe("User Orders API", () => {
  let authToken: string;
  let userId: number;
  const testEmail = `testuserorders${Date.now()}@example.com`;

  beforeAll(async () => {
    // Create a test user
    const password = "password123";
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await db.user.create({
      data: {
        email: testEmail,
        passwordHash: hashedPassword,
        name: "Test User",
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
    await db.orderItem.deleteMany({
      where: {
        order: {
          userId: userId,
        },
      },
    });
    await db.order.deleteMany({
      where: { userId: userId },
    });
    await db.address.deleteMany({
      where: { userId: userId },
    });
    await db.user.delete({
      where: { id: userId },
    });
  });

  describe("GET /api/users/me/orders", () => {
    it("should return empty array when user has no orders", async () => {
      const response = await request(app)
        .get("/api/users/me/orders")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it("should return user's order history", async () => {
      // Create a test order
      const orderData = {
        items: [{ variantId: 1, quantity: 2 }],
        shipping: {
          label: "Home",
          line1: "123 Test St",
          city: "Istanbul",
          postal: "34000",
          country: "Turkey",
        },
        payment: {
          method: "credit_card",
        },
      };

      const createOrderResponse = await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${authToken}`)
        .send(orderData);

      expect(createOrderResponse.status).toBe(201);

      // Get order history
      const response = await request(app)
        .get("/api/users/me/orders")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);

      const order = response.body[0];
      expect(order).toHaveProperty("id");
      expect(order).toHaveProperty("items");
      expect(order).toHaveProperty("total");
      expect(order).toHaveProperty("status");
      expect(order).toHaveProperty("shippingAddress");
      expect(order).toHaveProperty("paymentMethod");
      expect(order).toHaveProperty("createdAt");
      expect(order).toHaveProperty("updatedAt");

      // Check items structure
      expect(Array.isArray(order.items)).toBe(true);
      if (order.items.length > 0) {
        const item = order.items[0];
        expect(item).toHaveProperty("id");
        expect(item).toHaveProperty("productId");
        expect(item).toHaveProperty("quantity");
        expect(item).toHaveProperty("product");
        expect(item).toHaveProperty("variantId");

        // Check product structure
        expect(item.product).toHaveProperty("id");
        expect(item.product).toHaveProperty("title");
        expect(item.product).toHaveProperty("description");
        expect(item.product).toHaveProperty("imageUrl");
        expect(item.product).toHaveProperty("price");
      }

      // Check shipping address structure
      if (order.shippingAddress) {
        expect(order.shippingAddress).toHaveProperty("id");
        expect(order.shippingAddress).toHaveProperty("label");
        expect(order.shippingAddress).toHaveProperty("line1");
        expect(order.shippingAddress).toHaveProperty("city");
        expect(order.shippingAddress).toHaveProperty("postal");
        expect(order.shippingAddress).toHaveProperty("country");
      }
    });

    it("should return 401 for unauthorized access", async () => {
      const response = await request(app).get("/api/users/me/orders");

      expect(response.status).toBe(401);
    });

    it("should return 401 for invalid token", async () => {
      const response = await request(app)
        .get("/api/users/me/orders")
        .set("Authorization", "Bearer invalid-token");

      expect(response.status).toBe(401);
    });

    it("should return orders sorted by creation date (newest first)", async () => {
      // Create multiple orders
      const orderData1 = {
        items: [{ variantId: 2, quantity: 1 }],
        shipping: {
          label: "Home",
          line1: "123 Test St",
          city: "Istanbul",
          postal: "34000",
          country: "Turkey",
        },
        payment: {
          method: "credit_card",
        },
      };

      const orderData2 = {
        items: [{ variantId: 3, quantity: 1 }],
        shipping: {
          label: "Work",
          line1: "456 Business Ave",
          city: "Ankara",
          postal: "06000",
          country: "Turkey",
        },
        payment: {
          method: "credit_card",
        },
      };

      // Create first order
      await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${authToken}`)
        .send(orderData1);

      // Wait a bit to ensure different timestamps
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Create second order
      await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${authToken}`)
        .send(orderData2);

      // Get order history
      const response = await request(app)
        .get("/api/users/me/orders")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.length).toBeGreaterThanOrEqual(2);

      // Check that orders are sorted by creation date (newest first)
      const orders = response.body;
      for (let i = 0; i < orders.length - 1; i++) {
        const currentOrder = new Date(orders[i].createdAt);
        const nextOrder = new Date(orders[i + 1].createdAt);
        expect(currentOrder.getTime()).toBeGreaterThanOrEqual(
          nextOrder.getTime()
        );
      }
    });

    it("should handle orders with multiple items", async () => {
      const orderData = {
        items: [
          { variantId: 1, quantity: 2 },
          { variantId: 2, quantity: 1 },
        ],
        shipping: {
          label: "Home",
          line1: "123 Test St",
          city: "Istanbul",
          postal: "34000",
          country: "Turkey",
        },
        payment: {
          method: "credit_card",
        },
      };

      const createOrderResponse = await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${authToken}`)
        .send(orderData);

      expect(createOrderResponse.status).toBe(201);

      const response = await request(app)
        .get("/api/users/me/orders")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      const order = response.body.find(
        (o: any) => o.id === createOrderResponse.body.id
      );
      expect(order).toBeDefined();
      expect(order.items.length).toBe(2);
    });

    it("should handle orders with different statuses", async () => {
      const orderData = {
        items: [{ variantId: 1, quantity: 1 }],
        shipping: {
          label: "Home",
          line1: "123 Test St",
          city: "Istanbul",
          postal: "34000",
          country: "Turkey",
        },
        payment: {
          method: "credit_card",
        },
      };

      const createOrderResponse = await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${authToken}`)
        .send(orderData);

      expect(createOrderResponse.status).toBe(201);

      const response = await request(app)
        .get("/api/users/me/orders")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      const order = response.body.find(
        (o: any) => o.id === createOrderResponse.body.id
      );
      expect(order).toBeDefined();
      expect(order.status).toBe("pending");
    });

    it("should return correct total calculation", async () => {
      const orderData = {
        items: [{ variantId: 1, quantity: 3 }], // Price: 109.95 * 3 = 329.85
        shipping: {
          label: "Home",
          line1: "123 Test St",
          city: "Istanbul",
          postal: "34000",
          country: "Turkey",
        },
        payment: {
          method: "credit_card",
        },
      };

      const createOrderResponse = await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${authToken}`)
        .send(orderData);

      expect(createOrderResponse.status).toBe(201);

      const response = await request(app)
        .get("/api/users/me/orders")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      const order = response.body.find(
        (o: any) => o.id === createOrderResponse.body.id
      );
      expect(order).toBeDefined();
      expect(order.total).toBe(329.85);
    });
  });
});
