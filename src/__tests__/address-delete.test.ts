import request from "supertest";
import { app } from "../main";
import { db } from "../db";
import bcrypt from "bcrypt";

describe("Address Delete API", () => {
  let authToken: string;
  let userId: number;
  let addressId: number;
  const testEmail = `testaddressdelete${Date.now()}@example.com`;

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

  it("should delete address successfully", async () => {
    const response = await request(app)
      .delete(`/api/auth/users/me/address/${addressId}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: "Adres başarıyla silindi",
    });

    // Verify address is deleted by checking user profile
    const profileResponse = await request(app)
      .get("/api/auth/users/me")
      .set("Authorization", `Bearer ${authToken}`);

    expect(profileResponse.status).toBe(200);
    expect(profileResponse.body.addresses).toEqual([]);
  });

  it("should return 404 for non-existent address", async () => {
    const response = await request(app)
      .delete("/api/auth/users/me/address/999")
      .set("Authorization", `Bearer ${authToken}`);

    expect(response.status).toBe(404);
    expect(response.body.error).toBe(
      "Address not found or does not belong to user"
    );
  });

  it("should return 400 for invalid address ID", async () => {
    const response = await request(app)
      .delete("/api/auth/users/me/address/invalid")
      .set("Authorization", `Bearer ${authToken}`);

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Invalid address ID");
  });

  it("should return 401 without authorization", async () => {
    const response = await request(app).delete("/api/auth/users/me/address/1");

    expect(response.status).toBe(401);
  });

  it("should return 404 when trying to delete already deleted address", async () => {
    // Create another address for this test
    const newAddress = await db.address.create({
      data: {
        userId: userId,
        label: "İş",
        line1: "İş Adresi 456",
        city: "Ankara",
        postal: "06000",
        country: "Türkiye",
        phone: "+90 555 123 4567",
      },
    });

    // Delete the address
    const deleteResponse = await request(app)
      .delete(`/api/auth/users/me/address/${newAddress.id}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(deleteResponse.status).toBe(200);

    // Try to delete the same address again
    const secondDeleteResponse = await request(app)
      .delete(`/api/auth/users/me/address/${newAddress.id}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(secondDeleteResponse.status).toBe(404);
    expect(secondDeleteResponse.body.error).toBe(
      "Address not found or does not belong to user"
    );
  });
});
