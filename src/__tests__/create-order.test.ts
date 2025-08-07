import request from "supertest";
import { app } from "../main";
import { db } from "../db";
import bcrypt from "bcrypt";

describe("Create Order API", () => {
  let authToken: string;
  let userId: number;
  const testEmail = `testcreateorder${Date.now()}@example.com`;

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
    await db.orderItem.deleteMany({
      where: {
        order: {
          userId,
        },
      },
    });
    await db.order.deleteMany({
      where: { userId },
    });
    await db.address.deleteMany({
      where: { userId },
    });
    await db.user.delete({
      where: { id: userId },
    });
  });

  describe("POST /api/orders", () => {
    it("should create order successfully", async () => {
      const orderData = {
        items: [
          {
            variantId: 62,
            quantity: 1,
          },
        ],
        shipping: {
          label: "Ev",
          line1: "Atatürk Caddesi No:123",
          line2: "Daire 5",
          city: "İstanbul",
          postal: "34000",
          country: "Türkiye",
          phone: "+90 555 123 4567",
        },
        payment: {
          method: "credit_card",
          cardNumber: "1234567890123456",
          expiryDate: "12/25",
          cvv: "123",
        },
      };

      const response = await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${authToken}`)
        .send(orderData);

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        id: expect.any(String),
        items: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            productId: expect.any(String),
            quantity: 1,
            product: expect.objectContaining({
              id: expect.any(Number),
              title: expect.any(String),
              description: expect.any(String),
              imageUrl: expect.any(String),
              price: expect.any(Number),
            }),
            variantId: expect.any(String),
          }),
        ]),
        total: expect.any(Number),
        status: "pending",
        createdAt: expect.any(String),
      });
    });

    it("should return 400 for empty items array", async () => {
      const orderData = {
        items: [],
        shipping: {
          label: "Ev",
          line1: "Atatürk Caddesi No:123",
          city: "İstanbul",
          postal: "34000",
          country: "Türkiye",
        },
        payment: {
          method: "credit_card",
        },
      };

      const response = await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${authToken}`)
        .send(orderData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
    });

    it("should return 404 for invalid variant ID", async () => {
      const orderData = {
        items: [
          {
            variantId: 999,
            quantity: 1,
          },
        ],
        shipping: {
          label: "Ev",
          line1: "Atatürk Caddesi No:123",
          city: "İstanbul",
          postal: "34000",
          country: "Türkiye",
        },
        payment: {
          method: "credit_card",
        },
      };

      const response = await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${authToken}`)
        .send(orderData);

      expect(response.status).toBe(404);
      expect(response.body).toMatchObject({
        status: "error",
        message: expect.stringContaining("Variant 999 not found"),
      });
    });

    it("should return 400 for insufficient stock", async () => {
      const orderData = {
        items: [
          {
            variantId: 62,
            quantity: 25,
          },
        ],
        shipping: {
          label: "Ev",
          line1: "Atatürk Caddesi No:123",
          city: "İstanbul",
          postal: "34000",
          country: "Türkiye",
        },
        payment: {
          method: "credit_card",
        },
      };

      const response = await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${authToken}`)
        .send(orderData);

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        status: "error",
        message: expect.stringContaining("Insufficient stock"),
      });
    });

    it("should return 401 for unauthorized access", async () => {
      const orderData = {
        items: [
          {
            variantId: 62,
            quantity: 1,
          },
        ],
        shipping: {
          label: "Ev",
          line1: "Atatürk Caddesi No:123",
          city: "İstanbul",
          postal: "34000",
          country: "Türkiye",
        },
        payment: {
          method: "credit_card",
        },
      };

      const response = await request(app).post("/api/orders").send(orderData);

      expect(response.status).toBe(401);
    });

    it("should create order with multiple items", async () => {
      const orderData = {
        items: [
          {
            variantId: 62,
            quantity: 1,
          },
          {
            variantId: 63,
            quantity: 2,
          },
        ],
        shipping: {
          label: "İş",
          line1: "Levent Mahallesi No:456",
          city: "İstanbul",
          postal: "34330",
          country: "Türkiye",
        },
        payment: {
          method: "credit_card",
        },
      };

      const response = await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${authToken}`)
        .send(orderData);

      expect(response.status).toBe(201);
      expect(response.body.items).toHaveLength(2);
      expect(response.body.total).toBeGreaterThan(0);
    });

    it("should reuse existing address if it matches", async () => {
      // First, create an order with a specific address
      const orderData1 = {
        items: [
          {
            variantId: 62,
            quantity: 1,
          },
        ],
        shipping: {
          label: "Ev",
          line1: "Test Address 123",
          city: "Test City",
          postal: "12345",
          country: "Test Country",
        },
        payment: {
          method: "credit_card",
        },
      };

      await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${authToken}`)
        .send(orderData1);

      // Create another order with the same address
      const orderData2 = {
        items: [
          {
            variantId: 63,
            quantity: 1,
          },
        ],
        shipping: {
          label: "Ev",
          line1: "Test Address 123",
          city: "Test City",
          postal: "12345",
          country: "Test Country",
        },
        payment: {
          method: "credit_card",
        },
      };

      const response = await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${authToken}`)
        .send(orderData2);

      expect(response.status).toBe(201);

      // Verify that only one address was created for this user
      const addresses = await db.address.findMany({
        where: {
          userId,
          label: "Ev",
          line1: "Test Address 123",
        },
      });

      expect(addresses).toHaveLength(1);
    });
  });
});
