import request from "supertest";
import { app } from "../main";
import { db } from "../db";
import bcrypt from "bcrypt";

describe("Password Change API", () => {
  let authToken: string;
  let userId: number;
  const testEmail = `testpassword${Date.now()}@example.com`;

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
    // Clean up test user
    await db.user.delete({
      where: { id: userId },
    });
  });

  it("should change password successfully", async () => {
    const passwordData = {
      currentPassword: "password123",
      newPassword: "yeni123456",
      confirmPassword: "yeni123456",
    };

    const response = await request(app)
      .put("/api/auth/users/me/password")
      .set("Authorization", `Bearer ${authToken}`)
      .send(passwordData);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Şifre başarıyla güncellendi");

    // Verify the password was actually changed by trying to login with new password
    const loginResponse = await request(app).post("/api/auth/login").send({
      email: testEmail,
      password: "yeni123456",
    });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body.token).toBeDefined();
  });

  it("should return 400 for incorrect current password", async () => {
    const passwordData = {
      currentPassword: "wrongpassword",
      newPassword: "yeni123456",
      confirmPassword: "yeni123456",
    };

    const response = await request(app)
      .put("/api/auth/users/me/password")
      .set("Authorization", `Bearer ${authToken}`)
      .send(passwordData);

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Current password is incorrect");
  });

  it("should return 400 when passwords do not match", async () => {
    const passwordData = {
      currentPassword: "yeni123456",
      newPassword: "newpassword",
      confirmPassword: "differentpassword",
    };

    const response = await request(app)
      .put("/api/auth/users/me/password")
      .set("Authorization", `Bearer ${authToken}`)
      .send(passwordData);

    expect(response.status).toBe(400);
    expect(response.body.error).toBeDefined();
    expect(response.body.error.confirmPassword).toBeDefined();
  });

  it("should return 400 for password too short", async () => {
    const passwordData = {
      currentPassword: "yeni123456",
      newPassword: "123",
      confirmPassword: "123",
    };

    const response = await request(app)
      .put("/api/auth/users/me/password")
      .set("Authorization", `Bearer ${authToken}`)
      .send(passwordData);

    expect(response.status).toBe(400);
    expect(response.body.error).toBeDefined();
    expect(response.body.error.newPassword).toBeDefined();
  });

  it("should return 400 for missing required fields", async () => {
    const passwordData = {
      currentPassword: "yeni123456",
      // missing newPassword and confirmPassword
    };

    const response = await request(app)
      .put("/api/auth/users/me/password")
      .set("Authorization", `Bearer ${authToken}`)
      .send(passwordData);

    expect(response.status).toBe(400);
    expect(response.body.error).toBeDefined();
  });
});
