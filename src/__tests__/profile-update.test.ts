import request from "supertest";
import { app } from "../main";
import { db } from "../db";
import bcrypt from "bcrypt";

describe("Profile Update API", () => {
  let authToken: string;
  let userId: number;
  const testEmail = `testprofile${Date.now()}@example.com`;

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

  it("should update user profile successfully", async () => {
    const updateData = {
      name: "Gökhan Birkin",
      email: `gokhan${Date.now()}@birkinapps.com`,
      phone: "+90 555 123 4567",
    };

    const response = await request(app)
      .put("/api/auth/users/me")
      .set("Authorization", `Bearer ${authToken}`)
      .send(updateData);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: userId,
      name: updateData.name,
      email: updateData.email,
      phone: updateData.phone,
    });
    expect(response.body.createdAt).toBeDefined();
  });

  it("should return 400 for duplicate email", async () => {
    // Create another user with the email we want to use
    const password = "password123";
    const hashedPassword = await bcrypt.hash(password, 10);
    const duplicateEmail = `duplicate${Date.now()}@example.com`;

    const duplicateUser = await db.user.create({
      data: {
        email: duplicateEmail,
        passwordHash: hashedPassword,
        name: "Another User",
      },
    });

    const updateData = {
      email: duplicateEmail,
    };

    const response = await request(app)
      .put("/api/auth/users/me")
      .set("Authorization", `Bearer ${authToken}`)
      .send(updateData);

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Email already exists");

    // Clean up the duplicate user
    await db.user.delete({
      where: { id: duplicateUser.id },
    });
  });

  it("should return 400 for invalid email format", async () => {
    const updateData = {
      email: "invalid-email",
    };

    const response = await request(app)
      .put("/api/auth/users/me")
      .set("Authorization", `Bearer ${authToken}`)
      .send(updateData);

    expect(response.status).toBe(400);
    expect(response.body.error).toBeDefined();
  });

  it("should allow partial updates", async () => {
    const updateData = {
      name: "Updated Name Only",
    };

    const response = await request(app)
      .put("/api/auth/users/me")
      .set("Authorization", `Bearer ${authToken}`)
      .send(updateData);

    expect(response.status).toBe(200);
    expect(response.body.name).toBe(updateData.name);
    expect(response.body.email).toBeDefined();
    expect(response.body.phone).toBeDefined();
  });
});
