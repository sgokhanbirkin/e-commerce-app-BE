import request from "supertest";
import { app } from "../main";
import { db } from "../db";
import bcrypt from "bcrypt";

describe("Password Update API", () => {
  let authToken: string;
  let userId: number;
  const testEmail = `testpasswordupdate${Date.now()}@example.com`;

  beforeAll(async () => {
    // Create a test user with properly hashed password
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
    await db.user.delete({
      where: { id: userId },
    });
  });

  describe("PUT /api/auth/users/me/password", () => {
    it("should update password successfully", async () => {
      const updateData = {
        currentPassword: "password123",
        newPassword: "newpassword123",
      };

      const response = await request(app)
        .put("/api/auth/users/me/password")
        .set("Authorization", `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: "Password updated successfully",
      });

      // Verify the password was actually updated by trying to login with new password
      const loginResponse = await request(app).post("/api/auth/login").send({
        email: testEmail,
        password: "newpassword123",
      });

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body).toHaveProperty("token");

      // Update the auth token for subsequent tests
      authToken = loginResponse.body.token;
    });

    it("should return 400 for incorrect current password", async () => {
      const updateData = {
        currentPassword: "wrongpassword",
        newPassword: "newpassword456",
      };

      const response = await request(app)
        .put("/api/auth/users/me/password")
        .set("Authorization", `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: "Current password is incorrect",
      });
    });

    it("should return 400 for password too short", async () => {
      const updateData = {
        currentPassword: "newpassword123",
        newPassword: "123",
      };

      const response = await request(app)
        .put("/api/auth/users/me/password")
        .set("Authorization", `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(400);
      expect(response.body.error).toHaveProperty("newPassword");
      expect(response.body.error.newPassword._errors).toContain(
        "New password must be at least 6 characters long"
      );
    });

    it("should return 400 for missing current password", async () => {
      const updateData = {
        newPassword: "newpassword456",
      };

      const response = await request(app)
        .put("/api/auth/users/me/password")
        .set("Authorization", `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(400);
      expect(response.body.error).toHaveProperty("currentPassword");
    });

    it("should return 400 for missing new password", async () => {
      const updateData = {
        currentPassword: "newpassword123",
      };

      const response = await request(app)
        .put("/api/auth/users/me/password")
        .set("Authorization", `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(400);
      expect(response.body.error).toHaveProperty("newPassword");
    });

    it("should return 401 for unauthorized access", async () => {
      const updateData = {
        currentPassword: "password123",
        newPassword: "newpassword456",
      };

      const response = await request(app)
        .put("/api/auth/users/me/password")
        .send(updateData);

      expect(response.status).toBe(401);
    });

    it("should return 401 for invalid token", async () => {
      const updateData = {
        currentPassword: "password123",
        newPassword: "newpassword456",
      };

      const response = await request(app)
        .put("/api/auth/users/me/password")
        .set("Authorization", "Bearer invalid-token")
        .send(updateData);

      expect(response.status).toBe(401);
    });

    it("should handle empty request body", async () => {
      const response = await request(app)
        .put("/api/auth/users/me/password")
        .set("Authorization", `Bearer ${authToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toHaveProperty("currentPassword");
      expect(response.body.error).toHaveProperty("newPassword");
    });

    it("should allow password with exactly 6 characters", async () => {
      const updateData = {
        currentPassword: "newpassword123",
        newPassword: "123456",
      };

      const response = await request(app)
        .put("/api/auth/users/me/password")
        .set("Authorization", `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: "Password updated successfully",
      });

      // Verify the password was actually updated
      const loginResponse = await request(app).post("/api/auth/login").send({
        email: testEmail,
        password: "123456",
      });

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body).toHaveProperty("token");

      // Update the auth token for subsequent tests
      authToken = loginResponse.body.token;
    });

    it("should allow password with special characters", async () => {
      const updateData = {
        currentPassword: "123456",
        newPassword: "P@ssw0rd!",
      };

      const response = await request(app)
        .put("/api/auth/users/me/password")
        .set("Authorization", `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: "Password updated successfully",
      });

      // Verify the password was actually updated
      const loginResponse = await request(app).post("/api/auth/login").send({
        email: testEmail,
        password: "P@ssw0rd!",
      });

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body).toHaveProperty("token");
    });
  });
});
