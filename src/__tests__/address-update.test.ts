import request from "supertest";
import { app } from "../main";
import { db } from "../db";
import bcrypt from "bcrypt";

describe("Address Update API", () => {
  let authToken: string;
  let userId: number;
  let addressId: number;
  const testEmail = `testaddress${Date.now()}@example.com`;

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
        addresses: {
          create: {
            label: "Ev",
            line1: "Test Address 123",
            city: "İstanbul",
            postal: "34000",
            country: "Türkiye",
            phone: "+90 555 123 4567",
          },
        },
      },
      include: {
        addresses: true,
      },
    });
    userId = user.id;
    addressId = user.addresses[0].id;

    // Login to get token
    const loginResponse = await request(app).post("/api/auth/login").send({
      email: testEmail,
      password: "password123",
    });

    authToken = loginResponse.body.token;
  });

  afterAll(async () => {
    // Clean up test user and address
    await db.address.deleteMany({
      where: { userId: userId },
    });
    await db.user.delete({
      where: { id: userId },
    });
  });

  it("should update address successfully", async () => {
    const updateData = {
      label: "Ev",
      line1: "Atatürk Caddesi No:123",
      line2: "Daire 5",
      city: "İstanbul",
      postal: "34000",
      country: "Türkiye",
      phone: "+90 555 123 4567",
    };

    const response = await request(app)
      .put(`/api/auth/users/me/address/${addressId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send(updateData);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: addressId,
      label: updateData.label,
      line1: updateData.line1,
      line2: updateData.line2,
      city: updateData.city,
      postal: updateData.postal,
      country: updateData.country,
      phone: updateData.phone,
      userId: userId,
    });
  });

  it("should return 404 for non-existent address", async () => {
    const updateData = {
      label: "Ev",
      line1: "Atatürk Caddesi No:123",
      city: "İstanbul",
      postal: "34000",
      country: "Türkiye",
    };

    const response = await request(app)
      .put("/api/auth/users/me/address/999")
      .set("Authorization", `Bearer ${authToken}`)
      .send(updateData);

    expect(response.status).toBe(404);
    expect(response.body.error).toBe(
      "Address not found or does not belong to user"
    );
  });

  it("should return 400 for invalid address ID", async () => {
    const updateData = {
      label: "Ev",
      line1: "Atatürk Caddesi No:123",
      city: "İstanbul",
      postal: "34000",
      country: "Türkiye",
    };

    const response = await request(app)
      .put("/api/auth/users/me/address/invalid")
      .set("Authorization", `Bearer ${authToken}`)
      .send(updateData);

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Invalid address ID");
  });

  it("should return 400 for missing required fields", async () => {
    const updateData = {
      label: "",
      line1: "Atatürk Caddesi No:123",
      city: "İstanbul",
      postal: "34000",
      country: "Türkiye",
    };

    const response = await request(app)
      .put(`/api/auth/users/me/address/${addressId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send(updateData);

    expect(response.status).toBe(400);
    expect(response.body.error).toBeDefined();
    expect(response.body.error.label).toBeDefined();
  });

  it("should return 401 without authorization", async () => {
    const updateData = {
      label: "Ev",
      line1: "Atatürk Caddesi No:123",
      city: "İstanbul",
      postal: "34000",
      country: "Türkiye",
    };

    const response = await request(app)
      .put(`/api/auth/users/me/address/${addressId}`)
      .send(updateData);

    expect(response.status).toBe(401);
  });

  it("should allow partial updates", async () => {
    const updateData = {
      label: "İş",
      line1: "İş Adresi 456",
    };

    const response = await request(app)
      .put(`/api/auth/users/me/address/${addressId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send(updateData);

    expect(response.status).toBe(200);
    expect(response.body.label).toBe(updateData.label);
    expect(response.body.line1).toBe(updateData.line1);
    expect(response.body.city).toBeDefined();
    expect(response.body.postal).toBeDefined();
    expect(response.body.country).toBeDefined();
  });
});
