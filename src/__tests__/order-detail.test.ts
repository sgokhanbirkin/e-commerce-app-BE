import request from "supertest";
import { app } from "../main";
import { db } from "../db";
import bcrypt from "bcrypt";

describe("Order Detail API", () => {
  let authToken: string;
  let userId: number;
  let orderId: string;
  const testEmail = `testorderdetail${Date.now()}@example.com`;

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

    // Create a test order
    const orderData = {
      items: [{ variantId: 2, quantity: 2 }],
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

    orderId = createOrderResponse.body.id;
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

  describe("GET /api/orders/{orderId}", () => {
    it("should return order details successfully", async () => {
      const response = await request(app)
        .get(`/api/orders/${orderId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("id");
      expect(response.body).toHaveProperty("items");
      expect(response.body).toHaveProperty("total");
      expect(response.body).toHaveProperty("status");
      expect(response.body).toHaveProperty("shippingAddress");
      expect(response.body).toHaveProperty("paymentMethod");
      expect(response.body).toHaveProperty("trackingNumber");
      expect(response.body).toHaveProperty("createdAt");
      expect(response.body).toHaveProperty("updatedAt");

      // Check data types
      expect(typeof response.body.id).toBe("string");
      expect(typeof response.body.total).toBe("number");
      expect(typeof response.body.status).toBe("string");
      expect(typeof response.body.paymentMethod).toBe("string");
      expect(typeof response.body.createdAt).toBe("string");
      expect(typeof response.body.updatedAt).toBe("string");

      // Check items structure
      expect(Array.isArray(response.body.items)).toBe(true);
      if (response.body.items.length > 0) {
        const item = response.body.items[0];
        expect(item).toHaveProperty("id");
        expect(item).toHaveProperty("productId");
        expect(item).toHaveProperty("quantity");
        expect(item).toHaveProperty("product");
        expect(item).toHaveProperty("variantId");

        // Check item data types
        expect(typeof item.id).toBe("string");
        expect(typeof item.productId).toBe("string");
        expect(typeof item.quantity).toBe("number");
        expect(typeof item.variantId).toBe("string");

        // Check product structure
        expect(item.product).toHaveProperty("id");
        expect(item.product).toHaveProperty("title");
        expect(item.product).toHaveProperty("description");
        expect(item.product).toHaveProperty("imageUrl");
        expect(item.product).toHaveProperty("price");

        // Check product data types
        expect(typeof item.product.id).toBe("number");
        expect(typeof item.product.title).toBe("string");
        expect(typeof item.product.description).toBe("string");
        expect(typeof item.product.imageUrl).toBe("string");
        expect(typeof item.product.price).toBe("number");
      }

      // Check shipping address structure
      if (response.body.shippingAddress) {
        expect(response.body.shippingAddress).toHaveProperty("id");
        expect(response.body.shippingAddress).toHaveProperty("label");
        expect(response.body.shippingAddress).toHaveProperty("line1");
        expect(response.body.shippingAddress).toHaveProperty("city");
        expect(response.body.shippingAddress).toHaveProperty("postal");
        expect(response.body.shippingAddress).toHaveProperty("country");

        // Check shipping address data types
        expect(typeof response.body.shippingAddress.id).toBe("number");
        expect(typeof response.body.shippingAddress.label).toBe("string");
        expect(typeof response.body.shippingAddress.line1).toBe("string");
        expect(typeof response.body.shippingAddress.city).toBe("string");
        expect(typeof response.body.shippingAddress.postal).toBe("string");
        expect(typeof response.body.shippingAddress.country).toBe("string");
      }
    });

    it("should return 404 for non-existent order", async () => {
      const response = await request(app)
        .get("/api/orders/999999")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        error: "Order not found",
      });
    });

    it("should return 401 for unauthorized access", async () => {
      const response = await request(app).get(`/api/orders/${orderId}`);

      expect(response.status).toBe(401);
    });

    it("should return 401 for invalid token", async () => {
      const response = await request(app)
        .get(`/api/orders/${orderId}`)
        .set("Authorization", "Bearer invalid-token");

      expect(response.status).toBe(401);
    });

    it("should return 400 for invalid order ID", async () => {
      const response = await request(app)
        .get("/api/orders/invalid")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: "Invalid order ID",
      });
    });

    it("should not allow access to other user's order", async () => {
      // Create another user
      const anotherUser = await db.user.create({
        data: {
          email: `anotheruser${Date.now()}@example.com`,
          passwordHash: await bcrypt.hash("password123", 10),
          name: "Another User",
        },
      });

      // Login as another user
      const anotherUserLogin = await request(app).post("/api/auth/login").send({
        email: anotherUser.email,
        password: "password123",
      });

      const anotherUserToken = anotherUserLogin.body.token;

      // Try to access the first user's order
      const response = await request(app)
        .get(`/api/orders/${orderId}`)
        .set("Authorization", `Bearer ${anotherUserToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        error: "Order not found",
      });

      // Clean up
      await db.user.delete({
        where: { id: anotherUser.id },
      });
    });

    it("should handle orders with multiple items", async () => {
      // Create an order with multiple items
      const multiItemOrderData = {
        items: [
          { variantId: 2, quantity: 2 },
          { variantId: 3, quantity: 1 },
        ],
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

      const createOrderResponse = await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${authToken}`)
        .send(multiItemOrderData);

      expect(createOrderResponse.status).toBe(201);

      const response = await request(app)
        .get(`/api/orders/${createOrderResponse.body.id}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.items.length).toBe(2);
      expect(response.body.total).toBeGreaterThan(0);
    });

    it("should handle orders with different statuses", async () => {
      const response = await request(app)
        .get(`/api/orders/${orderId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("pending");
    });

    it("should return correct total calculation", async () => {
      const orderData = {
        items: [{ variantId: 2, quantity: 3 }], // Price: 109.95 * 3 = 329.85
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
        .get(`/api/orders/${createOrderResponse.body.id}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.total).toBe(329.85); // 109.95 * 3
    });

    it("should return ISO date strings", async () => {
      const response = await request(app)
        .get(`/api/orders/${orderId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);

      // Check that dates are valid ISO strings
      expect(new Date(response.body.createdAt).toISOString()).toBe(
        response.body.createdAt
      );
      expect(new Date(response.body.updatedAt).toISOString()).toBe(
        response.body.updatedAt
      );
    });

    it("should include trackingNumber field (null for now)", async () => {
      const response = await request(app)
        .get(`/api/orders/${orderId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("trackingNumber");
      expect(response.body.trackingNumber).toBeNull();
    });
  });
});
