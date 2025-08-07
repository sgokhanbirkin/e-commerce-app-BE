import request from "supertest";
import { app } from "../main";
import { db } from "../db";
import bcrypt from "bcrypt";

describe("User Profile API", () => {
  let authToken: string;
  let userId: number;
  const testEmail = `testuserprofile${Date.now()}@example.com`;

  beforeAll(async () => {
    // Create a test user with properly hashed password
    const password = "password123";
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await db.user.create({
      data: {
        email: testEmail,
        passwordHash: hashedPassword,
        name: "John Doe",
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
    await db.user.delete({
      where: { id: userId },
    });
  });

  describe("GET /api/users/me", () => {
    it("should return user profile successfully", async () => {
      const response = await request(app)
        .get("/api/users/me")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: userId.toString(),
        email: testEmail,
        firstName: "John",
        lastName: "Doe",
        avatar: null,
        phone: "+90 555 123 4567",
        dateOfBirth: null,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });

    it("should return 401 for unauthorized access", async () => {
      const response = await request(app).get("/api/users/me");

      expect(response.status).toBe(401);
    });

    it("should return 401 for invalid token", async () => {
      const response = await request(app)
        .get("/api/users/me")
        .set("Authorization", "Bearer invalid-token");

      expect(response.status).toBe(401);
    });

    it("should handle user with no name", async () => {
      // Create a user without a name
      const emailNoName = `testnoname${Date.now()}@example.com`;
      const userWithoutName = await db.user.create({
        data: {
          email: emailNoName,
          passwordHash: await bcrypt.hash("password123", 10),
        },
      });

      const loginResponse = await request(app).post("/api/auth/login").send({
        email: emailNoName,
        password: "password123",
      });

      const response = await request(app)
        .get("/api/users/me")
        .set("Authorization", `Bearer ${loginResponse.body.token}`);

      expect(response.status).toBe(200);
      expect(response.body.firstName).toBe("");
      expect(response.body.lastName).toBe("");

      // Clean up
      await db.user.delete({ where: { id: userWithoutName.id } });
    });

    it("should handle user with single name", async () => {
      // Create a user with only first name
      const emailSingleName = `testsingle${Date.now()}@example.com`;
      const userWithSingleName = await db.user.create({
        data: {
          email: emailSingleName,
          passwordHash: await bcrypt.hash("password123", 10),
          name: "John",
        },
      });

      const loginResponse = await request(app).post("/api/auth/login").send({
        email: emailSingleName,
        password: "password123",
      });

      const response = await request(app)
        .get("/api/users/me")
        .set("Authorization", `Bearer ${loginResponse.body.token}`);

      expect(response.status).toBe(200);
      expect(response.body.firstName).toBe("John");
      expect(response.body.lastName).toBe("");

      // Clean up
      await db.user.delete({ where: { id: userWithSingleName.id } });
    });
  });

  describe("PUT /api/users/me", () => {
    it("should update user profile successfully", async () => {
      const updateData = {
        firstName: "Jane",
        lastName: "Smith",
        phone: "+90 555 987 6543",
        dateOfBirth: "1985-06-20T00:00:00.000Z",
      };

      const response = await request(app)
        .put("/api/users/me")
        .set("Authorization", `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: userId.toString(),
        email: testEmail,
        firstName: "Jane",
        lastName: "Smith",
        avatar: null,
        phone: "+90 555 987 6543",
        dateOfBirth: "1985-06-20T00:00:00.000Z",
        updatedAt: expect.any(String),
      });
    });

    it("should update only firstName", async () => {
      const updateData = {
        firstName: "Michael",
      };

      const response = await request(app)
        .put("/api/users/me")
        .set("Authorization", `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.firstName).toBe("Michael");
      expect(response.body.lastName).toBe("Smith"); // Should remain unchanged
    });

    it("should update only lastName", async () => {
      const updateData = {
        lastName: "Johnson",
      };

      const response = await request(app)
        .put("/api/users/me")
        .set("Authorization", `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.firstName).toBe("Michael"); // Should remain unchanged
      expect(response.body.lastName).toBe("Johnson");
    });

    it("should update only phone", async () => {
      const updateData = {
        phone: "+90 555 111 2222",
      };

      const response = await request(app)
        .put("/api/users/me")
        .set("Authorization", `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.phone).toBe("+90 555 111 2222");
    });

    it("should update only dateOfBirth", async () => {
      const updateData = {
        dateOfBirth: "1995-12-25T00:00:00.000Z",
      };

      const response = await request(app)
        .put("/api/users/me")
        .set("Authorization", `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.dateOfBirth).toBe("1995-12-25T00:00:00.000Z");
    });

    it("should return 401 for unauthorized access", async () => {
      const updateData = {
        firstName: "Test",
      };

      const response = await request(app).put("/api/users/me").send(updateData);

      expect(response.status).toBe(401);
    });

    it("should return 400 for invalid dateOfBirth format", async () => {
      const updateData = {
        dateOfBirth: "invalid-date",
      };

      const response = await request(app)
        .put("/api/users/me")
        .set("Authorization", `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(400);
    });

    it("should handle empty request body", async () => {
      const response = await request(app)
        .put("/api/users/me")
        .set("Authorization", `Bearer ${authToken}`)
        .send({});

      expect(response.status).toBe(200);
      // Should return current user data without changes
      expect(response.body.id).toBe(userId.toString());
    });

    it("should handle partial updates correctly", async () => {
      // First, update with some data
      await request(app)
        .put("/api/users/me")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          firstName: "Alice",
          lastName: "Brown",
        });

      // Then update only phone
      const response = await request(app)
        .put("/api/users/me")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          phone: "+90 555 999 8888",
        });

      expect(response.status).toBe(200);
      expect(response.body.firstName).toBe("Alice"); // Should remain from previous update
      expect(response.body.lastName).toBe("Brown"); // Should remain from previous update
      expect(response.body.phone).toBe("+90 555 999 8888"); // Should be updated
    });
  });
});
